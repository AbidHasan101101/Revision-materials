// HSC Science Revision Tracker - Full Dataset
// Extracted and transcribed with 100% accuracy from official syllabus structure.
// 6 Revision Stages per topic:
// 1. archive: Archive Class
// 2. note: Revision Note
// 3. recall: Active Recall Card
// 4. mcq: MCQ Exam
// 5. live: Live Class
// 6. testpaper: Test Paper Solving (On your own)

const REVISION_STAGES = [
  { id: 'archive', title: 'Archive Class', titleBn: 'আর্কাইভ ক্লাস', short: 'Archive', icon: '▶' },
  { id: 'note', title: 'Revision Note', titleBn: 'রিভিশন নোট', short: 'Note', icon: '📝' },
  { id: 'recall', title: 'Active Recall Card', titleBn: 'অ্যাক্টিভ রিকল কার্ড', short: 'Recall', icon: '🧠' },
  { id: 'mcq', title: 'MCQ Exam', titleBn: 'এমসিকিউ এক্সাম', short: 'MCQ', icon: '✓' },
  { id: 'live', title: 'Live Class', titleBn: 'লাইভ ক্লাস', short: 'Live', icon: '📡' },
  { id: 'testpaper', title: 'Test Paper Solving', titleBn: 'টেস্ট পেপার সলভিং', short: 'Test Paper', icon: '📄', subtitle: '(On your own)' }
];

