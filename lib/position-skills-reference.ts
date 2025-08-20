export interface PositionSkillsReference {
  [position: string]: {
    skills: {
      required: string[]
      preferred: string[]
      bonus: string[]
    }
    experience: {
      keywords: string[]
      roles: string[]
      industries: string[]
    }
    training: {
      certifications: string[]
      courses: string[]
      workshops: string[]
    }
    education: {
      preferred: string[]
      relevant: string[]
    }
    personality: {
      traits: string[]
      keywords: string[]
    }
  }
}

export const POSITION_SKILLS_REFERENCE: PositionSkillsReference = {
  "kitchen-helper": {
    skills: {
      required: [
        "food preparation",
        "food prep",
        "knife skills",
        "basic cooking",
        "food safety",
        "sanitation",
        "cleaning",
        "dishwashing",
        "kitchen equipment",
        "food handling",
        "prep work",
        "chopping",
        "slicing",
        "dicing",
        "washing dishes",
        "kitchen maintenance",
      ],
      preferred: [
        "inventory management",
        "stock rotation",
        "FIFO",
        "portion control",
        "recipe following",
        "kitchen organization",
        "food storage",
        "temperature control",
        "allergen awareness",
        "menu knowledge",
        "cooking techniques",
        "baking basics",
        "sauce preparation",
      ],
      bonus: [
        "culinary school",
        "chef training",
        "line cook experience",
        "catering experience",
        "restaurant experience",
        "commercial kitchen",
        "food service",
        "hospitality",
      ],
    },
    experience: {
      keywords: [
        "kitchen",
        "restaurant",
        "food service",
        "culinary",
        "prep cook",
        "line cook",
        "dishwasher",
        "food preparation",
        "catering",
        "cafeteria",
        "dining",
        "hospitality",
      ],
      roles: [
        "kitchen helper",
        "prep cook",
        "line cook",
        "dishwasher",
        "food service worker",
        "kitchen assistant",
        "culinary assistant",
        "restaurant worker",
        "catering assistant",
      ],
      industries: [
        "restaurant",
        "food service",
        "hospitality",
        "catering",
        "hotel",
        "cafeteria",
        "dining",
        "culinary",
        "food preparation",
        "kitchen operations",
      ],
    },
    training: {
      certifications: [
        "food safety",
        "ServSafe",
        "HACCP",
        "food handler",
        "sanitation certification",
        "allergen training",
        "kitchen safety",
        "food hygiene",
      ],
      courses: [
        "culinary arts",
        "food preparation",
        "kitchen operations",
        "food safety course",
        "nutrition basics",
        "cooking fundamentals",
        "knife skills training",
      ],
      workshops: [
        "food handling workshop",
        "kitchen safety training",
        "culinary skills workshop",
        "food preparation techniques",
        "sanitation training",
      ],
    },
    education: {
      preferred: [
        "culinary arts",
        "hospitality management",
        "food service",
        "nutrition",
        "restaurant management",
        "culinary school",
      ],
      relevant: [
        "high school",
        "GED",
        "vocational training",
        "trade school",
        "community college",
        "culinary certificate",
        "food service certificate",
      ],
    },
    personality: {
      traits: [
        "team player",
        "reliable",
        "punctual",
        "hardworking",
        "detail-oriented",
        "fast-paced",
        "multitasking",
        "organized",
        "clean",
        "efficient",
      ],
      keywords: [
        "teamwork",
        "reliability",
        "punctuality",
        "work ethic",
        "attention to detail",
        "speed",
        "efficiency",
        "cleanliness",
        "organization",
        "adaptability",
      ],
    },
  },

  "server/waiter": {
    skills: {
      required: [
        "customer service",
        "communication",
        "order taking",
        "serving",
        "table service",
        "POS system",
        "cash handling",
        "menu knowledge",
        "multitasking",
        "problem solving",
        "food service",
        "beverage service",
        "customer interaction",
        "hospitality",
      ],
      preferred: [
        "wine knowledge",
        "cocktail knowledge",
        "upselling",
        "sales skills",
        "conflict resolution",
        "reservation system",
        "inventory management",
        "team collaboration",
        "time management",
        "food allergies knowledge",
        "dietary restrictions",
        "payment processing",
      ],
      bonus: [
        "sommelier training",
        "bartending",
        "fine dining experience",
        "banquet service",
        "event service",
        "catering experience",
        "hospitality management",
        "language skills",
      ],
    },
    experience: {
      keywords: [
        "server",
        "waiter",
        "waitress",
        "restaurant",
        "dining",
        "customer service",
        "hospitality",
        "food service",
        "table service",
        "fine dining",
        "casual dining",
      ],
      roles: [
        "server",
        "waiter",
        "waitress",
        "food server",
        "dining room attendant",
        "restaurant server",
        "banquet server",
        "cocktail server",
        "customer service representative",
      ],
      industries: [
        "restaurant",
        "hospitality",
        "dining",
        "food service",
        "hotel",
        "catering",
        "event planning",
        "banquet",
        "fine dining",
        "casual dining",
        "bar",
        "pub",
      ],
    },
    training: {
      certifications: [
        "food safety",
        "alcohol service",
        "RBS",
        "TIPS",
        "ServSafe",
        "customer service certification",
        "hospitality certification",
        "wine certification",
      ],
      courses: [
        "hospitality management",
        "customer service",
        "food and beverage service",
        "wine service",
        "restaurant operations",
        "conflict resolution",
      ],
      workshops: [
        "customer service training",
        "upselling techniques",
        "wine tasting",
        "conflict resolution workshop",
        "hospitality skills training",
      ],
    },
    education: {
      preferred: [
        "hospitality management",
        "business",
        "communications",
        "marketing",
        "restaurant management",
        "culinary arts",
        "tourism",
      ],
      relevant: [
        "high school",
        "GED",
        "associate degree",
        "bachelor degree",
        "hospitality certificate",
        "customer service training",
      ],
    },
    personality: {
      traits: [
        "friendly",
        "outgoing",
        "personable",
        "professional",
        "patient",
        "energetic",
        "positive attitude",
        "team player",
        "reliable",
        "adaptable",
        "confident",
      ],
      keywords: [
        "communication skills",
        "interpersonal skills",
        "customer focus",
        "professionalism",
        "patience",
        "energy",
        "positive attitude",
        "teamwork",
        "reliability",
        "flexibility",
      ],
    },
  },

  housekeeping: {
    skills: {
      required: [
        "cleaning",
        "sanitizing",
        "vacuuming",
        "mopping",
        "dusting",
        "laundry",
        "bed making",
        "bathroom cleaning",
        "floor care",
        "surface cleaning",
        "equipment operation",
        "chemical handling",
        "time management",
        "attention to detail",
      ],
      preferred: [
        "deep cleaning",
        "carpet cleaning",
        "window cleaning",
        "inventory management",
        "supply management",
        "quality control",
        "safety procedures",
        "equipment maintenance",
        "stain removal",
        "fabric care",
        "disinfection",
        "organization",
      ],
      bonus: [
        "hospitality experience",
        "hotel housekeeping",
        "commercial cleaning",
        "green cleaning",
        "specialized cleaning",
        "supervisory experience",
        "training others",
      ],
    },
    experience: {
      keywords: [
        "housekeeping",
        "cleaning",
        "janitorial",
        "custodial",
        "maintenance",
        "sanitation",
        "hotel",
        "hospitality",
        "residential cleaning",
        "commercial cleaning",
      ],
      roles: [
        "housekeeper",
        "cleaner",
        "janitor",
        "custodian",
        "room attendant",
        "cleaning specialist",
        "maintenance worker",
        "sanitation worker",
        "facility cleaner",
      ],
      industries: [
        "hospitality",
        "hotel",
        "healthcare",
        "office cleaning",
        "residential cleaning",
        "commercial cleaning",
        "facility management",
        "janitorial services",
        "maintenance",
      ],
    },
    training: {
      certifications: [
        "cleaning certification",
        "safety training",
        "chemical handling",
        "OSHA training",
        "infection control",
        "green cleaning certification",
        "equipment operation",
      ],
      courses: [
        "housekeeping operations",
        "cleaning techniques",
        "safety procedures",
        "chemical safety",
        "equipment maintenance",
        "customer service",
      ],
      workshops: [
        "cleaning techniques workshop",
        "safety training",
        "equipment training",
        "chemical handling workshop",
        "time management training",
      ],
    },
    education: {
      preferred: [
        "hospitality management",
        "facility management",
        "business",
        "environmental services",
        "health and safety",
      ],
      relevant: [
        "high school",
        "GED",
        "vocational training",
        "certificate programs",
        "on-the-job training",
        "safety certification",
      ],
    },
    personality: {
      traits: [
        "detail-oriented",
        "reliable",
        "trustworthy",
        "independent",
        "efficient",
        "organized",
        "thorough",
        "punctual",
        "hardworking",
        "discreet",
        "professional",
      ],
      keywords: [
        "attention to detail",
        "reliability",
        "trustworthiness",
        "independence",
        "efficiency",
        "organization",
        "thoroughness",
        "punctuality",
        "work ethic",
        "discretion",
        "professionalism",
      ],
    },
  },

  cashier: {
    skills: {
      required: [
        "cash handling",
        "POS system",
        "customer service",
        "money counting",
        "transaction processing",
        "payment processing",
        "register operation",
        "basic math",
        "receipt handling",
        "credit card processing",
        "cash register",
        "checkout process",
        "customer interaction",
        "accuracy",
      ],
      preferred: [
        "inventory management",
        "product knowledge",
        "upselling",
        "cross-selling",
        "conflict resolution",
        "multitasking",
        "time management",
        "loss prevention",
        "refund processing",
        "exchange handling",
        "coupon processing",
        "loyalty programs",
        "bilingual",
      ],
      bonus: [
        "retail management",
        "supervisory experience",
        "training others",
        "merchandising",
        "sales experience",
        "banking experience",
        "accounting knowledge",
        "fraud detection",
      ],
    },
    experience: {
      keywords: [
        "cashier",
        "retail",
        "customer service",
        "sales",
        "checkout",
        "register",
        "transaction",
        "payment",
        "cash handling",
        "POS",
        "front end",
        "customer facing",
      ],
      roles: [
        "cashier",
        "sales associate",
        "retail clerk",
        "checkout operator",
        "customer service representative",
        "front end associate",
        "sales clerk",
        "store clerk",
        "retail associate",
      ],
      industries: [
        "retail",
        "grocery",
        "department store",
        "convenience store",
        "pharmacy",
        "gas station",
        "supermarket",
        "clothing store",
        "electronics store",
        "restaurant",
        "fast food",
      ],
    },
    training: {
      certifications: [
        "POS certification",
        "customer service certification",
        "cash handling certification",
        "retail certification",
        "loss prevention training",
        "fraud prevention",
        "safety training",
      ],
      courses: [
        "retail operations",
        "customer service",
        "cash management",
        "sales techniques",
        "conflict resolution",
        "product knowledge",
        "inventory management",
      ],
      workshops: [
        "customer service training",
        "cash handling workshop",
        "POS system training",
        "upselling techniques",
        "conflict resolution workshop",
      ],
    },
    education: {
      preferred: ["business", "retail management", "marketing", "communications", "hospitality", "customer service"],
      relevant: [
        "high school",
        "GED",
        "associate degree",
        "retail certificate",
        "customer service training",
        "business certificate",
      ],
    },
    personality: {
      traits: [
        "friendly",
        "honest",
        "reliable",
        "patient",
        "detail-oriented",
        "trustworthy",
        "professional",
        "efficient",
        "positive attitude",
        "team player",
        "punctual",
      ],
      keywords: [
        "honesty",
        "reliability",
        "patience",
        "attention to detail",
        "trustworthiness",
        "professionalism",
        "efficiency",
        "positive attitude",
        "teamwork",
        "punctuality",
        "integrity",
      ],
    },
  },

  barista: {
    skills: {
      required: [
        "coffee preparation",
        "espresso machine",
        "latte art",
        "coffee brewing",
        "milk steaming",
        "customer service",
        "order taking",
        "POS system",
        "cash handling",
        "drink recipes",
        "coffee knowledge",
        "equipment cleaning",
        "multitasking",
        "speed",
      ],
      preferred: [
        "specialty drinks",
        "coffee roasting knowledge",
        "bean varieties",
        "brewing methods",
        "flavor profiles",
        "inventory management",
        "food safety",
        "upselling",
        "customer education",
        "equipment maintenance",
        "tea preparation",
        "pastry knowledge",
      ],
      bonus: [
        "coffee certification",
        "barista competition",
        "coffee cupping",
        "roasting experience",
        "cafe management",
        "training others",
        "specialty coffee knowledge",
        "third wave coffee",
      ],
    },
    experience: {
      keywords: [
        "barista",
        "coffee shop",
        "cafe",
        "espresso",
        "coffee",
        "customer service",
        "food service",
        "beverage preparation",
        "specialty coffee",
        "coffee house",
      ],
      roles: [
        "barista",
        "coffee shop worker",
        "cafe attendant",
        "beverage specialist",
        "coffee maker",
        "espresso operator",
        "cafe barista",
        "coffee specialist",
        "drink preparer",
      ],
      industries: [
        "coffee shop",
        "cafe",
        "specialty coffee",
        "restaurant",
        "hotel",
        "bookstore cafe",
        "coffee roastery",
        "food service",
        "hospitality",
        "retail coffee",
      ],
    },
    training: {
      certifications: [
        "barista certification",
        "coffee certification",
        "SCA certification",
        "food safety",
        "customer service certification",
        "espresso certification",
        "latte art certification",
      ],
      courses: [
        "coffee brewing",
        "espresso fundamentals",
        "latte art",
        "coffee cupping",
        "customer service",
        "food safety",
        "coffee roasting",
      ],
      workshops: [
        "barista skills workshop",
        "latte art workshop",
        "coffee tasting",
        "brewing methods workshop",
        "customer service training",
      ],
    },
    education: {
      preferred: [
        "culinary arts",
        "hospitality management",
        "business",
        "food service",
        "customer service",
        "marketing",
      ],
      relevant: [
        "high school",
        "GED",
        "culinary certificate",
        "hospitality certificate",
        "barista training",
        "coffee education",
      ],
    },
    personality: {
      traits: [
        "friendly",
        "energetic",
        "creative",
        "detail-oriented",
        "passionate",
        "patient",
        "efficient",
        "artistic",
        "outgoing",
        "reliable",
        "enthusiastic",
      ],
      keywords: [
        "friendliness",
        "energy",
        "creativity",
        "attention to detail",
        "passion",
        "patience",
        "efficiency",
        "artistic ability",
        "outgoing personality",
        "reliability",
        "enthusiasm",
      ],
    },
  },

  gardener: {
    skills: {
      required: [
        "plant care",
        "landscaping",
        "pruning",
        "watering",
        "soil preparation",
        "planting",
        "weeding",
        "lawn maintenance",
        "garden tools",
        "pest control",
        "fertilizing",
        "mulching",
        "seasonal care",
        "outdoor work",
      ],
      preferred: [
        "irrigation systems",
        "plant identification",
        "disease diagnosis",
        "organic gardening",
        "composting",
        "tree care",
        "flower arranging",
        "vegetable gardening",
        "greenhouse management",
        "equipment maintenance",
        "landscape design",
        "hardscaping",
      ],
      bonus: [
        "horticulture degree",
        "landscape architecture",
        "certified arborist",
        "pesticide license",
        "irrigation certification",
        "master gardener",
        "permaculture design",
        "sustainable practices",
      ],
    },
    experience: {
      keywords: [
        "gardening",
        "landscaping",
        "horticulture",
        "groundskeeping",
        "lawn care",
        "plant care",
        "outdoor maintenance",
        "landscape maintenance",
        "garden maintenance",
        "nursery",
      ],
      roles: [
        "gardener",
        "landscaper",
        "groundskeeper",
        "horticulturist",
        "lawn care specialist",
        "landscape technician",
        "garden maintenance worker",
        "nursery worker",
        "arborist",
      ],
      industries: [
        "landscaping",
        "horticulture",
        "nursery",
        "golf course",
        "parks and recreation",
        "property management",
        "botanical garden",
        "agriculture",
        "greenhouse",
        "lawn care",
      ],
    },
    training: {
      certifications: [
        "horticulture certification",
        "pesticide applicator license",
        "irrigation certification",
        "arborist certification",
        "landscape certification",
        "master gardener",
        "organic certification",
      ],
      courses: [
        "horticulture",
        "plant science",
        "landscape design",
        "pest management",
        "soil science",
        "irrigation systems",
        "tree care",
      ],
      workshops: [
        "pruning workshop",
        "plant identification",
        "organic gardening",
        "composting workshop",
        "irrigation training",
      ],
    },
    education: {
      preferred: [
        "horticulture",
        "landscape architecture",
        "botany",
        "agriculture",
        "environmental science",
        "plant science",
        "forestry",
      ],
      relevant: [
        "high school",
        "GED",
        "associate degree",
        "certificate program",
        "vocational training",
        "apprenticeship",
      ],
    },
    personality: {
      traits: [
        "patient",
        "detail-oriented",
        "physically fit",
        "independent",
        "nature-loving",
        "observant",
        "reliable",
        "hardworking",
        "seasonal adaptable",
        "problem solver",
        "creative",
      ],
      keywords: [
        "patience",
        "attention to detail",
        "physical fitness",
        "independence",
        "love of nature",
        "observation skills",
        "reliability",
        "work ethic",
        "adaptability",
        "problem solving",
        "creativity",
      ],
    },
  },

  receptionist: {
    skills: {
      required: [
        "phone etiquette",
        "customer service",
        "communication",
        "appointment scheduling",
        "data entry",
        "filing",
        "office software",
        "multitasking",
        "professional demeanor",
        "greeting visitors",
        "message taking",
        "email management",
        "basic computer skills",
        "organization",
      ],
      preferred: [
        "Microsoft Office",
        "database management",
        "calendar management",
        "travel arrangements",
        "billing support",
        "inventory tracking",
        "vendor coordination",
        "meeting coordination",
        "document preparation",
        "records management",
        "bilingual",
        "social media",
      ],
      bonus: [
        "administrative experience",
        "office management",
        "bookkeeping",
        "project coordination",
        "training others",
        "supervisory experience",
        "specialized software",
        "industry knowledge",
      ],
    },
    experience: {
      keywords: [
        "receptionist",
        "front desk",
        "administrative",
        "office",
        "customer service",
        "secretary",
        "clerk",
        "administrative assistant",
        "office support",
        "front office",
      ],
      roles: [
        "receptionist",
        "front desk clerk",
        "administrative assistant",
        "office clerk",
        "secretary",
        "customer service representative",
        "office coordinator",
        "administrative coordinator",
        "front office assistant",
      ],
      industries: [
        "healthcare",
        "legal",
        "corporate",
        "hospitality",
        "education",
        "government",
        "nonprofit",
        "real estate",
        "professional services",
        "medical office",
      ],
    },
    training: {
      certifications: [
        "administrative certification",
        "customer service certification",
        "Microsoft Office certification",
        "medical office certification",
        "legal secretary certification",
        "office management certification",
      ],
      courses: [
        "office administration",
        "customer service",
        "business communication",
        "computer applications",
        "office procedures",
        "records management",
        "phone etiquette",
      ],
      workshops: [
        "customer service training",
        "phone skills workshop",
        "office software training",
        "professional communication",
        "time management workshop",
      ],
    },
    education: {
      preferred: [
        "business administration",
        "office administration",
        "communications",
        "business",
        "administrative studies",
        "customer service",
      ],
      relevant: [
        "high school",
        "GED",
        "associate degree",
        "certificate program",
        "business certificate",
        "administrative certificate",
      ],
    },
    personality: {
      traits: [
        "professional",
        "friendly",
        "organized",
        "reliable",
        "discreet",
        "patient",
        "helpful",
        "efficient",
        "detail-oriented",
        "calm under pressure",
        "personable",
      ],
      keywords: [
        "professionalism",
        "friendliness",
        "organization",
        "reliability",
        "discretion",
        "patience",
        "helpfulness",
        "efficiency",
        "attention to detail",
        "composure",
        "interpersonal skills",
      ],
    },
  },
}

