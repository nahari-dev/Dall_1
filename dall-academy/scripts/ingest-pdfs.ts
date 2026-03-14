#!/usr/bin/env ts-node
/**
 * CLI tool to ingest SDLE dental PDFs into ChromaDB.
 *
 * Usage:
 *   npm run ingest -- --pdf-dir "/path/to/SDLE All Books"
 *   npm run ingest -- --pdf-dir "/path/to/SDLE All Books" --book "Carranza"
 *   npm run ingest -- --pdf-dir "/path/to/SDLE All Books" --dry-run
 */
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '..', '.env') })

import { BOOK_CATALOG, findBook, fallbackBook, type BookMeta } from './lib/book-catalog'
import { extractPdf } from './lib/pdf-extractor'
import { chunkPages, type Chunk } from './lib/chunker'
import { embedBatch, flushCache } from './lib/embedder'
import { upsertBatch, getCollectionCount, type UpsertItem } from './lib/chroma-client'

// ── Parse CLI args ──
function parseArgs() {
  const args = process.argv.slice(2)
  let pdfDir = ''
  let bookFilter = ''
  let dryRun = false

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--pdf-dir' && args[i + 1]) pdfDir = args[++i]
    else if (args[i] === '--book' && args[i + 1]) bookFilter = args[++i]
    else if (args[i] === '--dry-run') dryRun = true
  }

  if (!pdfDir) {
    console.error('Usage: npm run ingest -- --pdf-dir "/path/to/PDFs" [--book "name"] [--dry-run]')
    process.exit(1)
  }

  return { pdfDir, bookFilter, dryRun }
}

// ── Main ──
async function main() {
  const { pdfDir, bookFilter, dryRun } = parseArgs()

  console.log('╔══════════════════════════════════════════╗')
  console.log('║  DALL ACADEMY — PDF KNOWLEDGE INGESTION  ║')
  console.log('╚══════════════════════════════════════════╝')
  console.log(`\n📁 Source: ${pdfDir}`)
  console.log(`🔧 Mode: ${dryRun ? 'DRY RUN (no embedding/storage)' : 'FULL INGESTION'}`)

  // Find PDF files
  const files = fs.readdirSync(pdfDir).filter((f) => f.toLowerCase().endsWith('.pdf'))
  console.log(`📚 Found ${files.length} PDF files\n`)

  // Filter by book name if specified
  const filteredFiles = bookFilter
    ? files.filter((f) => {
        const meta = findBook(f)
        return meta && (meta.shortName.toLowerCase().includes(bookFilter.toLowerCase()) ||
               meta.title.toLowerCase().includes(bookFilter.toLowerCase()))
      })
    : files

  if (filteredFiles.length === 0) {
    console.error(`No matching PDFs found${bookFilter ? ` for filter "${bookFilter}"` : ''}.`)
    process.exit(1)
  }

  let totalChunks = 0
  let totalTokens = 0
  let totalEmbedded = 0
  const bookStats: { book: string; pages: number; chunks: number; tokens: number }[] = []

  for (let i = 0; i < filteredFiles.length; i++) {
    const filename = filteredFiles[i]
    const filePath = path.join(pdfDir, filename)
    const meta: BookMeta = findBook(filename) ?? fallbackBook(filename)

    console.log(`\n[${ i + 1}/${filteredFiles.length}] 📖 ${meta.shortName}`)
    console.log(`    Title: ${meta.title}`)
    console.log(`    Sections: ${meta.sdleSections.join(', ')}`)

    // Step 1: Extract
    console.log('    ⏳ Extracting text...')
    const extracted = await extractPdf(filePath)
    console.log(`    ✅ Extracted ${extracted.pages.length} pages`)

    if (extracted.pages.length === 0) {
      console.log('    ⚠️  No text extracted — skipping (might be scanned/image PDF)')
      continue
    }

    // Step 2: Chunk
    console.log('    ⏳ Chunking...')
    const chunks = chunkPages(extracted.pages, {
      bookTitle: meta.title,
      bookShortName: meta.shortName,
      sdleSections: meta.sdleSections,
    })
    const chunkTokens = chunks.reduce((sum, c) => sum + c.tokenCount, 0)
    console.log(`    ✅ ${chunks.length} chunks (${chunkTokens.toLocaleString()} est. tokens)`)

    totalChunks += chunks.length
    totalTokens += chunkTokens
    bookStats.push({
      book: meta.shortName,
      pages: extracted.pages.length,
      chunks: chunks.length,
      tokens: chunkTokens,
    })

    if (dryRun) {
      console.log('    ⏭️  Dry run — skipping embedding & storage')
      continue
    }

    // Step 3: Embed
    console.log(`    ⏳ Embedding ${chunks.length} chunks...`)
    const embedItems = chunks.map((c) => ({ id: c.id, text: c.text }))

    // Process in sub-batches to show progress
    const SUB_BATCH = 200
    const allEmbeddings: { id: string; embedding: number[] }[] = []

    for (let j = 0; j < embedItems.length; j += SUB_BATCH) {
      const batch = embedItems.slice(j, j + SUB_BATCH)
      const embeddings = await embedBatch(batch)
      allEmbeddings.push(...embeddings)
      const pct = Math.round(((j + batch.length) / embedItems.length) * 100)
      process.stdout.write(`\r    ⏳ Embedding... ${pct}%`)
    }
    console.log(`\n    ✅ Embedded ${allEmbeddings.length} chunks`)
    totalEmbedded += allEmbeddings.length

    // Step 4: Store in ChromaDB
    console.log('    ⏳ Storing in ChromaDB...')
    const upsertItems: UpsertItem[] = chunks.map((chunk, idx) => ({
      id: chunk.id,
      embedding: allEmbeddings[idx].embedding,
      document: chunk.text,
      metadata: {
        book_title: chunk.bookTitle,
        book_short: chunk.bookShortName,
        chapter: chunk.chapter,
        section_heading: chunk.sectionHeading,
        page_start: chunk.pageStart,
        page_end: chunk.pageEnd,
        sdle_section: chunk.sdleSections[0] ?? 'GENERAL',
        token_count: chunk.tokenCount,
      },
    }))

    await upsertBatch(upsertItems)
    console.log('    ✅ Stored in ChromaDB')
  }

  // ── Summary ──
  console.log('\n\n' + '═'.repeat(60))
  console.log('📊 INGESTION SUMMARY')
  console.log('═'.repeat(60))
  console.log(`\nBooks processed:  ${bookStats.length}`)
  console.log(`Total chunks:     ${totalChunks.toLocaleString()}`)
  console.log(`Total tokens:     ${totalTokens.toLocaleString()}`)
  console.log(`Chunks embedded:  ${totalEmbedded.toLocaleString()}`)
  console.log(`Est. embed cost:  ~$${((totalTokens / 1_000_000) * 0.02).toFixed(2)}`)

  console.log('\nPer-book breakdown:')
  console.log('─'.repeat(60))
  for (const stat of bookStats) {
    console.log(`  ${stat.book.padEnd(25)} ${String(stat.pages).padStart(5)} pages  ${String(stat.chunks).padStart(5)} chunks  ${stat.tokens.toLocaleString().padStart(8)} tokens`)
  }

  if (!dryRun) {
    try {
      const count = await getCollectionCount()
      console.log(`\n🗄️  ChromaDB collection total: ${count.toLocaleString()} chunks`)
    } catch (e) {
      console.log('\n⚠️  Could not read ChromaDB count')
    }
  }

  flushCache()
  console.log('\n✅ Done!')
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err)
  process.exit(1)
})
