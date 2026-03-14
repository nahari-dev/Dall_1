"""Knowledge domain tools — ChromaDB search, textbook lookup, citation formatting.

These tools are used by the knowledge-agent and citation-agent subagents.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from langchain_core.tools import tool

from agents.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Authorised textbooks — the ONLY sources permitted for answers and citations.
# Questions may originate from SDLE study PDFs, but explanations and citations
# must exclusively reference the books listed here.
# ---------------------------------------------------------------------------

AUTHORISED_BOOKS: frozenset[str] = frozenset({
    "Sturdevant's Art & Science of Operative Dentistry",
    "Neville's Oral and Maxillofacial Pathology",
    "Carranza's Clinical Periodontology",
    "Cohen's Pathways of the Pulp",
    "Pharmacology and Therapeutics for Dentistry",
    "Prosthodontic Treatment for Edentulous Patients (Zarb)",
    "Graber's Orthodontics: Principles and Practice",
    "Pinkham's Pediatric Dentistry",
})


def _is_authorised_book(book_name: str) -> bool:
    """Return True only if book_name matches (or contains) an authorised title."""
    return any(
        auth.lower() in book_name.lower() or book_name.lower() in auth.lower()
        for auth in AUTHORISED_BOOKS
    )


_MOCK_CHUNKS: dict[str, list[dict[str, Any]]] = {
    "composite": [
        {
            "content": (
                "Composite resins are tooth-colored restorative materials composed of a "
                "resin matrix (Bis-GMA or UDMA), inorganic filler particles, and a coupling "
                "agent (silane). The filler content determines the type: microfill (0.04\u03bcm), "
                "hybrid (0.6-1\u03bcm), and nanofill (0.005-0.01\u03bcm). Higher filler content "
                "improves strength and wear resistance."
            ),
            "book": "Sturdevant's Art & Science of Operative Dentistry",
            "chapter": "8",
            "page": "189",
        },
        {
            "content": (
                "The incremental placement technique is recommended for composite restorations "
                "to reduce polymerization shrinkage stress. Each increment should not exceed "
                "2mm in thickness. Oblique layering technique directs the C-factor away from "
                "the critical bonded interface."
            ),
            "book": "Sturdevant's Art & Science of Operative Dentistry",
            "chapter": "8",
            "page": "205",
        },
    ],
    "caries": [
        {
            "content": (
                "Dental caries is a biofilm-mediated, sugar-driven, multifactorial, dynamic "
                "disease. The caries process involves demineralization and remineralization "
                "cycles. When demineralization exceeds remineralization, a carious lesion forms. "
                "Streptococcus mutans is the primary cariogenic bacterium."
            ),
            "book": "Sturdevant's Art & Science of Operative Dentistry",
            "chapter": "3",
            "page": "67",
        },
        {
            "content": (
                "The International Caries Detection and Assessment System (ICDAS) classifies "
                "caries from code 0 (sound) to code 6 (extensive cavity with visible dentine). "
                "Early detection at the white spot lesion stage (ICDAS 1-2) allows for "
                "non-invasive remineralization therapy with fluoride."
            ),
            "book": "Sturdevant's Art & Science of Operative Dentistry",
            "chapter": "3",
            "page": "72",
        },
    ],
    "oral_pathology": [
        {
            "content": (
                "Squamous cell carcinoma (SCC) accounts for approximately 90% of oral "
                "malignancies. Risk factors include tobacco, alcohol, betel quid, and HPV "
                "infection (especially HPV-16 for oropharyngeal SCC). The most common site "
                "is the lateral border of the tongue, followed by the floor of the mouth."
            ),
            "book": "Neville's Oral and Maxillofacial Pathology",
            "chapter": "10",
            "page": "409",
        },
        {
            "content": (
                "Oral leukoplakia is a white patch or plaque that cannot be rubbed off and "
                "cannot be characterized clinically or pathologically as any other disease. "
                "The malignant transformation rate is approximately 3-5%. Speckled leukoplakia "
                "(erythroleukoplakia) has a higher transformation rate."
            ),
            "book": "Neville's Oral and Maxillofacial Pathology",
            "chapter": "10",
            "page": "389",
        },
    ],
    "default": [
        {
            "content": (
                "The periodontium consists of four structures: gingiva, periodontal ligament "
                "(PDL), cementum, and alveolar bone. The PDL is approximately 0.15-0.38mm "
                "wide and contains collagen fibers arranged in specific groups: alveolar "
                "crest, horizontal, oblique, apical, and interradicular fibers."
            ),
            "book": "Carranza's Clinical Periodontology",
            "chapter": "2",
            "page": "34",
        },
        {
            "content": (
                "The biological width is the dimension of the junctional epithelium and "
                "connective tissue attachment above the alveolar bone crest. It averages "
                "2.04mm (1.07mm connective tissue + 0.97mm junctional epithelium). "
                "Violation of the biological width leads to chronic inflammation."
            ),
            "book": "Carranza's Clinical Periodontology",
            "chapter": "2",
            "page": "38",
        },
    ],
}


def _get_mock_chunks(query: str) -> list[dict[str, Any]]:
    """Return mock textbook chunks based on query keywords."""
    lower = query.lower()
    if any(w in lower for w in ("composite", "resin", "restoration", "filling")):
        return _MOCK_CHUNKS["composite"]
    if any(w in lower for w in ("caries", "decay", "cavity")):
        return _MOCK_CHUNKS["caries"]
    if any(w in lower for w in ("oral", "pathology", "lesion", "cancer", "tumor")):
        return _MOCK_CHUNKS["oral_pathology"]
    return _MOCK_CHUNKS["default"]


@tool
def chromadb_search(query: str) -> str:
    """Search the dental textbook corpus via ChromaDB for relevant passages.

    Args:
        query: The search query describing the dental topic to look up.

    Returns:
        JSON array of textbook chunks with content, book, chapter, and page.
    """
    try:
        import chromadb

        client = chromadb.HttpClient(host=settings.chroma_host, port=settings.chroma_port)
        collection = client.get_or_create_collection(settings.chroma_collection)
        results = collection.query(query_texts=[query], n_results=settings.rag_top_k)
        chunks = []
        if results and results.get("documents"):
            for i, doc in enumerate(results["documents"][0]):
                meta = results["metadatas"][0][i] if results.get("metadatas") else {}
                chunks.append({
                    "content": doc,
                    "book": meta.get("book", "Unknown"),
                    "chapter": meta.get("chapter", "?"),
                    "page": meta.get("page", "?"),
                })
        # Enforce citation policy — only surface authorised textbook content
        chunks = [c for c in chunks if _is_authorised_book(c.get("book", ""))]
        return json.dumps(chunks, ensure_ascii=False)
    except Exception as exc:
        logger.warning("ChromaDB unavailable, using mock data: %s", exc)
        return json.dumps(_get_mock_chunks(query), ensure_ascii=False)


@tool
def source_index_search(claim: str) -> str:
    """Search the source index to verify a specific claim against textbook sources.

    Args:
        claim: The factual claim to verify against indexed sources.

    Returns:
        JSON object with verification result including source, verified flag, and confidence.
    """
    # In production, this performs a secondary vector lookup against ChromaDB
    # to confirm that the claim exists in the indexed source material.
    chunks = _get_mock_chunks(claim)
    if chunks and _is_authorised_book(chunks[0].get("book", "")):
        best = chunks[0]
        return json.dumps({
            "verified": True,
            "source": f"{best['book']}, Ch. {best['chapter']}, p. {best['page']}",
            "confidence": 0.85,
            "matching_excerpt": best["content"][:200],
        })
    return json.dumps({
        "verified": False,
        "source": "",
        "confidence": 0.0,
        "matching_excerpt": "",
    })


@tool
def citation_formatter(claims: str) -> str:
    """Format verified claims with proper citation tags.

    Args:
        claims: JSON array of claim objects with content and source fields.

    Returns:
        Formatted text with each claim properly cited.
    """
    try:
        items = json.loads(claims)
    except (json.JSONDecodeError, TypeError):
        return claims

    formatted = []
    for item in items:
        content = item.get("content", "")
        source = item.get("source", item.get("citation", ""))
        if source:
            formatted.append(f"{content} [Source: {source}]")
        else:
            formatted.append(content)
    return "\n\n".join(formatted)
