import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

const SAMPLE_QUESTIONS = [
  {
    qnum: 'Q-0001',
    section: 'PERIODONTICS' as const,
    difficulty: 'INTERMEDIATE' as const,
    textEn: 'According to the 2017 World Workshop classification, Stage II Grade B periodontitis is characterized by which of the following findings?',
    options: {
      a: 'Radiographic bone loss extending to apical third of root',
      b: 'Tooth loss due to periodontitis of 5 or more teeth',
      c: 'Interdental CAL of 3-4mm with no tooth loss due to periodontitis',
      d: 'Maximum pocket depth of 3mm or less with no bone loss',
    },
    correctKey: 'c',
    explanationEn: 'Stage II Grade B periodontitis is defined by interdental CAL of 3-4mm, radiographic bone loss in the coronal third (15-33%), probing depth ≤5mm, and no tooth loss due to periodontitis. Grade B indicates a moderate rate of progression, with insufficient evidence for rapid or slow progression. The 2017 classification replaced the previous staging of slight, moderate, and severe periodontitis.',
    reference: "Carranza's Clinical Periodontology, 13th ed., Chapter 7, p. 148",
    tags: ['classification', '2017-staging', 'stage-II'],
  },
  {
    qnum: 'Q-0002',
    section: 'ENDODONTICS' as const,
    difficulty: 'INTERMEDIATE' as const,
    textEn: 'A patient presents with a maxillary first molar (tooth 16 in FDI notation) that has been throbbing spontaneously for 3 days. The tooth is exquisitely tender to percussion and the patient reports the pain lingers for more than 30 seconds after cold testing. Which diagnosis is most appropriate?',
    options: {
      a: 'Reversible pulpitis',
      b: 'Irreversible pulpitis with symptomatic apical periodontitis',
      c: 'Pulp necrosis with asymptomatic apical periodontitis',
      d: 'Normal pulp with symptomatic periapical abscess',
    },
    correctKey: 'b',
    explanationEn: 'The clinical findings — spontaneous throbbing pain, lingering pain after cold testing (>30 seconds), and percussion sensitivity — indicate irreversible pulpitis with symptomatic apical periodontitis. Lingering pain after thermal testing indicates irreversible inflammation of the pulp. The percussion sensitivity indicates inflammation in the periapical tissues. Reversible pulpitis would show brief, not lingering, pain response.',
    reference: "Cohen's Pathways of the Pulp, 11th ed., Chapter 1, p. 28",
    tags: ['pulpitis', 'diagnosis', 'endodontic-diagnosis'],
  },
  {
    qnum: 'Q-0003',
    section: 'RESTORATIVE' as const,
    difficulty: 'EASY' as const,
    textEn: 'Which of the following is the MOST important factor in determining the success of a dentin bonding system?',
    options: {
      a: 'The filler content of the bonding agent',
      b: 'Adequate hybridization of the demineralized dentin collagen network',
      c: 'The viscosity of the adhesive monomer',
      d: 'The shade of the composite resin material used',
    },
    correctKey: 'b',
    explanationEn: "The hybrid layer formation is the most critical factor in dentin bonding success. Adequate hybridization of the demineralized dentin collagen involves resin monomers penetrating the collagen network exposed by acid etching, forming a resin-collagen interdiffusion zone (hybrid layer). This was first described by Nakabayashi and remains the basis of contemporary adhesive dentistry. The hybrid layer provides micromechanical retention and protects the exposed collagen.",
    reference: "Sturdevant's Art and Science of Operative Dentistry, 7th ed., Chapter 4, p. 112",
    tags: ['bonding', 'hybrid-layer', 'adhesive-dentistry'],
  },
  {
    qnum: 'Q-0004',
    section: 'ORTHO_PEDO' as const,
    difficulty: 'INTERMEDIATE' as const,
    textEn: "According to Angle's classification, a Class II Division 1 malocclusion is characterized by:",
    options: {
      a: 'Mesiobuccal cusp of upper first molar occludes with buccal groove of lower first molar',
      b: 'Mesiobuccal cusp of upper first molar occludes mesial to buccal groove of lower first molar with proclined maxillary incisors',
      c: 'Mesiobuccal cusp of upper first molar occludes mesial to buccal groove of lower first molar with retroclined upper incisors',
      d: 'Mesiobuccal cusp of upper first molar occludes distal to buccal groove of lower first molar',
    },
    correctKey: 'b',
    explanationEn: "Angle's Class II Division 1 malocclusion: the upper molar is in a distal position relative to the lower molar (mesiobuccal cusp of upper first molar occludes mesial to the buccal groove of the lower first molar), AND the maxillary incisors are proclined (increased overjet). In Class II Division 2, the upper molars are also distally positioned but the upper central incisors are retroclined. Class I has the mesiobuccal cusp of the upper molar occluding in the buccal groove of the lower molar.",
    reference: "Proffit's Contemporary Orthodontics, 6th ed., Chapter 6, p. 179",
    tags: ['angle-classification', 'class-II', 'malocclusion'],
  },
  {
    qnum: 'Q-0005',
    section: 'ORAL_MEDICINE' as const,
    difficulty: 'INTERMEDIATE' as const,
    textEn: 'A patient requires extraction of tooth 46 (FDI) under inferior alveolar nerve block. Which landmark is used to identify the height of the mandibular foramen for the standard Halsted technique?',
    options: {
      a: 'The pterygomandibular raphe at its midpoint',
      b: 'The coronoid notch at the level of the occlusal plane of the mandibular molars',
      c: 'The retromolar pad at its superior border',
      d: 'The internal oblique ridge at the level of the premolars',
    },
    correctKey: 'b',
    explanationEn: "The Halsted technique for inferior alveolar nerve block uses the coronoid notch (deepest part of the anterior border of the ramus) as the key landmark, with the needle directed at the level of the mandibular occlusal plane. The barrel of the syringe is positioned over the premolars on the opposite side. The injection is made approximately 1-1.5cm above the mandibular occlusal plane, targeting the pterygomandibular space. The mandibular foramen is located at approximately the level of the mandibular occlusal plane.",
    reference: "Malamed's Handbook of Local Anesthesia, 7th ed., Chapter 14, p. 228",
    tags: ['local-anesthesia', 'IAN-block', 'Halsted', 'mandibular'],
  },
  {
    qnum: 'Q-0006',
    section: 'PERIODONTICS' as const,
    difficulty: 'ADVANCED' as const,
    textEn: 'In the treatment of a Grade C Stage III periodontitis patient with a systemic risk factor of poorly controlled type 2 diabetes (HbA1c 10%), which of the following best describes the expected periodontal treatment outcome?',
    options: {
      a: 'Same as healthy patients with periodontal treatment reducing HbA1c by 1%',
      b: 'Impaired healing response and reduced treatment outcomes compared to systemically healthy patients',
      c: 'No difference in treatment outcomes but contraindicated for surgical intervention',
      d: 'Enhanced bone regeneration due to increased growth factor production',
    },
    correctKey: 'b',
    explanationEn: 'Poorly controlled diabetes (HbA1c >7%) significantly impairs periodontal treatment outcomes due to: (1) impaired neutrophil function reducing bacterial clearance, (2) reduced fibroblast activity impairing wound healing, (3) advanced glycation end products (AGEs) disrupting collagen synthesis, (4) microangiopathy reducing tissue perfusion. Periodontal treatment in diabetic patients has shown modest improvement in glycemic control (approximately 0.4% reduction in HbA1c per meta-analyses), but treatment outcomes are inferior to non-diabetic patients. Grade C periodontitis classification indicates rapid rate of progression, often associated with systemic conditions like diabetes.',
    reference: "Carranza's Clinical Periodontology, 13th ed., Chapter 13, p. 321",
    tags: ['diabetes', 'systemic-factors', 'grade-C', 'treatment-outcomes'],
  },
  {
    qnum: 'Q-0007',
    section: 'ENDODONTICS' as const,
    difficulty: 'EASY' as const,
    textEn: 'The master apical file (MAF) size for shaping a root canal should ideally be based on:',
    options: {
      a: 'The pre-operative radiographic estimate of canal width',
      b: 'The tactile sensation of binding at the working length confirmed by multiple file sizes',
      c: 'Always using a size 35 file regardless of canal anatomy',
      d: 'The age of the patient, with larger sizes for older patients',
    },
    correctKey: 'b',
    explanationEn: "The master apical file (MAF) is determined by tactile sense — identifying the first file that binds at the working length. Starting from the smallest file and progressively enlarging until binding is felt confirms the MAF size. The 'gauging and tugging' technique confirms the MAF: the file should tug when rotated 180° at working length, not pass through freely. Pre-operative radiographic estimates provide initial guidance but tactile feedback during instrumentation is the definitive method. Adequate apical preparation minimizes microleakage and bacterial recontamination.",
    reference: "Cohen's Pathways of the Pulp, 11th ed., Chapter 8, p. 204",
    tags: ['instrumentation', 'MAF', 'working-length', 'shaping'],
  },
  {
    qnum: 'Q-0008',
    section: 'RESTORATIVE' as const,
    difficulty: 'ADVANCED' as const,
    textEn: 'A patient with a cracked tooth syndrome on tooth 36 (FDI notation) has cracks extending from the occlusal surface vertically through the dentin but not beyond the CEJ. The patient reports sharp pain on biting that resolves immediately. What is the most appropriate treatment?',
    options: {
      a: 'Immediate extraction to prevent further spread',
      b: 'Full coverage restoration (crown) to prevent further crack propagation',
      c: 'Root canal treatment followed by extraction',
      d: 'Occlusal equilibration only with regular monitoring',
    },
    correctKey: 'b',
    explanationEn: 'Cracked tooth syndrome with cracks confined to coronal dentin (above the CEJ) and classic symptomatology (sharp pain on biting, immediate relief) is ideally treated with a cuspal coverage restoration (full crown). The crown functions to bind the fractured cusps together, preventing crack propagation and eliminating the flex-separate-close cycle that causes pain. If the pulp is vital and there are no periapical changes, root canal treatment is not indicated initially. Incomplete vertical crown fractures have a favorable prognosis with cuspal coverage if they do not extend below the CEJ.',
    reference: "Sturdevant's Art and Science of Operative Dentistry, 7th ed., Chapter 15, p. 421",
    tags: ['cracked-tooth', 'crack-propagation', 'crown', 'prognosis'],
  },
  {
    qnum: 'Q-0009',
    section: 'ORTHO_PEDO' as const,
    difficulty: 'EASY' as const,
    textEn: "According to the International Standard ISO 3950 (FDI two-digit tooth notation), which number denotes the maxillary right second premolar?",
    options: {
      a: '24',
      b: '15',
      c: '14',
      d: '25',
    },
    correctKey: 'b',
    explanationEn: 'In the FDI two-digit notation system: The first digit indicates the quadrant (1=maxillary right, 2=maxillary left, 3=mandibular left, 4=mandibular right) and the second digit indicates the tooth position from the midline (1=central incisor through 8=third molar). For the maxillary right second premolar: quadrant 1 (maxillary right) + position 5 (second premolar) = tooth 15. Premolars are positions 4 and 5. Note: The SDLE uses FDI notation exclusively, not Universal (American) or Palmer notation.',
    reference: "Proffit's Contemporary Orthodontics, 6th ed., Chapter 1, p. 18",
    tags: ['FDI-notation', 'tooth-numbering', 'basic-sciences'],
  },
  {
    qnum: 'Q-0010',
    section: 'ORAL_MEDICINE' as const,
    difficulty: 'INTERMEDIATE' as const,
    textEn: 'A 45-year-old male presents with a 2-cm ulcer on the lateral border of the tongue present for 3 weeks. He smokes 20 cigarettes/day and consumes alcohol regularly. The ulcer has indurated, rolled borders. What is the most appropriate next step?',
    options: {
      a: 'Prescribe antifungal medication and review in 2 weeks',
      b: 'Advise smoking cessation and review in 6 weeks',
      c: 'Incisional biopsy with urgent histopathological examination',
      d: 'Prescribe chlorhexidine mouthwash and analgesics for 2 weeks',
    },
    correctKey: 'c',
    explanationEn: 'Any oral ulcer persisting beyond 2-3 weeks in a high-risk patient (smoking, alcohol, older age, male sex) with indurated borders MUST be biopsied urgently to rule out squamous cell carcinoma (SCC). The lateral border of the tongue is the most common site for oral SCC. Clinical features suspicious for malignancy: duration >3 weeks, induration, rolled/everted borders, firm or fixed on palpation, painless initially (paradoxically). Biopsy protocol: incisional biopsy from the most suspicious area (rolled border/center), avoiding necrotic center or superficial slough. NEVER delay biopsy with empirical treatment in high-risk patients.',
    reference: 'Contemporary Oral and Maxillofacial Surgery, 7th ed., Chapter 22, p. 467',
    tags: ['oral-cancer', 'SCC', 'biopsy', 'diagnosis', 'high-risk'],
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123!', 12)
  const admin = await db.user.upsert({
    where: { email: 'admin@dall-academy.com' },
    update: {},
    create: {
      name: 'Dall Admin',
      email: 'admin@dall-academy.com',
      password: adminPassword,
      role: 'ADMIN',
      plan: 'LIFE',
      memory: {
        create: {
          displayName: 'Admin',
          onboardingDone: true,
          weakSections: [],
          strongSections: [],
          lastTopicsAsked: [],
          confusedTopics: [],
          masteredTopics: [],
          adminTags: [],
        },
      },
    },
  })
  console.log(`✓ Admin user: admin@dall-academy.com (password: admin123!)`)

  // Create demo student
  const studentPassword = await bcrypt.hash('student123!', 12)
  const student = await db.user.upsert({
    where: { email: 'demo@dall-academy.com' },
    update: {},
    create: {
      name: 'Dr. Ahmed Al-Rashidi',
      email: 'demo@dall-academy.com',
      password: studentPassword,
      role: 'STUDENT',
      plan: 'FREE',
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      memory: {
        create: {
          displayName: 'Dr. Ahmed',
          preferredLang: 'en',
          targetSpecialty: 'General Dentistry',
          learningStyle: 'clinical',
          dailyGoal: 20,
          onboardingDone: true,
          weakSections: ['PERIODONTICS', 'ENDODONTICS'],
          strongSections: ['RESTORATIVE'],
          lastTopicsAsked: ['periodontitis', 'pulpitis'],
          confusedTopics: ['periodontitis'],
          masteredTopics: ['FDI notation'],
          adminTags: [],
          estimatedScore: 490,
          currentStreak: 3,
          questionsToday: 8,
          totalStudyHours: 12.5,
        },
      },
    },
  })
  console.log(`✓ Demo student: demo@dall-academy.com (password: student123!)`)

  // Seed questions
  let questionCount = 0
  for (const q of SAMPLE_QUESTIONS) {
    await db.question.upsert({
      where: { qnum: q.qnum },
      update: {},
      create: {
        ...q,
        textAr: undefined,
        explanationAr: undefined,
      },
    })
    questionCount++
  }
  console.log(`✓ Seeded ${questionCount} questions`)

  // Create some mock progress for demo student
  const sections = ['PERIODONTICS', 'ENDODONTICS', 'RESTORATIVE', 'ORTHO_PEDO', 'ORAL_MEDICINE'] as const
  for (const section of sections) {
    await db.userProgress.upsert({
      where: { userId_section: { userId: student.id, section } },
      update: {},
      create: {
        userId: student.id,
        section,
        answered: Math.floor(Math.random() * 30) + 5,
        correct: Math.floor(Math.random() * 20) + 2,
        mastery: Math.random() * 0.8 + 0.1,
      },
    })
  }
  console.log(`✓ Created demo progress data`)

  console.log('\n✅ Seeding complete!')
  console.log('\nAdmin: admin@dall-academy.com / admin123!')
  console.log('Student: demo@dall-academy.com / student123!')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