const SYLLABUS_DATA = [
  // 1. পদার্থবিজ্ঞান (Physics)
  {
    id: 'physics',
    name: 'পদার্থবিজ্ঞান',
    nameEn: 'Physics',
    icon: '⚡',
    sections: [
      {
        id: 'phy-1',
        paper: 1,
        name: '১ম পত্র',
        nameEn: '1st Paper',
        chapters: [
          { id: 'phy1_1', no: 1, title: 'ভৌত জগৎ ও পরিমাপ', titleEn: 'Physical World & Measurement' },
          { id: 'phy1_2', no: 2, title: 'ভেক্টর', titleEn: 'Vectors' },
          { id: 'phy1_3', no: 3, title: 'গতিবিদ্যা', titleEn: 'Dynamics' },
          { id: 'phy1_4', no: 4, title: 'নিউটনিয়ান বলবিদ্যা', titleEn: 'Newtonian Mechanics' },
          { id: 'phy1_5', no: 5, title: 'কাজ, শক্তি ও ক্ষমতা', titleEn: 'Work, Energy & Power' },
          { id: 'phy1_6', no: 6, title: 'মহাকর্ষ ও অভিকর্ষ', titleEn: 'Gravitation & Gravity' },
          { id: 'phy1_7', no: 7, title: 'পদার্থের গাঠনিক ধর্ম', titleEn: 'Structural Properties of Matter' },
          { id: 'phy1_8', no: 8, title: 'পর্যায়বৃত্ত গতি', titleEn: 'Periodic Motion' },
          { id: 'phy1_9', no: 9, title: 'তরঙ্গ', titleEn: 'Waves' },
          { id: 'phy1_10', no: 10, title: 'আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব', titleEn: 'Ideal Gas & Kinetic Theory' }
        ]
      },
      {
        id: 'phy-2',
        paper: 2,
        name: '২য় পত্র',
        nameEn: '2nd Paper',
        chapters: [
          { id: 'phy2_11', no: 11, title: 'তাপগতিবিদ্যা', titleEn: 'Thermodynamics' },
          { id: 'phy2_12', no: 12, title: 'স্থির তড়িৎ', titleEn: 'Static Electricity' },
          { id: 'phy2_13', no: 13, title: 'চল তড়িৎ', titleEn: 'Current Electricity' },
          { id: 'phy2_14', no: 14, title: 'তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব', titleEn: 'Magnetic Effects of Current & Magnetism' },
          { id: 'phy2_15', no: 15, title: 'তাড়িতচৌম্বকীয় আবেশ ও দিক পরিবর্তী প্রবাহ', titleEn: 'Electromagnetic Induction & AC' },
          { id: 'phy2_16', no: 16, title: 'জ্যামিতিক আলোকবিজ্ঞান', titleEn: 'Geometrical Optics' },
          { id: 'phy2_17', no: 17, title: 'ভৌত আলোকবিজ্ঞান', titleEn: 'Physical Optics' },
          { id: 'phy2_18', no: 18, title: 'আধুনিক পদার্থবিজ্ঞানের সূচনা', titleEn: 'Introduction to Modern Physics' },
          { id: 'phy2_19', no: 19, title: 'পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান', titleEn: 'Atomic Models & Nuclear Physics' },
          { id: 'phy2_20', no: 20, title: 'সেমিকন্ডাক্টর ও ইলেকট্রনিক্স', titleEn: 'Semiconductors & Electronics' },
          { id: 'phy2_21', no: 21, title: 'জ্যোতির্বিজ্ঞান', titleEn: 'Astronomy' }
        ]
      }
    ]
  },

  // 2. রসায়ন (Chemistry)
  {
    id: 'chemistry',
    name: 'রসায়ন',
    nameEn: 'Chemistry',
    icon: '🧪',
    sections: [
      {
        id: 'chem-1',
        paper: 1,
        name: '১ম পত্র',
        nameEn: '1st Paper',
        chapters: [
          { id: 'chem1_1', no: 1, title: 'ল্যাবরেটরির নিরাপদ ব্যবহার', titleEn: 'Safe Use of Laboratory' },
          { id: 'chem1_2', no: 2, title: 'গুণগত রসায়ন', titleEn: 'Qualitative Chemistry' },
          { id: 'chem1_3', no: 3, title: 'মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন', titleEn: 'Periodic Properties & Chemical Bonding' },
          { id: 'chem1_4', no: 4, title: 'রাসায়নিক পরিবর্তন', titleEn: 'Chemical Changes' },
          { id: 'chem1_5', no: 5, title: 'কর্মমুখী রসায়ন', titleEn: 'Applied Chemistry' }
        ]
      },
      {
        id: 'chem-2',
        paper: 2,
        name: '২য় পত্র',
        nameEn: '2nd Paper',
        chapters: [
          { id: 'chem2_6', no: 6, title: 'পরিবেশ রসায়ন', titleEn: 'Environmental Chemistry' },
          { id: 'chem2_7', no: 7, title: 'জৈব রসায়ন', titleEn: 'Organic Chemistry' },
          { id: 'chem2_8', no: 8, title: 'পরিমাণগত রসায়ন', titleEn: 'Quantitative Chemistry' },
          { id: 'chem2_9', no: 9, title: 'তড়িৎ রসায়ন', titleEn: 'Electrochemistry' },
          { id: 'chem2_10', no: 10, title: 'অর্থনৈতিক রসায়ন', titleEn: 'Economic Chemistry' }
        ]
      }
    ]
  },

  // 3. উচ্চতর গণিত (Higher Mathematics)
  {
    id: 'highermath',
    name: 'উচ্চতর গণিত',
    nameEn: 'Higher Mathematics',
    icon: '📐',
    sections: [
      {
        id: 'hm-1',
        paper: 1,
        name: '১ম পত্র',
        nameEn: '1st Paper',
        chapters: [
          { id: 'hm1_1', no: 1, title: 'ম্যাট্রিক্স ও নির্ণায়ক', titleEn: 'Matrices & Determinants' },
          { id: 'hm1_2', no: 2, title: 'ভেক্টর', titleEn: 'Vectors' },
          { id: 'hm1_3', no: 3, title: 'সরলরেখা', titleEn: 'Straight Lines' },
          { id: 'hm1_4', no: 4, title: 'বৃত্ত', titleEn: 'Circles' },
          { id: 'hm1_5', no: 5, title: 'বিন্যাস ও সমাবেশ', titleEn: 'Permutations & Combinations' },
          { id: 'hm1_6', no: 6, title: 'ত্রিকোণমিতিক অনুপাত', titleEn: 'Trigonometric Ratios' },
          { id: 'hm1_7', no: 7, title: 'সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত', titleEn: 'Trigonometric Ratios of Associated Angles' },
          { id: 'hm1_8', no: 8, title: 'ফাংশন ও ফাংশনের লেখচিত্র', titleEn: 'Functions & Graphs' },
          { id: 'hm1_9', no: 9, title: 'অন্তরীকরণ (ক্যালকুলাস)', titleEn: 'Differentiation (Calculus)' },
          { id: 'hm1_10', no: 10, title: 'যোগজীকরণ (ক্যালকুলাস)', titleEn: 'Integration (Calculus)' }
        ]
      },
      {
        id: 'hm-2',
        paper: 2,
        name: '২য় পত্র',
        nameEn: '2nd Paper',
        chapters: [
          { id: 'hm2_11', no: 11, title: 'বাস্তব সংখ্যা ও অসমতা', titleEn: 'Real Numbers & Inequalities' },
          { id: 'hm2_12', no: 12, title: 'যোগাশ্রয়ী প্রোগ্রাম', titleEn: 'Linear Programming' },
          { id: 'hm2_13', no: 13, title: 'জটিল সংখ্যা', titleEn: 'Complex Numbers' },
          { id: 'hm2_14', no: 14, title: 'বহুপদী ও বহুপদী সমীকরণ', titleEn: 'Polynomials & Polynomial Equations' },
          { id: 'hm2_15', no: 15, title: 'দ্বিপদী বিস্তৃতি', titleEn: 'Binomial Expansion' },
          { id: 'hm2_16', no: 16, title: 'কণিক', titleEn: 'Conics' },
          { id: 'hm2_17', no: 17, title: 'বিপরীত ত্রিকোণমিতিক ফাংশন ও ত্রিকোণমিতিক সমীকরণ', titleEn: 'Inverse Trig Functions & Equations' },
          { id: 'hm2_18', no: 18, title: 'স্থিতিবিদ্যা', titleEn: 'Statics' },
          { id: 'hm2_19', no: 19, title: 'সমতলে বস্তুকণার গতি', titleEn: 'Motion of Particles in a Plane' },
          { id: 'hm2_20', no: 20, title: 'বিস্তার পরিমাপ ও সম্ভাবনা', titleEn: 'Measures of Dispersion & Probability' }
        ]
      }
    ]
  },

  // 4. জীববিজ্ঞান (Biology)
  {
    id: 'biology',
    name: 'জীববিজ্ঞান',
    nameEn: 'Biology',
    icon: '🧬',
    sections: [
      {
        id: 'bio-1',
        paper: 1,
        name: '১ম পত্র — উদ্ভিদবিজ্ঞান',
        nameEn: '1st Paper — Botany',
        chapters: [
          { id: 'bio1_1', no: 1, title: 'কোষ ও এর গঠন', titleEn: 'Cell and its Structure' },
          { id: 'bio1_2', no: 2, title: 'কোষ বিভাজন', titleEn: 'Cell Division' },
          { id: 'bio1_3', no: 3, title: 'কোষ রসায়ন', titleEn: 'Cell Chemistry' },
          { id: 'bio1_4', no: 4, title: 'অণুজীব', titleEn: 'Microorganisms' },
          { id: 'bio1_5', no: 5, title: 'শৈবাল ও ছত্রাক', titleEn: 'Algae & Fungi' },
          { id: 'bio1_6', no: 6, title: 'ব্রায়োফাইটা ও টেরিডোফাইটা', titleEn: 'Bryophyta & Pteridophyta' },
          { id: 'bio1_7', no: 7, title: 'নগ্নবীজী ও আবৃতবীজী উদ্ভিদ', titleEn: 'Gymnosperms & Angiosperms' },
          { id: 'bio1_8', no: 8, title: 'টিস্যু ও টিস্যুতন্ত্র', titleEn: 'Tissue & Tissue Systems' },
          { id: 'bio1_9', no: 9, title: 'উদ্ভিদ শারীরতত্ত্ব', titleEn: 'Plant Physiology' },
          { id: 'bio1_10', no: 10, title: 'উদ্ভিদ প্রজনন', titleEn: 'Plant Reproduction' },
          { id: 'bio1_11', no: 11, title: 'জীবপ্রযুক্তি', titleEn: 'Biotechnology' },
          { id: 'bio1_12', no: 12, title: 'জীবের পরিবেশ, বিস্তার ও সংরক্ষণ', titleEn: 'Environment, Distribution & Conservation' }
        ]
      },
      {
        id: 'bio-2',
        paper: 2,
        name: '২য় পত্র — প্রাণিবিজ্ঞান',
        nameEn: '2nd Paper — Zoology',
        chapters: [
          { id: 'bio2_13', no: 13, title: 'প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস', titleEn: 'Animal Diversity & Classification' },
          { id: 'bio2_14', no: 14, title: 'প্রাণীর পরিচিতি', titleEn: 'Introduction to Animals' },
          { id: 'bio2_15', no: 15, title: 'মানব শারীরতত্ত্ব: পরিপাক ও শোষণ', titleEn: 'Human Physiology: Digestion & Absorption' },
          { id: 'bio2_16', no: 16, title: 'মানব শারীরতত্ত্ব: রক্ত ও সংবহন', titleEn: 'Human Physiology: Blood & Circulation' },
          { id: 'bio2_17', no: 17, title: 'মানব শারীরতত্ত্ব: শ্বসন ও শ্বাসক্রিয়া', titleEn: 'Human Physiology: Respiration & Breathing' },
          { id: 'bio2_18', no: 18, title: 'মানব শারীরতত্ত্ব: বর্জ্য ও নিষ্কাশন', titleEn: 'Human Physiology: Excretion' },
          { id: 'bio2_19', no: 19, title: 'মানব শারীরতত্ত্ব: চলন ও অঙ্গচালনা', titleEn: 'Human Physiology: Locomotion & Movement' },
          { id: 'bio2_20', no: 20, title: 'মানব শারীরতত্ত্ব: সমন্বয় ও নিয়ন্ত্রণ', titleEn: 'Human Physiology: Coordination & Control' },
          { id: 'bio2_21', no: 21, title: 'মানব জীবনের ধারাবাহিকতা', titleEn: 'Continuity of Human Life' },
          { id: 'bio2_22', no: 22, title: 'মানবদেহের প্রতিরক্ষা', titleEn: 'Human Body Defense (Immunology)' },
          { id: 'bio2_23', no: 23, title: 'জিন তত্ত্ব ও বিবর্তন', titleEn: 'Genetics & Evolution' },
          { id: 'bio2_24', no: 24, title: 'প্রাণীর আচরণ', titleEn: 'Animal Behavior' }
        ]
      }
    ]
  },

  // 5. বাংলা (Bangla)
  {
    id: 'bangla',
    name: 'বাংলা',
    nameEn: 'Bangla',
    icon: '🇧🇩',
    sections: [
      {
        id: 'ban-1-gadya',
        paper: 1,
        name: '১ম পত্র — গদ্য',
        nameEn: '1st Paper — Prose',
        chapters: [
          { id: 'ban1_1', no: 1, title: 'বাঙ্গালার নব্য লেখকদিগের প্রতি নিবেদন', author: 'বঙ্কিমচন্দ্র চট্টোপাধ্যায়' },
          { id: 'ban1_2', no: 2, title: 'অপরিচিতা', author: 'রবীন্দ্রনাথ ঠাকুর' },
          { id: 'ban1_3', no: 3, title: ' সাহিত্যে খেলা', author: 'প্রমথ চৌধুরী' },
          { id: 'ban1_4', no: 4, title: 'বিলাসী', author: 'শরৎচন্দ্র চট্টোপাধ্যায়' },
          { id: 'ban1_5', no: 5, title: 'অর্ধাঙ্গী', author: 'রোকেয়া সাখাওয়াত হোসেন' },
          { id: 'ban1_6', no: 6, title: 'যৌবনের গান', author: 'কাজী নজরুল ইসলাম' },
          { id: 'ban1_7', no: 7, title: 'জীবন ও বৃক্ষ', author: 'মোতাহের হোসেন চৌধুরী' },
          { id: 'ban1_8', no: 8, title: 'গন্তব্য কাবুল', author: 'সৈয়দ মুজতবা আলী' },
          { id: 'ban1_9', no: 9, title: 'মাসি-পিসি', author: 'মানিক বন্দ্যোপাধ্যায়' },
          { id: 'ban1_10', no: 10, title: 'কপিলদাস মুর্মুর শেষ কাজ', author: 'শওকত আলী' },
          { id: 'ban1_11', no: 11, title: 'রেইনকোট', author: 'আখতারুজ্জামান ইলিয়াস' },
          { id: 'ban1_12', no: 12, title: 'নেকলেস', author: 'গী দ্য মোপাসাঁ' }
        ]
      },
      {
        id: 'ban-1-kobita',
        paper: 1,
        name: '১ম পত্র — কবিতা',
        nameEn: '1st Paper — Poetry',
        chapters: [
          { id: 'ban1_13', no: 13, title: 'ঋতু-বর্ণন', author: 'আলাওল' },
          { id: 'ban1_14', no: 14, title: 'বিভীষণের প্রতি মেঘনাদ', author: 'মাইকেল মধুসূদন দত্ত' },
          { id: 'ban1_15', no: 15, title: 'সোনার তরী', author: 'রবীন্দ্রনাথ ঠাকুর' },
          { id: 'ban1_16', no: 16, title: 'বিদ্রোহী', author: 'কাজী নজরুল ইসলাম' },
          { id: 'ban1_17', no: 17, title: 'সুচেতনা', author: 'জীবনানন্দ দাশ' },
          { id: 'ban1_18', no: 18, title: 'প্রতিদান', author: 'জসীমউদ্দীন' },
          { id: 'ban1_19', no: 19, title: 'তাহারেই পড়ে মনে', author: 'সুফিয়া কামাল' },
          { id: 'ban1_20', no: 20, title: 'পদ্মা', author: 'ফররুখ আহমদ' },
          { id: 'ban1_21', no: 21, title: 'ফেব্রুয়ারি ১৯৬৯', author: 'শামসুর রাহমান' },
          { id: 'ban1_22', no: 22, title: 'আঠারো বছর বয়স', author: 'সুকান্ত ভট্টাচার্য' },
          { id: 'ban1_23', no: 23, title: 'আমি কিংবদন্তির কথা বলছি', author: 'আবু জাফর ওবায়দুল্লাহ' },
          { id: 'ban1_24', no: 24, title: 'প্রত্যাবর্তনের লজ্জা', author: 'আল মাহমুদ' }
        ]
      },
      {
        id: 'ban-1-sahopath',
        paper: 1,
        name: '১ম পত্র — সহপাঠ',
        nameEn: '1st Paper — Supplementary Literature',
        chapters: [
          { id: 'ban1_25', no: 25, title: 'লালসালু (উপন্যাস)', author: 'সৈয়দ ওয়ালীউল্লাহ্' },
          { id: 'ban1_26', no: 26, title: 'সিরাজউদ্দৌলা (নাটক)', author: 'সিকান্দার আবু জাফর' }
        ]
      },
      {
        id: 'ban-2-manbonton',
        paper: 2,
        name: '২য় পত্র — মানবণ্টন',
        nameEn: '2nd Paper — Grammar & Composition',
        chapters: [
          { id: 'ban2_27', no: 27, title: 'উচ্চারণের নিয়ম', titleEn: 'Rules of Pronunciation' },
          { id: 'ban2_28', no: 28, title: 'বাংলা বানানের নিয়ম', titleEn: 'Bengali Spelling Rules' },
          { id: 'ban2_29', no: 29, title: 'বাক্য শুদ্ধিকরণ', titleEn: 'Sentence Correction' },
          { id: 'ban2_30', no: 30, title: 'এক কথায় প্রকাশ', titleEn: 'One Word Substitution' },
          { id: 'ban2_31', no: 31, title: 'বাগধারা ও প্রবাদ-প্রবচন', titleEn: 'Idioms & Proverbs' },
          { id: 'ban2_32', no: 32, title: 'পারিভাষিক শব্দ', titleEn: 'Terminology' },
          { id: 'ban2_33', no: 33, title: 'সমার্থক শব্দ', titleEn: 'Synonyms' },
          { id: 'ban2_34', no: 34, title: 'বিপরীতার্থক শব্দ', titleEn: 'Antonyms' },
          { id: 'ban2_35', no: 35, title: 'অনুবাদ', titleEn: 'Translation' },
          { id: 'ban2_36', no: 36, title: 'সারাংশ ও সারমর্ম', titleEn: 'Summary Writing' },
          { id: 'ban2_37', no: 37, title: 'ভাব-সম্প্রসারণ', titleEn: 'Amplification of Ideas' },
          { id: 'ban2_38', no: 38, title: 'প্রতিবেদন রচনা', titleEn: 'Report Writing' },
          { id: 'ban2_39', no: 39, title: 'অনুচ্ছেদ রচনা', titleEn: 'Paragraph Writing' },
          { id: 'ban2_40', no: 40, title: 'পত্র লিখন (আবেদনপত্র/ব্যক্তিগত পত্র)', titleEn: 'Letter / Application Writing' },
          { id: 'ban2_41', no: 41, title: 'প্রবন্ধ রচনা', titleEn: 'Essay Writing' }
        ]
      }
    ]
  },

  // 6. English
  {
    id: 'english',
    name: 'English',
    nameEn: 'English',
    icon: '📖',
    sections: [
      {
        id: 'eng-1',
        paper: 1,
        name: '১ম পত্র',
        nameEn: '1st Paper',
        chapters: [
          { id: 'eng1_1', no: 1, title: 'Unit 1: Education and Life' },
          { id: 'eng1_2', no: 2, title: 'Unit 2: Art and Craft' },
          { id: 'eng1_3', no: 3, title: 'Unit 3: Myths and Literature' },
          { id: 'eng1_4', no: 4, title: 'Unit 4: History' },
          { id: 'eng1_5', no: 5, title: 'Unit 5: Human Rights' },
          { id: 'eng1_6', no: 6, title: 'Unit 6: Dreams' },
          { id: 'eng1_7', no: 7, title: 'Unit 7: Youthful Achievers' },
          { id: 'eng1_8', no: 8, title: 'Unit 8: Relationships' },
          { id: 'eng1_9', no: 9, title: 'Unit 9: Adolescence' },
          { id: 'eng1_10', no: 10, title: 'Unit 10: Lifestyle' },
          { id: 'eng1_11', no: 11, title: 'Unit 11: Peace and Conflict' },
          { id: 'eng1_12', no: 12, title: 'Unit 12: Environment and Nature' }
        ]
      },
      {
        id: 'eng-2',
        paper: 2,
        name: '২য় পত্র — মানবণ্টন',
        nameEn: '2nd Paper — Grammar & Composition',
        chapters: [
          { id: 'eng2_13', no: 13, title: 'Gap Filling without Clues' },
          { id: 'eng2_14', no: 14, title: 'Cloze Test with Clues' },
          { id: 'eng2_15', no: 15, title: 'Cloze Test without Clues' },
          { id: 'eng2_16', no: 16, title: 'Rearranging' },
          { id: 'eng2_17', no: 17, title: 'Completing Sentences' },
          { id: 'eng2_18', no: 18, title: 'Right Form of Verbs' },
          { id: 'eng2_19', no: 19, title: 'Preposition' },
          { id: 'eng2_20', no: 20, title: 'Use of Articles' },
          { id: 'eng2_21', no: 21, title: 'Transformation of Sentences' },
          { id: 'eng2_22', no: 22, title: 'Narration (Direct-Indirect Speech)' },
          { id: 'eng2_23', no: 23, title: 'Paragraph Writing' },
          { id: 'eng2_24', no: 24, title: 'Formal Letter / Email Writing' },
          { id: 'eng2_25', no: 25, title: 'Report Writing' },
          { id: 'eng2_26', no: 26, title: 'Graph / Chart Description' },
          { id: 'eng2_27', no: 27, title: 'CV Writing with Cover Letter' },
          { id: 'eng2_28', no: 28, title: 'Summary Writing' },
          { id: 'eng2_29', no: 29, title: 'Composition / Essay Writing' }
        ]
      }
    ]
  },

  // 7. তথ্য ও যোগাযোগ প্রযুক্তি (ICT) - paper: 0 (applies to all / common)
  {
    id: 'ict',
    name: 'তথ্য ও যোগাযোগ প্রযুক্তি',
    nameEn: 'ICT',
    icon: '💻',
    sections: [
      {
        id: 'ict-all',
        paper: 0,
        name: 'সকল অধ্যায়',
        nameEn: 'All Chapters (Common)',
        chapters: [
          { id: 'ict_1', no: 1, title: 'বিশ্ব ও বাংলাদেশ প্রেক্ষিত', titleEn: 'World & Bangladesh Perspective' },
          { id: 'ict_2', no: 2, title: 'কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং', titleEn: 'Communication Systems & Networking' },
          { id: 'ict_3', no: 3, title: 'সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস', titleEn: 'Number Systems & Digital Devices' },
          { id: 'ict_4', no: 4, title: 'ওয়েব ডিজাইন পরিচিতি এবং এইচটিএমএল', titleEn: 'Web Design Intro & HTML' },
          { id: 'ict_5', no: 5, title: 'প্রোগ্রামিং ভাষা', titleEn: 'Programming Language (C)' },
          { id: 'ict_6', no: 6, title: 'ডেটাবেজ ম্যানেজমেন্ট সিস্টেম', titleEn: 'Database Management Systems (DBMS)' }
        ]
      }
    ]
  }
];

// Helper to calculate total chapters across all subjects
function getTotalChaptersCount() {
  let count = 0;
  SYLLABUS_DATA.forEach(subject => {
    subject.sections.forEach(sec => {
      count += sec.chapters.length;
    });
  });
  return count;
}

// Flat list of all chapters in deterministic order
function getAllChaptersFlat() {
  const flat = [];
  SYLLABUS_DATA.forEach(subject => {
    subject.sections.forEach(sec => {
      sec.chapters.forEach(chap => {
        flat.push(chap);
      });
    });
  });
  return flat;
}

// Set of all valid stage keys: "chapId_stageId"
function getValidKeysSet() {
  const valid = new Set();
  const stages = REVISION_STAGES.map(s => s.id);
  SYLLABUS_DATA.forEach(subject => {
    subject.sections.forEach(sec => {
      sec.chapters.forEach(chap => {
        stages.forEach(stg => {
          valid.add(`${chap.id}_${stg}`);
        });
      });
    });
  });
  return valid;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    REVISION_STAGES,
    SYLLABUS_DATA,
    getTotalChaptersCount,
    getAllChaptersFlat,
    getValidKeysSet
  };
}