export interface WeightedCriteria {
  education: {
    [level: string]: number
  }
  experience: {
    [level: string]: number
  }
  skills: {
    required: number
    preferred: number
    bonus: number
  }
  certifications: {
    [level: string]: number
  }
}

export const SCORING_WEIGHTS: WeightedCriteria = {
  education: {
    // Higher education levels get more points
    phd: 100,
    doctorate: 100,
    doctoral: 100,
    "ph.d": 100,
    masters: 85,
    "master's": 85,
    mba: 85,
    "graduate degree": 85,
    bachelors: 70,
    "bachelor's": 70,
    undergraduate: 70,
    "college degree": 70,
    associates: 55,
    "associate's": 55,
    "community college": 50,
    "trade school": 45,
    "vocational training": 45,
    "certificate program": 40,
    "high school": 30,
    ged: 30,
    diploma: 30,
  },
  experience: {
    // Years of experience get scaled points
    "10+ years": 100,
    "8-10 years": 90,
    "5-8 years": 80,
    "3-5 years": 70,
    "2-3 years": 60,
    "1-2 years": 50,
    "6 months - 1 year": 40,
    "entry level": 30,
    "no experience": 20,
    internship: 35,
    volunteer: 25,
  },
  skills: {
    required: 100, // Full points for required skills
    preferred: 75, // Good points for preferred skills
    bonus: 50, // Bonus points for extra skills
  },
  certifications: {
    // Professional certifications by importance
    "professional license": 100,
    "industry certification": 90,
    "safety certification": 85,
    "specialized training": 80,
    "workshop completion": 60,
    "online course": 50,
    "basic training": 40,
  },
}

