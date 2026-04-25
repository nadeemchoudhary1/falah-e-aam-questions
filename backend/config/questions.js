// Mock Question Sets
const questionSets = [
  {
    id: 1,
    subject: "Anatomy",
    totalMarks: 100,
    questions: [
      {
        id: 1,
        question: "What is the unit of life?",
        options: ["Atom", "Cell", "Organ", "Tissue"],
        correct: "Cell"
      },
      {
        id: 2,
        question: "How many bones are in the adult human body?",
        options: ["186", "206", "216", "226"],
        correct: "206"
      },
      {
        id: 3,
        question: "Which is the largest bone in the human body?",
        options: ["Femur", "Tibia", "Humerus", "Fibula"],
        correct: "Femur"
      },
      {
        id: 4,
        question: "What is the function of the cerebellum?",
        options: ["Thinking", "Balance and coordination", "Memory", "Vision"],
        correct: "Balance and coordination"
      },
      {
        id: 5,
        question: "Which blood cells are responsible for immunity?",
        options: ["RBC", "WBC", "Platelets", "Plasma"],
        correct: "WBC"
      },
      {
        id: 6,
        question: "How many chambers does the human heart have?",
        options: ["2", "3", "4", "5"],
        correct: "4"
      },
      {
        id: 7,
        question: "What is the main function of the ribs?",
        options: ["Movement", "Protect organs", "Store minerals", "Produce blood"],
        correct: "Protect organs"
      },
      {
        id: 8,
        question: "Which is the smallest bone in the human body?",
        options: ["Stapes", "Malleus", "Incus", "Vomer"],
        correct: "Stapes"
      },
      {
        id: 9,
        question: "What does the spinal cord protect?",
        options: ["Brain", "Heart", "Nerves", "Muscles"],
        correct: "Nerves"
      },
      {
        id: 10,
        question: "How many pairs of ribs does a human have?",
        options: ["10", "11", "12", "13"],
        correct: "12"
      },
      {
        id: 11,
        question: "What is the primary function of the diaphragm?",
        options: ["Digestion", "Breathing", "Circulation", "Immunity"],
        correct: "Breathing"
      },
      {
        id: 12,
        question: "Which bone protects the brain?",
        options: ["Vertebra", "Tibia", "Skull", "Sternum"],
        correct: "Skull"
      },
      {
        id: 13,
        question: "What is the function of ligaments?",
        options: ["Connect bone to muscle", "Connect bone to bone", "Store calcium", "Produce blood"],
        correct: "Connect bone to bone"
      },
      {
        id: 14,
        question: "How many vertebrae are in the human spine?",
        options: ["30", "31", "32", "33"],
        correct: "33"
      },
      {
        id: 15,
        question: "Which joint allows the most movement?",
        options: ["Hinge joint", "Ball and socket", "Pivot joint", "Gliding joint"],
        correct: "Ball and socket"
      },
      {
        id: 16,
        question: "What is cartilage primarily made of?",
        options: ["Calcium", "Collagen and water", "Iron", "Phosphorus"],
        correct: "Collagen and water"
      },
      {
        id: 17,
        question: "Which muscle is responsible for movement of the arm?",
        options: ["Triceps", "Biceps", "Both A and B", "Deltoid"],
        correct: "Both A and B"
      },
      {
        id: 18,
        question: "What is the function of the patella?",
        options: ["Provide balance", "Protect the knee", "Move the leg", "Store calcium"],
        correct: "Protect the knee"
      },
      {
        id: 19,
        question: "How many pairs of spinal nerves emerge from the spinal cord?",
        options: ["29", "30", "31", "32"],
        correct: "31"
      },
      {
        id: 20,
        question: "Which of the following is a long bone?",
        options: ["Ribs", "Vertebra", "Femur", "Carpals"],
        correct: "Femur"
      }
    ]
  },
  {
    id: 2,
    subject: "Physiology",
    totalMarks: 100,
    questions: [
      {
        id: 1,
        question: "What is the normal heart rate for adults?",
        options: ["40-60 bpm", "60-100 bpm", "100-120 bpm", "120-180 bpm"],
        correct: "60-100 bpm"
      },
      {
        id: 2,
        question: "What is the pH of blood?",
        options: ["6.8-7.0", "7.35-7.45", "7.8-8.0", "8.5-9.0"],
        correct: "7.35-7.45"
      },
      {
        id: 3,
        question: "What is the normal blood pressure?",
        options: ["90/60 mmHg", "120/80 mmHg", "150/90 mmHg", "180/120 mmHg"],
        correct: "120/80 mmHg"
      },
      {
        id: 4,
        question: "How long does RBC live in the body?",
        options: ["30 days", "60 days", "90-120 days", "180 days"],
        correct: "90-120 days"
      },
      {
        id: 5,
        question: "What is the function of hemoglobin?",
        options: ["Clot blood", "Transport oxygen", "Fight infection", "Produce energy"],
        correct: "Transport oxygen"
      },
      {
        id: 6,
        question: "Which hormone regulates blood glucose?",
        options: ["Adrenaline", "Insulin", "Thyroxine", "Cortisol"],
        correct: "Insulin"
      },
      {
        id: 7,
        question: "What is tidal volume?",
        options: ["Vital capacity", "Air expelled in one breath", "Residual volume", "Total lung capacity"],
        correct: "Air expelled in one breath"
      },
      {
        id: 8,
        question: "How many heart chambers pump blood?",
        options: ["1", "2", "3", "4"],
        correct: "4"
      },
      {
        id: 9,
        question: "Which blood vessel carries oxygenated blood?",
        options: ["Vein", "Artery", "Capillary", "Venule"],
        correct: "Artery"
      },
      {
        id: 10,
        question: "What is the normal respiratory rate?",
        options: ["10-15 breaths/min", "12-20 breaths/min", "20-30 breaths/min", "30-40 breaths/min"],
        correct: "12-20 breaths/min"
      },
      {
        id: 11,
        question: "Which enzyme breaks down proteins?",
        options: ["Lipase", "Amylase", "Protease", "Lactase"],
        correct: "Protease"
      },
      {
        id: 12,
        question: "What is the main function of the liver?",
        options: ["Digest food", "Detoxify and store", "Absorb nutrients", "Produce insulin"],
        correct: "Detoxify and store"
      },
      {
        id: 13,
        question: "How many chambers does the stomach have?",
        options: ["1", "2", "3", "4"],
        correct: "1"
      },
      {
        id: 14,
        question: "What is the absorptive surface of the small intestine?",
        options: ["Rugae", "Villi", "Haustra", "Nodes"],
        correct: "Villi"
      },
      {
        id: 15,
        question: "Which organ produces bile?",
        options: ["Pancreas", "Liver", "Kidney", "Stomach"],
        correct: "Liver"
      },
      {
        id: 16,
        question: "What is the normal glomerular filtration rate?",
        options: ["50 ml/min", "75 ml/min", "125 ml/min", "200 ml/min"],
        correct: "125 ml/min"
      },
      {
        id: 17,
        question: "Which hormone is produced by the thyroid?",
        options: ["Insulin", "Thyroxine", "Cortisol", "Testosterone"],
        correct: "Thyroxine"
      },
      {
        id: 18,
        question: "What is the function of the synapse?",
        options: ["Store energy", "Transmit signals", "Produce myelin", "Generate action potential"],
        correct: "Transmit signals"
      },
      {
        id: 19,
        question: "How many pairs of cranial nerves are there?",
        options: ["6", "8", "12", "24"],
        correct: "12"
      },
      {
        id: 20,
        question: "What is the refractory period?",
        options: ["Resting potential", "Time when neuron cannot fire", "Threshold", "All-or-none response"],
        correct: "Time when neuron cannot fire"
      }
    ]
  },
  {
    id: 3,
    subject: "Biochemistry",
    totalMarks: 100,
    questions: [
      {
        id: 1,
        question: "What are the basic building blocks of proteins?",
        options: ["Nucleotides", "Amino acids", "Fatty acids", "Monosaccharides"],
        correct: "Amino acids"
      },
      {
        id: 2,
        question: "How many amino acids are commonly found in proteins?",
        options: ["10", "15", "20", "25"],
        correct: "20"
      },
      {
        id: 3,
        question: "What enzyme catalyzes protein synthesis?",
        options: ["DNA polymerase", "RNA polymerase", "Ribosomes", "Ligase"],
        correct: "Ribosomes"
      },
      {
        id: 4,
        question: "What is the primary energy currency of cells?",
        options: ["GTP", "ATP", "NADPH", "FADH2"],
        correct: "ATP"
      },
      {
        id: 5,
        question: "Which vitamin is essential for collagen synthesis?",
        options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin E"],
        correct: "Vitamin C"
      },
      {
        id: 6,
        question: "What is the Krebs cycle also known as?",
        options: ["Glycolysis", "TCA cycle", "Fermentation", "Photosynthesis"],
        correct: "TCA cycle"
      },
      {
        id: 7,
        question: "How many ATP molecules are produced from one glucose?",
        options: ["2 ATP", "30 ATP", "32 ATP", "36 ATP"],
        correct: "36 ATP"
      },
      {
        id: 8,
        question: "What is the pH optimum for pepsin?",
        options: ["3.0", "6.5", "8.0", "9.0"],
        correct: "3.0"
      },
      {
        id: 9,
        question: "Which fatty acid is essential?",
        options: ["Palmitic acid", "Stearic acid", "Linoleic acid", "Oleic acid"],
        correct: "Linoleic acid"
      },
      {
        id: 10,
        question: "What is the molecular formula of glucose?",
        options: ["C5H10O5", "C6H12O6", "C6H12O5", "C7H14O7"],
        correct: "C6H12O6"
      },
      {
        id: 11,
        question: "Which enzyme breaks down starch?",
        options: ["Lipase", "Protease", "Amylase", "Lactase"],
        correct: "Amylase"
      },
      {
        id: 12,
        question: "What is the isoelectric point?",
        options: ["Lowest pH", "Highest pH", "pH where amino acid has no charge", "pH 7.0"],
        correct: "pH where amino acid has no charge"
      },
      {
        id: 13,
        question: "How many carbons does a cholesterol molecule have?",
        options: ["20", "27", "30", "35"],
        correct: "27"
      },
      {
        id: 14,
        question: "What is the cofactor for cytochrome oxidase?",
        options: ["Fe2+", "Mg2+", "Cu2+", "Zn2+"],
        correct: "Cu2+"
      },
      {
        id: 15,
        question: "Which vitamin is involved in electron transport?",
        options: ["Vitamin A", "Vitamin B2", "Vitamin C", "Vitamin D"],
        correct: "Vitamin B2"
      },
      {
        id: 16,
        question: "What is the reducing sugar?",
        options: ["Sucrose", "Glucose", "Trehalose", "Mycophenolate"],
        correct: "Glucose"
      },
      {
        id: 17,
        question: "How many phosphate groups does ATP have?",
        options: ["1", "2", "3", "4"],
        correct: "3"
      },
      {
        id: 18,
        question: "What is the function of coenzyme A?",
        options: ["Transport amino acids", "Transport fatty acids", "Produce hormones", "Break down proteins"],
        correct: "Transport fatty acids"
      },
      {
        id: 19,
        question: "Which vitamin is a coenzyme for transaminases?",
        options: ["B1", "B3", "B6", "B12"],
        correct: "B6"
      },
      {
        id: 20,
        question: "What is the oxidation state of iron in hemoglobin?",
        options: ["0", "+2", "+3", "+4"],
        correct: "+2"
      }
    ]
  },
  {
    id: 4,
    subject: "Pathology",
    totalMarks: 100,
    questions: [
      {
        id: 1,
        question: "What is hyperplasia?",
        options: ["Cell death", "Increase in cell size", "Increase in cell number", "Cell transformation"],
        correct: "Increase in cell number"
      },
      {
        id: 2,
        question: "What defines malignancy?",
        options: ["Benign growth", "Rapid growth with metastasis", "Slow growth", "No growth"],
        correct: "Rapid growth with metastasis"
      },
      {
        id: 3,
        question: "What is necrosis?",
        options: ["Programmed cell death", "Accidental cell death", "Cell proliferation", "Cell differentiation"],
        correct: "Accidental cell death"
      },
      {
        id: 4,
        question: "What are hallmarks of cancer?",
        options: ["Limited growth", "Uncontrolled growth", "Slow growth", "No growth"],
        correct: "Uncontrolled growth"
      },
      {
        id: 5,
        question: "What is fibrosis?",
        options: ["Inflammation", "Scarring", "Infection", "Tumor"],
        correct: "Scarring"
      },
      {
        id: 6,
        question: "What is cirrhosis?",
        options: ["Fatty liver", "Liver infection", "Liver scarring", "Liver inflammation"],
        correct: "Liver scarring"
      },
      {
        id: 7,
        question: "What are histological grades based on?",
        options: ["Size", "Cellular differentiation", "Location", "Symptoms"],
        correct: "Cellular differentiation"
      },
      {
        id: 8,
        question: "What is TNM system used for?",
        options: ["Treatment", "Cancer staging", "Diagnosis", "Prevention"],
        correct: "Cancer staging"
      },
      {
        id: 9,
        question: "What is metastasis?",
        options: ["Tumor growth", "Cell death", "Cancer spreading", "Inflammation"],
        correct: "Cancer spreading"
      },
      {
        id: 10,
        question: "What is an infarct?",
        options: ["Inflammation", "Infection", "Dead tissue", "Scar"],
        correct: "Dead tissue"
      },
      {
        id: 11,
        question: "What is hypertrophy?",
        options: ["Increase in cell number", "Increase in cell size", "Decrease in cells", "Cell death"],
        correct: "Increase in cell size"
      },
      {
        id: 12,
        question: "What causes atherosclerosis?",
        options: ["Inflammation", "Plaque buildup", "Calcium", "Blood clots"],
        correct: "Plaque buildup"
      },
      {
        id: 13,
        question: "What is the difference between acute and chronic?",
        options: ["No difference", "Duration and intensity", "Cause", "Symptoms"],
        correct: "Duration and intensity"
      },
      {
        id: 14,
        question: "What are granulomas?",
        options: ["Tumors", "Inflammatory nodules", "Scars", "Blood clots"],
        correct: "Inflammatory nodules"
      },
      {
        id: 15,
        question: "What causes edema?",
        options: ["Cell death", "Fluid accumulation", "Bleeding", "Inflammation"],
        correct: "Fluid accumulation"
      },
      {
        id: 16,
        question: "What is apoptosis?",
        options: ["Accidental death", "Programmed cell death", "Cell growth", "Cell mutation"],
        correct: "Programmed cell death"
      },
      {
        id: 17,
        question: "What is dysplasia?",
        options: ["Normal growth", "Abnormal growth", "No growth", "Cancer"],
        correct: "Abnormal growth"
      },
      {
        id: 18,
        question: "What is anaplasia?",
        options: ["Normal cells", "Well-differentiated", "Loss of differentiation", "New formation"],
        correct: "Loss of differentiation"
      },
      {
        id: 19,
        question: "What causes inflammation?",
        options: ["Healing", "Injury or infection", "Aging", "Genetics"],
        correct: "Injury or infection"
      },
      {
        id: 20,
        question: "What is a benign tumor?",
        options: ["Spreads rapidly", "Does not spread", "Always fatal", "Always painful"],
        correct: "Does not spread"
      }
    ]
  }
];

module.exports = { questionSets };
