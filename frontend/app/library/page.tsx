"use client";


const TEXTBOOKS = [
  {
    title: "Sturdevant's Art & Science of Operative Dentistry",
    topics: ["Composite Resins", "Dental Adhesives", "Caries", "Amalgam"],
    chapters: 22,
    tier: "elite",
  },
  {
    title: "Neville's Oral and Maxillofacial Pathology",
    topics: ["Oral Malignancies", "Odontogenic Tumors", "Mucosal Diseases"],
    chapters: 17,
    tier: "elite",
  },
  {
    title: "Carranza's Clinical Periodontology",
    topics: ["Periodontium", "Biological Width", "Periodontal Disease", "Scaling"],
    chapters: 45,
    tier: "elite",
  },
  {
    title: "Cohen's Pathways of the Pulp",
    topics: ["Pulp Testing", "Root Canal Treatment", "Endodontic Surgery"],
    chapters: 30,
    tier: "elite",
  },
  {
    title: "Contemporary Orthodontics (Proffit)",
    topics: ["Cephalometrics", "Malocclusion", "Fixed Appliances"],
    chapters: 20,
    tier: "elite",
  },
  {
    title: "Pharmacology and Therapeutics for Dentistry",
    topics: ["Local Anesthetics", "Analgesics", "Antibiotics", "Sedation"],
    chapters: 35,
    tier: "pro",
  },
  {
    title: "Prosthodontic Treatment for Edentulous Patients (Zarb)",
    topics: ["Complete Dentures", "VDO", "Jaw Relations", "Impressions"],
    chapters: 25,
    tier: "elite",
  },
  {
    title: "White and Pharoah's Oral Radiology",
    topics: ["Radiographic Interpretation", "CBCT", "Panoramic", "Cephalometric"],
    chapters: 28,
    tier: "pro",
  },
];

export default function LibraryPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 dark:bg-slate-900">
      <main className="max-w-5xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-dall-900 dark:text-dall-100 mb-2">
            Textbook Library
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Browse indexed textbook resources used by the AI tutor. Content is
            chunked and citation-tagged for accurate SDLE exam preparation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {TEXTBOOKS.map((book) => (
            <div
              key={book.title}
              className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-dall-900 dark:text-dall-100 leading-snug pr-2">
                  {book.title}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                    book.tier === "elite"
                      ? "bg-accent-gold/20 text-accent-gold"
                      : "bg-dall-100 dark:bg-dall-900 text-dall-600 dark:text-dall-100"
                  }`}
                >
                  {book.tier}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {book.topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-400"
                  >
                    {topic}
                  </span>
                ))}
              </div>
              <div className="text-xs text-slate-500">
                {book.chapters} chapters indexed
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