export const POSITION_SCORING_MULTIPLIERS = {
  "kitchen-helper": {
    education: 0.6, // Education less critical
    experience: 1.2, // Experience very important
    skills: 1.4, // Skills most important
    certifications: 1.0,
  },
  "server/waiter": {
    education: 0.7,
    experience: 1.3,
    skills: 1.2,
    certifications: 0.9,
  },
  housekeeping: {
    education: 0.5,
    experience: 1.1,
    skills: 1.3,
    certifications: 1.1,
  },
  cashier: {
    education: 0.8,
    experience: 1.0,
    skills: 1.2,
    certifications: 1.0,
  },
  barista: {
    education: 0.7,
    experience: 1.1,
    skills: 1.3,
    certifications: 1.0,
  },
  gardener: {
    education: 0.6,
    experience: 1.2,
    skills: 1.3,
    certifications: 1.1,
  },
  receptionist: {
    education: 0.9,
    experience: 1.0,
    skills: 1.1,
    certifications: 1.0,
  },
}

export class SkillMatcher {
  static matchSkills(
    applicantSkills: string,
    positionSkills: string[],
    threshold = 0.7,
  ): {
    matches: string[]
    score: number
  } {
    const applicantSkillsList = applicantSkills
      .toLowerCase()
      .split(/[,\n\r]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    const matches: string[] = []

    for (const positionSkill of positionSkills) {
      const skillLower = positionSkill.toLowerCase()

      // Exact match or contains match
      const hasMatch = applicantSkillsList.some(
        (applicantSkill) =>
          applicantSkill === skillLower ||
          applicantSkill.includes(skillLower) ||
          skillLower.includes(applicantSkill) ||
          this.calculateSimilarity(applicantSkill, skillLower) >= threshold,
      )

      if (hasMatch) {
        matches.push(positionSkill)
      }
    }

    const score = positionSkills.length > 0 ? matches.length / positionSkills.length : 0
    return { matches, score }
  }

  static matchExperience(
    experienceText: string,
    position: string,
  ): {
    relevantExperience: boolean
    matchedKeywords: string[]
    score: number
  } {
    const reference = POSITION_SKILLS_REFERENCE[position]
    if (!reference) return { relevantExperience: false, matchedKeywords: [], score: 0 }

    const text = experienceText.toLowerCase()
    const allKeywords = [
      ...reference.experience.keywords,
      ...reference.experience.roles,
      ...reference.experience.industries,
    ]

    const matchedKeywords = allKeywords.filter((keyword) => text.includes(keyword.toLowerCase()))

    const relevantExperience = matchedKeywords.length > 0
    const score = allKeywords.length > 0 ? matchedKeywords.length / allKeywords.length : 0

    return { relevantExperience, matchedKeywords, score }
  }

  static matchPersonality(
    resumeText: string,
    position: string,
  ): {
    matchedTraits: string[]
    score: number
  } {
    const reference = POSITION_SKILLS_REFERENCE[position]
    if (!reference) return { matchedTraits: [], score: 0 }

    const text = resumeText.toLowerCase()
    const allTraits = [...reference.personality.traits, ...reference.personality.keywords]

    const matchedTraits = allTraits.filter((trait) => text.includes(trait.toLowerCase()))

    const score = allTraits.length > 0 ? matchedTraits.length / allTraits.length : 0

    return { matchedTraits, score }
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        }
      }
    }

    return matrix[str2.length][str1.length]
  }
}
