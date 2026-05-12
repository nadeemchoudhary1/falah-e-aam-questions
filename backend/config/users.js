const users = [
  {
    id: 1,
    email: "mohammadtayyab2@fpmi.co.in",
    password: "mohammadtayyab_adus_125",
    questionSet: 2,
    subject: "Anatomy and Physiology",
    name: "Mohammad tayyab"
  },
  {
    id: 2,
    email: "mohammadtayyab@fpmi.co.in",
    password: "mohammadtayyab_adus_123",
    questionSet: 3,
    subject: "ADUS (Advance Diploma in Unani Science)",
    name: "Mohammad tayyab"
  },
  {
    id: 3,
    email: "abdulkalam2@fpmi.co.in",
    password: "abdulkalam_adus_125",
    questionSet: 2,
    subject: "Anatomy and Physiology",
    name: "Abdul kalam"
  },
  {
    id: 4,
    email: "abdulkalam@fpmi.co.in",
    password: "abdulkalam_adus_123",
    questionSet: 3,
    subject: "ADUS (Advance Diploma in Unani Science)",
    name: "Abdul kalam"
  },
  {
    id: 5,
    email: "manojmalla2@fpmi.co.in",
    password: "manojmalla_dago_125",
    questionSet: 2,
    subject: "Anatomy and Physiology",
    name: "Manoj malla"
  },
  {
    id: 6,
    email: "manojmalla@fpmi.co.in",
    password: "manojmalla_dago_123",
    questionSet: 5,
    subject: "DAGO (Ayurveda Gyenocologist Obstetrics)",
    name: "Manoj malla"
  },
  {
    id: 7,
    email: "ayyubkudagari2@fpmi.co.in",
    password: "ayyubkudagari_dagp_125",
    questionSet: 2,
    subject: "Anatomy and Physiology",
    name: "Ayyub kudagari"
  },
  {
    id: 8,
    email: "ayyubkudagari@fpmi.co.in",
    password: "ayyubkudagari_dagp_123",
    questionSet: 1,
    subject: "DAGP (Ayurveda General Practice)",
    name: "Ayyub kudagari"
  },
  {
    id: 9,
    email: "jainulabideen2@fpmi.co.in",
    password: "jainulabideen_dagp_125",
    questionSet: 2,
    subject: "Anatomy and Physiology",
    name: "Jainul Abideen"
  },
  {
    id: 10,
    email: "jainulabideen@fpmi.co.in",
    password: "jainulabideen_dagp_123",
    questionSet: 1,
    subject: "DAGP (Ayurveda General Practice)",
    name: "Jainul Abideen"
  },
  {
    id: 11,
    email: "anjananandi2@fpmi.co.in",
    password: "anjananandi_dca_125",
    questionSet: 2,
    subject: "Anatomy and Physiology",
    name: "Anjana nandi"
  },
  {
    id: 12,
    email: "anjananandi@fpmi.co.in",
    password: "anjananandi_dca_123",
    questionSet: 6,
    subject: "DCA ( Cosmetologist & Aesthetic)",
    name: "Anjana nandi"
  },
  {
    id: 13,
    email: "samina2@fpmi.co.in",
    password: "samina_das_125",
    questionSet: 2,
    subject: "Anatomy and Physiology",
    name: "Samina"
  },
  {
    id: 14,
    email: "samina@fpmi.co.in",
    password: "samina_das_123",
    questionSet: 4,
    subject: "DAS (Ayurveda Science)",
    name: "Samina"
  },
  {
    id: 15,
    email: "darvinkumar2@fpmi.co.in",
    password: "darvinkumar_dh_125",
    questionSet: 2,
    subject: "Anatomy and Physiology",
    name: "Darvin kumar"
  },
  {
    id: 16,
    email: "darvinkumar@fpmi.co.in",
    password: "darvinkumar_dh_123",
    questionSet: 7,
    subject: "D.H (Dental Hygienist)",
    name: "Darvin kumar"
  },
  {
    id: 17,
    email: "sayyadnauser2@fpmi.co.in",
    password: "sayyadnauser_dih_125",
    questionSet: 2,
    subject: "Anatomy and Physiology",
    name: "Sayyad nauser"
  },
  {
    id: 18,
    email: "sayyadnauser@fpmi.co.in",
    password: "sayyadnauser_dih_123",
    questionSet: 9,
    subject: "DIH (Homeopathy)",
    name: "Sayyad nauser"
  },
  {
    id: 19,
    email: "mdabujafir2@fpmi.co.in",
    password: "mdabujafir_cms_125",
    questionSet: 2,
    subject: "Anatomy and Physiology",
    name: "Md. Abu jafir"
  },
  {
    id: 20,
    email: "mdabujafir@fpmi.co.in",
    password: "mdabujafir_cms_123",
    questionSet: 11,
    subject: "CMS",
    name: "Md. Abu jafir"
  },

  {
    id: 21,
    email: "misbahularfeen@fpmi.co.in",
    password: "misbahularfeen_ed_123",
    questionSet: 8,
    subject: "Essential Drugs",
    name: "Misbahul Aarfeen "
  },
  {
    id: 22,
    email: "naushadali@fpmi.co.in",
    password: "naushadali_ed_123",
    questionSet: 8,
    subject: "Essential Drugs",
    name: "Naushad Ali"
  },
  {
    id: 23,
    email: "faiza1@fpmi.co.in",
    password: "faiza_ed_124",
    questionSet: 8,
    subject: "Essential Drugs",
    name: "Faiza"
  },
  {
    id: 24,
    email: "momuaz@fpmi.co.in",
    password: "momuaz_ed_123",
    questionSet: 8,
    subject: "Essential Drugs",
    name: "Mo. Muaz"
  },
  {
    id: 25,
    email: "shamaila@fpmi.co.in",
    password: "shamaila_ed_123",
    questionSet: 8,
    subject: "Essential Drugs",
    name: "Shamaila"
  },
  {
    id: 26, //dummy
    email: "test1@fpmi.co.in",
    password: "test1_123",
    questionSet: 1,
    subject: "DAGP (Ayurveda General Practice)",
    name: "Test User1"
  },
  {
    id: 27, //dummy
    email: "test2@fpmi.co.in",
    password: "test2_123",
    questionSet: 2,
    subject: "Anatomy and Physiology",
    name: "test user2"
  },
  {
    id: 28, //dummy
    email: "test3@fpmi.co.in",
    password: "test3_123",
    questionSet: 3,
    subject: "ADUS (Advance Diploma in Unani Science)",
    name: "test user3"
  },
  {
    id: 29, //dummy
    email: "test4@fpmi.co.in",
    password: "test4_123",
    questionSet: 4,
    subject: "DAS (Ayurveda Science)",
    name: "test user4"
  },
  {
    id: 30, //dummy
    email: "test5@fpmi.co.in",
    password: "test5_123",
    questionSet: 5,
    subject: "DAGO (Ayurveda Gyenocologist Obstetrics)",
    name: "Test User5"
  },
  {
    id: 31, //dummy
    email: "test6@fpmi.co.in",
    password: "test6_123",
    questionSet: 6,
    subject: "DCA ( Cosmetologist & Aesthetic)",
    name: "Test User6"
  },
  {
    id: 32, //dummy
    email: "test7@fpmi.co.in",
    password: "test7_123",
    questionSet: 7,
    subject: "D.H (Dental Hygienist)",
    name: "Test User7"
  },
  {
    id: 33, //dummy
    email: "test8@fpmi.co.in",
    password: "test8_123",
    questionSet: 8,
    subject: "Essential Drugs",
    name: "Test User8"
  },
  {
    id: 34, //dummy
    email: "test9@fpmi.co.in",
    password: "test9_123",
    questionSet: 9,
    subject: "DIH (Homeopathy)",
    name: "Test User9"
  },
  {
    id: 35, //dummy
    email: "test10@fpmi.co.in",
    password: "test10_123",
    questionSet: 11,
    subject: "CMS",
    name: "Test User10"
  },
  {
    id: 36,
    email: "jitender@fpmi.co.in",
    password: "jitender_as_123",
    questionSet: 4,
    subject: "DAS (Ayurveda Science)",
    name: "Jitender Kumar"
  },
  {
    id: 37,
    email: "syednasar@fpmi.co.in",
    password: "syednasar_dih_123",
    questionSet: 9,
    subject: "DIH (Homeopathy)",
    name: "Syed Nasar"
  },
  {
    id: 38,
    email: "jitender2@fpmi.co.in",
    password: "jitender_ap_123",
    questionSet: 2,
    subject: "Anatomy and Physiology",
    name: "Jitender Kumar"
  },
  {
    id: 39,
    email: "syednasar2@fpmi.co.in",
    password: "syednasar_ap_123",
    questionSet: 2,
    subject: "Anatomy and Physiology",
    name: "Syed Nasar"
  },
]

module.exports = { users };
