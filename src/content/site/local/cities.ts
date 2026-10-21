import type { CitySlug } from "@/lib/site-routes";

/**
 * The cities with their own pages. Everything here is used in the page text, so it must be
 * true and general: the languages customers commonly write in, the local time zone and
 * weekend, and the main data protection law. A field that is not certain is left null and the
 * page leaves that sentence out.
 */

export type Region = "uae" | "gulf" | "mena" | "europe" | "north-america" | "latin-america" | "asia-pacific" | "south-asia" | "africa";

export const REGIONS: Record<Region, string> = {
  uae: "United Arab Emirates",
  gulf: "Saudi Arabia and the Gulf",
  mena: "Middle East and North Africa",
  europe: "United Kingdom and Europe",
  "north-america": "North America",
  "latin-america": "Latin America",
  "asia-pacific": "Asia Pacific",
  "south-asia": "South Asia",
  africa: "Africa",
};

export type City = {
  name: string;
  country: string;
  region: Region;
  /** Languages customers commonly write in, most common first. English is always one of them. */
  languages: string[];
  /** Currency code used in example prices. */
  currency: string;
  timeZone: string;
  /** The usual working-week weekend, when certain. */
  weekend: string | null;
  /** The main data protection law that applies to businesses, when there is one. */
  privacyLaw: string | null;
  /** One or two sentences on the local market, used in the page introductions. */
  context: string;
};

const FRI_SAT = "Friday and Saturday";
const SAT_SUN = "Saturday and Sunday";
const UAE_LAW = "the UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021)";
const KSA_LAW = "Saudi Arabia's Personal Data Protection Law (PDPL)";
const UK_LAW = "the UK GDPR and the Data Protection Act 2018";
const AU_LAW = "the Australian Privacy Act 1988";
const IN_LAW = "India's Digital Personal Data Protection Act, 2023";
const GDPR = "the GDPR";
const CET = "Central European Time (GMT+1, GMT+2 in summer)";
const EET = "Eastern European Time (GMT+2, GMT+3 in summer)";
const UK_TIME = "UK time (GMT, BST in summer)";
const ET = "Eastern Time (GMT−5, GMT−4 in summer)";
const CT = "Central Time (GMT−6, GMT−5 in summer)";
const MT = "Mountain Time (GMT−7, GMT−6 in summer)";
const PT = "Pacific Time (GMT−8, GMT−7 in summer)";
const CCPA = "the California Consumer Privacy Act (CCPA)";
const TX_LAW = "the Texas Data Privacy and Security Act";
const LGPD = "Brazil's General Data Protection Law (LGPD)";
const POPIA = "South Africa's Protection of Personal Information Act (POPIA)";
const MA_LAW = "Morocco's Law 09-08 on the protection of personal data";
const EAT = "East Africa Time (GMT+3)";

export const CITIES: Record<CitySlug, City> = {
  // ---------------------------------------------------------------- United Arab Emirates
  dubai: {
    name: "Dubai", country: "United Arab Emirates", region: "uae",
    languages: ["English", "Arabic", "Hindi", "Urdu", "Russian", "Tagalog"],
    currency: "AED", timeZone: "Gulf Standard Time (GMT+4)", weekend: SAT_SUN, privacyLaw: UAE_LAW,
    context: "Dubai's businesses serve residents of more than 200 nationalities and millions of visitors a year, so enquiries arrive in many languages and at every hour.",
  },
  "abu-dhabi": {
    name: "Abu Dhabi", country: "United Arab Emirates", region: "uae",
    languages: ["English", "Arabic", "Hindi", "Urdu", "Malayalam", "Tagalog"],
    currency: "AED", timeZone: "Gulf Standard Time (GMT+4)", weekend: SAT_SUN, privacyLaw: UAE_LAW,
    context: "As the UAE's capital, Abu Dhabi combines government, energy and fast-growing tourism and healthcare sectors, with a large multilingual community of residents.",
  },
  sharjah: {
    name: "Sharjah", country: "United Arab Emirates", region: "uae",
    languages: ["Arabic", "English", "Urdu", "Hindi", "Bengali"],
    currency: "AED", timeZone: "Gulf Standard Time (GMT+4)", weekend: SAT_SUN, privacyLaw: UAE_LAW,
    context: "Sharjah is home to many families and small businesses that serve customers across the Northern Emirates, as well as residents who commute to Dubai.",
  },
  ajman: {
    name: "Ajman", country: "United Arab Emirates", region: "uae",
    languages: ["Arabic", "English", "Urdu", "Hindi", "Malayalam"],
    currency: "AED", timeZone: "Gulf Standard Time (GMT+4)", weekend: SAT_SUN, privacyLaw: UAE_LAW,
    context: "Ajman's growing community of small businesses and free zone companies competes on fast, friendly service for customers from across the emirates.",
  },
  "ras-al-khaimah": {
    name: "Ras Al Khaimah", country: "United Arab Emirates", region: "uae",
    languages: ["Arabic", "English", "Russian", "Hindi", "Urdu"],
    currency: "AED", timeZone: "Gulf Standard Time (GMT+4)", weekend: SAT_SUN, privacyLaw: UAE_LAW,
    context: "Ras Al Khaimah's tourism, hospitality and property businesses attract visitors and investors who often research and book outside local office hours.",
  },
  "al-ain": {
    name: "Al Ain", country: "United Arab Emirates", region: "uae",
    languages: ["Arabic", "English", "Urdu", "Hindi"],
    currency: "AED", timeZone: "Gulf Standard Time (GMT+4)", weekend: SAT_SUN, privacyLaw: UAE_LAW,
    context: "Al Ain, the UAE's garden city, has a strong Emirati community alongside students and expatriate families, and its businesses serve both.",
  },

  // ---------------------------------------------------------------- Saudi Arabia and the Gulf
  riyadh: {
    name: "Riyadh", country: "Saudi Arabia", region: "gulf",
    languages: ["Arabic", "English", "Urdu", "Hindi", "Tagalog"],
    currency: "SAR", timeZone: "Arabia Standard Time (GMT+3)", weekend: FRI_SAT, privacyLaw: KSA_LAW,
    context: "Riyadh is the centre of Saudi Arabia's economy and of fast growth in retail, hospitality and entertainment, and customers there expect quick answers in Arabic.",
  },
  jeddah: {
    name: "Jeddah", country: "Saudi Arabia", region: "gulf",
    languages: ["Arabic", "English", "Urdu", "Indonesian", "Bengali"],
    currency: "SAR", timeZone: "Arabia Standard Time (GMT+3)", weekend: FRI_SAT, privacyLaw: KSA_LAW,
    context: "Jeddah is a major commercial port and the gateway for millions of pilgrims and visitors, so its businesses answer questions from all over the world.",
  },
  dammam: {
    name: "Dammam", country: "Saudi Arabia", region: "gulf",
    languages: ["Arabic", "English", "Urdu", "Hindi", "Malayalam"],
    currency: "SAR", timeZone: "Arabia Standard Time (GMT+3)", weekend: FRI_SAT, privacyLaw: KSA_LAW,
    context: "Dammam and the wider Eastern Province are home to Saudi Arabia's energy industry and to residents from around the world.",
  },
  doha: {
    name: "Doha", country: "Qatar", region: "gulf",
    languages: ["Arabic", "English", "Hindi", "Urdu", "Malayalam", "Tagalog"],
    currency: "QAR", timeZone: "Arabia Standard Time (GMT+3)", weekend: FRI_SAT, privacyLaw: "Qatar's Personal Data Privacy Protection Law (Law No. 13 of 2016)",
    context: "Most of Doha's population is expatriate, and businesses serve them alongside Qatari customers who expect service in Arabic.",
  },
  "kuwait-city": {
    name: "Kuwait City", country: "Kuwait", region: "gulf",
    languages: ["Arabic", "English", "Hindi", "Urdu", "Tagalog"],
    currency: "KWD", timeZone: "Arabia Standard Time (GMT+3)", weekend: FRI_SAT, privacyLaw: "Kuwait's Data Privacy Protection Regulation",
    context: "Kuwait City's shoppers and families are used to fast service, and many residents come from South Asia and other Arab countries.",
  },
  manama: {
    name: "Manama", country: "Bahrain", region: "gulf",
    languages: ["Arabic", "English", "Hindi", "Urdu", "Malayalam"],
    currency: "BHD", timeZone: "Arabia Standard Time (GMT+3)", weekend: FRI_SAT, privacyLaw: "Bahrain's Personal Data Protection Law (Law No. 30 of 2018)",
    context: "Manama is a regional hub for banking, retail and tourism, with many weekend visitors from Saudi Arabia across the King Fahd Causeway.",
  },
  muscat: {
    name: "Muscat", country: "Oman", region: "gulf",
    languages: ["Arabic", "English", "Hindi", "Urdu", "Malayalam"],
    currency: "OMR", timeZone: "Gulf Standard Time (GMT+4)", weekend: FRI_SAT, privacyLaw: "Oman's Personal Data Protection Law (Royal Decree 6/2022)",
    context: "Muscat's tourism, healthcare and retail businesses serve Omani families, expatriate residents and a growing number of international visitors.",
  },

  // ---------------------------------------------------------------- Middle East and North Africa
  cairo: {
    name: "Cairo", country: "Egypt", region: "mena",
    languages: ["Arabic", "English", "French"],
    currency: "EGP", timeZone: "Eastern European Time (GMT+2, GMT+3 in summer)", weekend: FRI_SAT, privacyLaw: "Egypt's Personal Data Protection Law (Law No. 151 of 2020)",
    context: "Cairo is the largest city in the Arab world, and its businesses handle a large volume of enquiries, most of them written in Egyptian Arabic.",
  },
  alexandria: {
    name: "Alexandria", country: "Egypt", region: "mena",
    languages: ["Arabic", "English", "French"],
    currency: "EGP", timeZone: "Eastern European Time (GMT+2, GMT+3 in summer)", weekend: FRI_SAT, privacyLaw: "Egypt's Personal Data Protection Law (Law No. 151 of 2020)",
    context: "Alexandria, Egypt's second city, is a busy port and summer destination whose businesses see strong seasonal peaks in enquiries.",
  },
  amman: {
    name: "Amman", country: "Jordan", region: "mena",
    languages: ["Arabic", "English"],
    currency: "JOD", timeZone: "Arabia Standard Time (GMT+3)", weekend: FRI_SAT, privacyLaw: "Jordan's Personal Data Protection Law (Law No. 24 of 2023)",
    context: "Amman's businesses, from clinics to training centres, serve Jordanians, residents from across the region and visitors who come for medical care and leisure.",
  },
  beirut: {
    name: "Beirut", country: "Lebanon", region: "mena",
    languages: ["Arabic", "French", "English", "Armenian"],
    currency: "USD", timeZone: "Eastern European Time (GMT+2, GMT+3 in summer)", weekend: null, privacyLaw: "Lebanon's Law No. 81 of 2018 on electronic transactions and personal data",
    context: "Beirut's customers move easily between Arabic, French and English, often within the same conversation.",
  },
  casablanca: {
    name: "Casablanca", country: "Morocco", region: "mena",
    languages: ["French", "Arabic", "Darija", "English", "Spanish"],
    currency: "MAD", timeZone: "Morocco Standard Time (GMT+1)", weekend: SAT_SUN, privacyLaw: "Morocco's Law 09-08 on the protection of personal data",
    context: "Casablanca is Morocco's economic capital, where customers write in French, Arabic and Darija, and more and more in English.",
  },
  istanbul: {
    name: "Istanbul", country: "Türkiye", region: "mena",
    languages: ["Turkish", "English", "Arabic", "Russian", "German"],
    currency: "TRY", timeZone: "Türkiye Time (GMT+3)", weekend: SAT_SUN, privacyLaw: "Türkiye's Personal Data Protection Law (KVKK, Law No. 6698)",
    context: "Istanbul spans two continents and welcomes millions of visitors, many from the Gulf and Europe, so businesses answer questions in Turkish, English and Arabic.",
  },

  // ---------------------------------------------------------------- United Kingdom and Europe
  london: {
    name: "London", country: "United Kingdom", region: "europe",
    languages: ["English", "Arabic", "Polish", "Bengali", "Urdu", "Spanish"],
    currency: "GBP", timeZone: "UK time (GMT, BST in summer)", weekend: SAT_SUN, privacyLaw: UK_LAW,
    context: "London's customers speak hundreds of languages, and many of them shop, compare and book online late in the evening after work.",
  },
  manchester: {
    name: "Manchester", country: "United Kingdom", region: "europe",
    languages: ["English", "Urdu", "Arabic", "Polish", "Chinese"],
    currency: "GBP", timeZone: "UK time (GMT, BST in summer)", weekend: SAT_SUN, privacyLaw: UK_LAW,
    context: "Manchester's growing tech, education and hospitality scene draws students and visitors who expect fast answers online.",
  },
  birmingham: {
    name: "Birmingham", country: "United Kingdom", region: "europe",
    languages: ["English", "Urdu", "Punjabi", "Bengali", "Arabic"],
    currency: "GBP", timeZone: "UK time (GMT, BST in summer)", weekend: SAT_SUN, privacyLaw: UK_LAW,
    context: "Birmingham is one of the UK's youngest and most diverse cities, with large South Asian communities and busy local businesses.",
  },
  dublin: {
    name: "Dublin", country: "Ireland", region: "europe",
    languages: ["English", "Polish", "Portuguese", "Spanish", "Irish"],
    currency: "EUR", timeZone: "Irish time (GMT, IST in summer)", weekend: SAT_SUN, privacyLaw: "the GDPR",
    context: "Dublin is the European base of many international companies, and its businesses serve a multinational workforce and plenty of visitors.",
  },

  // ---------------------------------------------------------------- North America
  "new-york": {
    name: "New York", country: "United States", region: "north-america",
    languages: ["English", "Spanish", "Chinese", "Russian", "Bengali"],
    currency: "USD", timeZone: "Eastern Time (GMT−5, GMT−4 in summer)", weekend: SAT_SUN, privacyLaw: null,
    context: "New York's businesses compete for customers who expect instant answers, and many of those customers speak Spanish, Chinese or another language at home.",
  },
  "los-angeles": {
    name: "Los Angeles", country: "United States", region: "north-america",
    languages: ["English", "Spanish", "Korean", "Tagalog", "Armenian", "Chinese"],
    currency: "USD", timeZone: "Pacific Time (GMT−8, GMT−7 in summer)", weekend: SAT_SUN, privacyLaw: "the California Consumer Privacy Act (CCPA)",
    context: "Los Angeles is one of the most linguistically diverse places in the US, and a large share of its customers speak Spanish.",
  },
  chicago: {
    name: "Chicago", country: "United States", region: "north-america",
    languages: ["English", "Spanish", "Polish", "Chinese", "Arabic"],
    currency: "USD", timeZone: "Central Time (GMT−6, GMT−5 in summer)", weekend: SAT_SUN, privacyLaw: null,
    context: "Chicago's neighbourhood businesses serve a diverse city with large Spanish- and Polish-speaking communities.",
  },
  houston: {
    name: "Houston", country: "United States", region: "north-america",
    languages: ["English", "Spanish", "Vietnamese", "Chinese", "Arabic"],
    currency: "USD", timeZone: "Central Time (GMT−6, GMT−5 in summer)", weekend: SAT_SUN, privacyLaw: "the Texas Data Privacy and Security Act",
    context: "Houston is one of the most diverse cities in the US, with a large Spanish-speaking population and growing Vietnamese, Chinese and Arabic-speaking communities.",
  },
  miami: {
    name: "Miami", country: "United States", region: "north-america",
    languages: ["English", "Spanish", "Portuguese", "Haitian Creole"],
    currency: "USD", timeZone: "Eastern Time (GMT−5, GMT−4 in summer)", weekend: SAT_SUN, privacyLaw: null,
    context: "In Miami, Spanish is spoken as widely as English, and businesses also serve visitors from Latin America and Europe.",
  },
  toronto: {
    name: "Toronto", country: "Canada", region: "north-america",
    languages: ["English", "French", "Chinese", "Punjabi", "Tagalog", "Arabic"],
    currency: "CAD", timeZone: "Eastern Time (GMT−5, GMT−4 in summer)", weekend: SAT_SUN, privacyLaw: "Canada's PIPEDA",
    context: "Toronto is one of the most multicultural cities in the world: around half of its residents were born outside Canada.",
  },

  // ---------------------------------------------------------------- Asia Pacific
  sydney: {
    name: "Sydney", country: "Australia", region: "asia-pacific",
    languages: ["English", "Mandarin", "Arabic", "Cantonese", "Vietnamese"],
    currency: "AUD", timeZone: "Australian Eastern Time (GMT+10, GMT+11 in summer)", weekend: SAT_SUN, privacyLaw: AU_LAW,
    context: "Many Sydney households speak a language other than English at home, from Mandarin and Arabic to Cantonese and Vietnamese.",
  },
  melbourne: {
    name: "Melbourne", country: "Australia", region: "asia-pacific",
    languages: ["English", "Mandarin", "Vietnamese", "Greek", "Italian"],
    currency: "AUD", timeZone: "Australian Eastern Time (GMT+10, GMT+11 in summer)", weekend: SAT_SUN, privacyLaw: AU_LAW,
    context: "Melbourne's cafés, clinics and services serve a multicultural city where many residents speak Mandarin, Vietnamese, Greek or Italian at home.",
  },
  singapore: {
    name: "Singapore", country: "Singapore", region: "asia-pacific",
    languages: ["English", "Mandarin", "Malay", "Tamil"],
    currency: "SGD", timeZone: "Singapore Time (GMT+8)", weekend: SAT_SUN, privacyLaw: "Singapore's Personal Data Protection Act (PDPA)",
    context: "Singapore's customers are digital-first and multilingual, with English, Mandarin, Malay and Tamil all in everyday use.",
  },
  "kuala-lumpur": {
    name: "Kuala Lumpur", country: "Malaysia", region: "asia-pacific",
    languages: ["Malay", "English", "Chinese", "Tamil"],
    currency: "MYR", timeZone: "Malaysia Time (GMT+8)", weekend: SAT_SUN, privacyLaw: "Malaysia's Personal Data Protection Act 2010",
    context: "Kuala Lumpur's businesses serve customers who move between Malay, English, Chinese and Tamil.",
  },

  // ---------------------------------------------------------------- South Asia
  mumbai: {
    name: "Mumbai", country: "India", region: "south-asia",
    languages: ["English", "Hindi", "Marathi", "Gujarati"],
    currency: "INR", timeZone: "India Standard Time (GMT+5:30)", weekend: null, privacyLaw: IN_LAW,
    context: "Mumbai is India's commercial capital, and its customers switch between English, Hindi and Marathi, often getting in touch late in the evening.",
  },
  delhi: {
    name: "Delhi", country: "India", region: "south-asia",
    languages: ["Hindi", "English", "Punjabi", "Urdu"],
    currency: "INR", timeZone: "India Standard Time (GMT+5:30)", weekend: null, privacyLaw: IN_LAW,
    context: "Delhi's businesses serve a huge, fast-moving market in which customers write in Hindi, English and a mix of both.",
  },
  bengaluru: {
    name: "Bengaluru", country: "India", region: "south-asia",
    languages: ["English", "Kannada", "Hindi", "Tamil", "Telugu"],
    currency: "INR", timeZone: "India Standard Time (GMT+5:30)", weekend: null, privacyLaw: IN_LAW,
    context: "Bengaluru, India's technology capital, has digital-first customers who expect instant answers in English, Kannada, Hindi or Tamil.",
  },
  karachi: {
    name: "Karachi", country: "Pakistan", region: "south-asia",
    languages: ["Urdu", "English", "Sindhi", "Pashto"],
    currency: "PKR", timeZone: "Pakistan Standard Time (GMT+5)", weekend: null, privacyLaw: null,
    context: "Karachi is Pakistan's largest city and commercial hub, where customers write in Urdu, English and Roman Urdu.",
  },
  lahore: {
    name: "Lahore", country: "Pakistan", region: "south-asia",
    languages: ["Urdu", "Punjabi", "English"],
    currency: "PKR", timeZone: "Pakistan Standard Time (GMT+5)", weekend: null, privacyLaw: null,
    context: "Lahore's businesses serve customers who write in Urdu, Punjabi and English, and who often get in touch in the evening.",
  },

  // ---------------------------------------------------------------- Africa
  johannesburg: {
    name: "Johannesburg", country: "South Africa", region: "africa",
    languages: ["English", "isiZulu", "Afrikaans", "Sesotho"],
    currency: "ZAR", timeZone: "South Africa Standard Time (GMT+2)", weekend: SAT_SUN, privacyLaw: "South Africa's Protection of Personal Information Act (POPIA)",
    context: "Johannesburg is South Africa's business capital, and its customers speak English alongside isiZulu, Afrikaans and other languages.",
  },
  lagos: {
    name: "Lagos", country: "Nigeria", region: "africa",
    languages: ["English", "Yoruba", "Nigerian Pidgin", "Igbo", "Hausa"],
    currency: "NGN", timeZone: "West Africa Time (GMT+1)", weekend: SAT_SUN, privacyLaw: "the Nigeria Data Protection Act 2023",
    context: "Lagos is one of Africa's largest cities and a centre of commerce, where customers write in English, Pidgin and Yoruba.",
  },
  nairobi: {
    name: "Nairobi", country: "Kenya", region: "africa",
    languages: ["English", "Swahili"],
    currency: "KES", timeZone: "East Africa Time (GMT+3)", weekend: SAT_SUN, privacyLaw: "Kenya's Data Protection Act, 2019",
    context: "Nairobi is East Africa's business and technology hub, and its customers are quick to contact businesses online in English and Swahili.",
  },
  "cape-town": {
    name: "Cape Town", country: "South Africa", region: "africa",
    languages: ["English", "Afrikaans", "isiXhosa"],
    currency: "ZAR", timeZone: "South Africa Standard Time (GMT+2)", weekend: SAT_SUN, privacyLaw: POPIA,
    context: "Cape Town is one of Africa's most popular destinations, and its businesses serve locals in English, Afrikaans and isiXhosa as well as visitors from abroad.",
  },
  durban: {
    name: "Durban", country: "South Africa", region: "africa",
    languages: ["English", "isiZulu", "Afrikaans"],
    currency: "ZAR", timeZone: "South Africa Standard Time (GMT+2)", weekend: SAT_SUN, privacyLaw: POPIA,
    context: "Durban is a major port and holiday city, with businesses serving customers in English and isiZulu.",
  },
  abuja: {
    name: "Abuja", country: "Nigeria", region: "africa",
    languages: ["English", "Hausa", "Nigerian Pidgin", "Yoruba", "Igbo"],
    currency: "NGN", timeZone: "West Africa Time (GMT+1)", weekend: SAT_SUN, privacyLaw: "the Nigeria Data Protection Act 2023",
    context: "Abuja is Nigeria's capital, home to government, embassies and a fast-growing services sector.",
  },
  accra: {
    name: "Accra", country: "Ghana", region: "africa",
    languages: ["English", "Twi", "Ga", "Ewe"],
    currency: "GHS", timeZone: "Greenwich Mean Time (GMT)", weekend: SAT_SUN, privacyLaw: "Ghana's Data Protection Act, 2012",
    context: "Accra is one of West Africa's most dynamic business centres, with customers who are quick to reach businesses online.",
  },
  kampala: {
    name: "Kampala", country: "Uganda", region: "africa",
    languages: ["English", "Luganda", "Swahili"],
    currency: "UGX", timeZone: EAT, weekend: SAT_SUN, privacyLaw: "Uganda's Data Protection and Privacy Act, 2019",
    context: "Kampala is Uganda's capital and business hub, with a young population that does more and more online.",
  },
  kigali: {
    name: "Kigali", country: "Rwanda", region: "africa",
    languages: ["Kinyarwanda", "English", "French", "Swahili"],
    currency: "RWF", timeZone: "Central Africa Time (GMT+2)", weekend: SAT_SUN, privacyLaw: "Rwanda's Law No. 058/2021 on the protection of personal data and privacy",
    context: "Kigali is known as one of Africa's cleanest and best-organised cities, and a growing centre for conferences and technology.",
  },
  "dar-es-salaam": {
    name: "Dar es Salaam", country: "Tanzania", region: "africa",
    languages: ["Swahili", "English"],
    currency: "TZS", timeZone: EAT, weekend: SAT_SUN, privacyLaw: "Tanzania's Personal Data Protection Act, 2022",
    context: "Dar es Salaam is Tanzania's largest city and main port, where customers write mostly in Swahili.",
  },
  "addis-ababa": {
    name: "Addis Ababa", country: "Ethiopia", region: "africa",
    languages: ["Amharic", "English", "Oromo"],
    currency: "ETB", timeZone: EAT, weekend: SAT_SUN, privacyLaw: null,
    context: "Addis Ababa is home to the African Union and a fast-growing economy, with customers who write in Amharic and English.",
  },

  // ---------------------------------------------------------------- more of the Middle East and North Africa
  marrakech: {
    name: "Marrakech", country: "Morocco", region: "mena",
    languages: ["French", "Arabic", "Darija", "English", "Spanish"],
    currency: "MAD", timeZone: "Morocco Standard Time (GMT+1)", weekend: SAT_SUN, privacyLaw: MA_LAW,
    context: "Marrakech is one of Africa's most visited cities, and its riads, restaurants and tour operators answer travellers from Europe and the Gulf at every hour.",
  },
  rabat: {
    name: "Rabat", country: "Morocco", region: "mena",
    languages: ["Arabic", "French", "Darija", "English"],
    currency: "MAD", timeZone: "Morocco Standard Time (GMT+1)", weekend: SAT_SUN, privacyLaw: MA_LAW,
    context: "Rabat, Morocco's capital, combines government, universities and a growing services sector whose customers write in Arabic and French.",
  },
  tunis: {
    name: "Tunis", country: "Tunisia", region: "mena",
    languages: ["Arabic", "French", "English"],
    currency: "TND", timeZone: "Central European Time (GMT+1)", weekend: SAT_SUN, privacyLaw: "Tunisia's Organic Law No. 2004-63 on the protection of personal data",
    context: "Tunis is Tunisia's business centre, where customers move between Tunisian Arabic and French and expect quick replies online.",
  },
  algiers: {
    name: "Algiers", country: "Algeria", region: "mena",
    languages: ["Arabic", "French", "Tamazight", "English"],
    currency: "DZD", timeZone: "Central European Time (GMT+1)", weekend: FRI_SAT, privacyLaw: "Algeria's Law No. 18-07 on the protection of personal data",
    context: "Algiers is Algeria's capital and largest city, and its businesses serve customers who write in Arabic, French or a mix of both.",
  },

  // ---------------------------------------------------------------- more of the United Kingdom and Europe
  leeds: {
    name: "Leeds", country: "United Kingdom", region: "europe",
    languages: ["English", "Urdu", "Polish", "Punjabi", "Arabic"],
    currency: "GBP", timeZone: UK_TIME, weekend: SAT_SUN, privacyLaw: UK_LAW,
    context: "Leeds is a major centre for finance, law and retail in the north of England, with a large student population that does everything online.",
  },
  liverpool: {
    name: "Liverpool", country: "United Kingdom", region: "europe",
    languages: ["English", "Arabic", "Polish", "Chinese"],
    currency: "GBP", timeZone: UK_TIME, weekend: SAT_SUN, privacyLaw: UK_LAW,
    context: "Liverpool's tourism, hospitality and education sectors welcome visitors from around the world, many of whom plan and book online.",
  },
  edinburgh: {
    name: "Edinburgh", country: "United Kingdom", region: "europe",
    languages: ["English", "Polish", "Chinese", "Spanish"],
    currency: "GBP", timeZone: UK_TIME, weekend: SAT_SUN, privacyLaw: UK_LAW,
    context: "Edinburgh, Scotland's capital, is busy with tourists, festival visitors and students all year round, so local businesses field questions at every hour.",
  },
  glasgow: {
    name: "Glasgow", country: "United Kingdom", region: "europe",
    languages: ["English", "Polish", "Urdu", "Arabic"],
    currency: "GBP", timeZone: UK_TIME, weekend: SAT_SUN, privacyLaw: UK_LAW,
    context: "Glasgow is Scotland's largest city, with a lively retail, events and hospitality scene and customers who expect fast answers online.",
  },
  paris: {
    name: "Paris", country: "France", region: "europe",
    languages: ["French", "English", "Arabic", "Spanish", "Portuguese"],
    currency: "EUR", timeZone: CET, weekend: SAT_SUN, privacyLaw: GDPR,
    context: "Paris is one of the most visited cities in the world, and its businesses serve Parisians in French and visitors in many other languages.",
  },
  berlin: {
    name: "Berlin", country: "Germany", region: "europe",
    languages: ["German", "English", "Turkish", "Arabic", "Polish"],
    currency: "EUR", timeZone: CET, weekend: SAT_SUN, privacyLaw: GDPR,
    context: "Berlin's start-ups, shops and services serve an international city where English is heard almost as often as German.",
  },
  munich: {
    name: "Munich", country: "Germany", region: "europe",
    languages: ["German", "English", "Turkish", "Arabic"],
    currency: "EUR", timeZone: CET, weekend: SAT_SUN, privacyLaw: GDPR,
    context: "Munich is one of Germany's wealthiest cities and a magnet for trade fairs, medical visitors and tourists, many of them from the Gulf.",
  },
  frankfurt: {
    name: "Frankfurt", country: "Germany", region: "europe",
    languages: ["German", "English", "Turkish", "Arabic"],
    currency: "EUR", timeZone: CET, weekend: SAT_SUN, privacyLaw: GDPR,
    context: "Frankfurt is Germany's financial centre and a major airport hub, with a highly international population and business visitors from around the world.",
  },
  hamburg: {
    name: "Hamburg", country: "Germany", region: "europe",
    languages: ["German", "English", "Turkish", "Polish"],
    currency: "EUR", timeZone: CET, weekend: SAT_SUN, privacyLaw: GDPR,
    context: "Hamburg, Germany's great port city, is home to trade, media and tourism businesses that serve both locals and international visitors.",
  },
  amsterdam: {
    name: "Amsterdam", country: "Netherlands", region: "europe",
    languages: ["Dutch", "English", "Turkish", "Arabic"],
    currency: "EUR", timeZone: CET, weekend: SAT_SUN, privacyLaw: GDPR,
    context: "Amsterdam is one of Europe's most international cities, and its businesses routinely answer customers in Dutch and English.",
  },
  brussels: {
    name: "Brussels", country: "Belgium", region: "europe",
    languages: ["French", "Dutch", "English", "Arabic"],
    currency: "EUR", timeZone: CET, weekend: SAT_SUN, privacyLaw: GDPR,
    context: "Brussels is home to the EU institutions and a very international workforce, so customers there write in French, Dutch, English and much more.",
  },
  madrid: {
    name: "Madrid", country: "Spain", region: "europe",
    languages: ["Spanish", "English", "Romanian", "Arabic"],
    currency: "EUR", timeZone: CET, weekend: SAT_SUN, privacyLaw: GDPR,
    context: "Madrid's businesses serve a busy capital and a steady flow of visitors from Latin America and the rest of Europe, often late into the evening.",
  },
  barcelona: {
    name: "Barcelona", country: "Spain", region: "europe",
    languages: ["Spanish", "Catalan", "English", "French"],
    currency: "EUR", timeZone: CET, weekend: SAT_SUN, privacyLaw: GDPR,
    context: "Barcelona welcomes millions of visitors a year, and its businesses answer questions in Spanish, Catalan, English and French.",
  },
  lisbon: {
    name: "Lisbon", country: "Portugal", region: "europe",
    languages: ["Portuguese", "English", "Spanish", "French"],
    currency: "EUR", timeZone: "Western European Time (GMT, GMT+1 in summer)", weekend: SAT_SUN, privacyLaw: GDPR,
    context: "Lisbon has become a favourite of tourists, remote workers and new residents, so many enquiries arrive in English as well as Portuguese.",
  },
  rome: {
    name: "Rome", country: "Italy", region: "europe",
    languages: ["Italian", "English", "Spanish", "French"],
    currency: "EUR", timeZone: CET, weekend: SAT_SUN, privacyLaw: GDPR,
    context: "Rome's hotels, restaurants and tour businesses serve millions of visitors a year alongside the city's own residents.",
  },
  milan: {
    name: "Milan", country: "Italy", region: "europe",
    languages: ["Italian", "English", "Chinese", "Arabic"],
    currency: "EUR", timeZone: CET, weekend: SAT_SUN, privacyLaw: GDPR,
    context: "Milan is Italy's business and fashion capital, with trade fairs and international visitors that keep enquiries coming in all year.",
  },
  vienna: {
    name: "Vienna", country: "Austria", region: "europe",
    languages: ["German", "English", "Turkish", "Serbian"],
    currency: "EUR", timeZone: CET, weekend: SAT_SUN, privacyLaw: GDPR,
    context: "Vienna is a major destination for culture, conferences and medical visitors, and its businesses serve customers from across Central Europe and beyond.",
  },
  zurich: {
    name: "Zurich", country: "Switzerland", region: "europe",
    languages: ["German", "English", "Italian", "French"],
    currency: "CHF", timeZone: CET, weekend: SAT_SUN, privacyLaw: "Switzerland's Federal Act on Data Protection (FADP)",
    context: "Zurich is Switzerland's financial centre, with an international workforce and customers who expect precise, quick answers.",
  },
  geneva: {
    name: "Geneva", country: "Switzerland", region: "europe",
    languages: ["French", "English", "Arabic", "Portuguese"],
    currency: "CHF", timeZone: CET, weekend: SAT_SUN, privacyLaw: "Switzerland's Federal Act on Data Protection (FADP)",
    context: "Geneva hosts international organisations and visitors from all over the world, many of them from the Gulf, so businesses serve a truly global clientele.",
  },
  stockholm: {
    name: "Stockholm", country: "Sweden", region: "europe",
    languages: ["Swedish", "English", "Arabic", "Finnish"],
    currency: "SEK", timeZone: CET, weekend: SAT_SUN, privacyLaw: GDPR,
    context: "Stockholm is one of Europe's most digital cities, where customers expect to get answers online rather than by phone.",
  },
  copenhagen: {
    name: "Copenhagen", country: "Denmark", region: "europe",
    languages: ["Danish", "English", "Arabic", "German"],
    currency: "DKK", timeZone: CET, weekend: SAT_SUN, privacyLaw: GDPR,
    context: "Copenhagen's businesses serve digital-first customers and a growing number of visitors, most of whom are happy to write in English.",
  },
  oslo: {
    name: "Oslo", country: "Norway", region: "europe",
    languages: ["Norwegian", "English", "Polish", "Arabic"],
    currency: "NOK", timeZone: CET, weekend: SAT_SUN, privacyLaw: "the GDPR, which applies in Norway through the EEA Agreement",
    context: "Oslo's customers are among the most digital in Europe, and they expect to solve things online without waiting on the phone.",
  },
  helsinki: {
    name: "Helsinki", country: "Finland", region: "europe",
    languages: ["Finnish", "Swedish", "English", "Russian"],
    currency: "EUR", timeZone: EET, weekend: SAT_SUN, privacyLaw: GDPR,
    context: "Helsinki is a highly connected city where customers switch between Finnish, Swedish and English and prefer to get answers online.",
  },
  warsaw: {
    name: "Warsaw", country: "Poland", region: "europe",
    languages: ["Polish", "English", "Ukrainian", "Russian"],
    currency: "PLN", timeZone: CET, weekend: SAT_SUN, privacyLaw: GDPR,
    context: "Warsaw is one of Europe's fastest-growing business centres, with many residents and customers who speak Ukrainian as well as Polish.",
  },
  prague: {
    name: "Prague", country: "Czechia", region: "europe",
    languages: ["Czech", "English", "Russian", "German"],
    currency: "CZK", timeZone: CET, weekend: SAT_SUN, privacyLaw: GDPR,
    context: "Prague's hotels, restaurants and services serve millions of visitors a year, so English is as important as Czech for many businesses.",
  },
  athens: {
    name: "Athens", country: "Greece", region: "europe",
    languages: ["Greek", "English", "Arabic", "Albanian"],
    currency: "EUR", timeZone: EET, weekend: SAT_SUN, privacyLaw: GDPR,
    context: "Athens is the gateway to Greece for millions of travellers, and its businesses see busy seasonal peaks in enquiries.",
  },

  // ---------------------------------------------------------------- more of North America
  "san-francisco": {
    name: "San Francisco", country: "United States", region: "north-america",
    languages: ["English", "Chinese", "Spanish", "Tagalog"],
    currency: "USD", timeZone: PT, weekend: SAT_SUN, privacyLaw: CCPA,
    context: "San Francisco's tech-savvy customers expect instant answers, and many of them speak Chinese or Spanish at home.",
  },
  "san-diego": {
    name: "San Diego", country: "United States", region: "north-america",
    languages: ["English", "Spanish", "Tagalog", "Vietnamese"],
    currency: "USD", timeZone: PT, weekend: SAT_SUN, privacyLaw: CCPA,
    context: "San Diego sits right next to the Mexican border, and its businesses serve a large Spanish-speaking community and many visitors.",
  },
  seattle: {
    name: "Seattle", country: "United States", region: "north-america",
    languages: ["English", "Spanish", "Chinese", "Vietnamese", "Somali"],
    currency: "USD", timeZone: PT, weekend: SAT_SUN, privacyLaw: null,
    context: "Seattle is home to some of the world's biggest technology companies, and its residents are used to doing everything online.",
  },
  boston: {
    name: "Boston", country: "United States", region: "north-america",
    languages: ["English", "Spanish", "Portuguese", "Chinese", "Haitian Creole"],
    currency: "USD", timeZone: ET, weekend: SAT_SUN, privacyLaw: null,
    context: "Boston's hospitals, universities and businesses serve students, patients and visitors from around the world.",
  },
  "washington-dc": {
    name: "Washington, D.C.", country: "United States", region: "north-america",
    languages: ["English", "Spanish", "Amharic", "French"],
    currency: "USD", timeZone: ET, weekend: SAT_SUN, privacyLaw: null,
    context: "Washington, D.C. is home to government, embassies and international organisations, with customers from every corner of the world.",
  },
  atlanta: {
    name: "Atlanta", country: "United States", region: "north-america",
    languages: ["English", "Spanish", "Korean", "Vietnamese"],
    currency: "USD", timeZone: ET, weekend: SAT_SUN, privacyLaw: null,
    context: "Atlanta is a major business and travel hub in the southern US, with a fast-growing and increasingly diverse population.",
  },
  dallas: {
    name: "Dallas", country: "United States", region: "north-america",
    languages: ["English", "Spanish", "Vietnamese", "Hindi"],
    currency: "USD", timeZone: CT, weekend: SAT_SUN, privacyLaw: TX_LAW,
    context: "Dallas is one of the fastest-growing metropolitan areas in the US, with a large Spanish-speaking population and many new arrivals.",
  },
  austin: {
    name: "Austin", country: "United States", region: "north-america",
    languages: ["English", "Spanish", "Vietnamese", "Chinese"],
    currency: "USD", timeZone: CT, weekend: SAT_SUN, privacyLaw: TX_LAW,
    context: "Austin's booming tech scene and young population mean customers who research, compare and book almost entirely online.",
  },
  phoenix: {
    name: "Phoenix", country: "United States", region: "north-america",
    languages: ["English", "Spanish", "Navajo", "Arabic"],
    currency: "USD", timeZone: "Mountain Standard Time (GMT−7, no daylight saving)", weekend: SAT_SUN, privacyLaw: null,
    context: "Phoenix is one of the largest and fastest-growing cities in the US, and a large share of its customers speak Spanish.",
  },
  "las-vegas": {
    name: "Las Vegas", country: "United States", region: "north-america",
    languages: ["English", "Spanish", "Tagalog", "Chinese"],
    currency: "USD", timeZone: PT, weekend: SAT_SUN, privacyLaw: null,
    context: "Las Vegas runs around the clock, and its hotels, restaurants and services answer visitors at every hour of the day and night.",
  },
  denver: {
    name: "Denver", country: "United States", region: "north-america",
    languages: ["English", "Spanish", "Vietnamese", "Amharic"],
    currency: "USD", timeZone: MT, weekend: SAT_SUN, privacyLaw: "the Colorado Privacy Act",
    context: "Denver's growing population of young professionals and outdoor visitors expects quick, online answers from local businesses.",
  },
  philadelphia: {
    name: "Philadelphia", country: "United States", region: "north-america",
    languages: ["English", "Spanish", "Chinese", "Vietnamese"],
    currency: "USD", timeZone: ET, weekend: SAT_SUN, privacyLaw: null,
    context: "Philadelphia's hospitals, universities and neighbourhood businesses serve a large and varied city with a big Spanish-speaking community.",
  },
  vancouver: {
    name: "Vancouver", country: "Canada", region: "north-america",
    languages: ["English", "Chinese", "Punjabi", "Tagalog", "Persian"],
    currency: "CAD", timeZone: PT, weekend: SAT_SUN, privacyLaw: "British Columbia's Personal Information Protection Act (PIPA)",
    context: "Vancouver is one of Canada's most diverse cities, with large Chinese- and Punjabi-speaking communities.",
  },
  montreal: {
    name: "Montreal", country: "Canada", region: "north-america",
    languages: ["French", "English", "Arabic", "Spanish"],
    currency: "CAD", timeZone: ET, weekend: SAT_SUN, privacyLaw: "Quebec's Law 25 on the protection of personal information",
    context: "Montreal is a French-speaking city where many customers also write in English, Arabic or Spanish, and expect to be answered in their language.",
  },
  calgary: {
    name: "Calgary", country: "Canada", region: "north-america",
    languages: ["English", "Punjabi", "Tagalog", "Chinese", "Arabic"],
    currency: "CAD", timeZone: MT, weekend: SAT_SUN, privacyLaw: "Alberta's Personal Information Protection Act (PIPA)",
    context: "Calgary's energy, retail and service businesses serve a young, fast-growing city with many recent arrivals.",
  },

  // ---------------------------------------------------------------- Latin America
  "mexico-city": {
    name: "Mexico City", country: "Mexico", region: "latin-america",
    languages: ["Spanish", "English"],
    currency: "MXN", timeZone: "Central Standard Time (GMT−6)", weekend: SAT_SUN, privacyLaw: "Mexico's federal law on the protection of personal data held by private parties",
    context: "Mexico City is one of the largest cities in the Americas, and its customers are quick to message businesses rather than call.",
  },
  "sao-paulo": {
    name: "São Paulo", country: "Brazil", region: "latin-america",
    languages: ["Portuguese", "Spanish", "English"],
    currency: "BRL", timeZone: "Brasília Time (GMT−3)", weekend: SAT_SUN, privacyLaw: LGPD,
    context: "São Paulo is the largest city in the southern hemisphere and Brazil's business capital, where customers expect instant replies to their messages.",
  },
  "rio-de-janeiro": {
    name: "Rio de Janeiro", country: "Brazil", region: "latin-america",
    languages: ["Portuguese", "Spanish", "English"],
    currency: "BRL", timeZone: "Brasília Time (GMT−3)", weekend: SAT_SUN, privacyLaw: LGPD,
    context: "Rio de Janeiro's tourism, hospitality and services businesses serve Brazilians and visitors from all over the world.",
  },
  "buenos-aires": {
    name: "Buenos Aires", country: "Argentina", region: "latin-america",
    languages: ["Spanish", "English", "Portuguese", "Italian"],
    currency: "ARS", timeZone: "Argentina Time (GMT−3)", weekend: SAT_SUN, privacyLaw: "Argentina's Personal Data Protection Law (Law 25,326)",
    context: "Buenos Aires is a lively capital where people eat and shop late, so customers often get in touch well into the night.",
  },
  bogota: {
    name: "Bogotá", country: "Colombia", region: "latin-america",
    languages: ["Spanish", "English"],
    currency: "COP", timeZone: "Colombia Time (GMT−5)", weekend: SAT_SUN, privacyLaw: "Colombia's Law 1581 of 2012 on personal data",
    context: "Bogotá is Colombia's capital and business centre, with a growing services sector and customers who prefer to message rather than call.",
  },
  lima: {
    name: "Lima", country: "Peru", region: "latin-america",
    languages: ["Spanish", "English", "Quechua"],
    currency: "PEN", timeZone: "Peru Time (GMT−5)", weekend: SAT_SUN, privacyLaw: "Peru's Personal Data Protection Law (Law 29733)",
    context: "Lima's businesses serve a large capital and visitors on their way to the rest of Peru, with most questions arriving by message.",
  },
  santiago: {
    name: "Santiago", country: "Chile", region: "latin-america",
    languages: ["Spanish", "English", "Portuguese"],
    currency: "CLP", timeZone: "Chile Time (GMT−4, GMT−3 in summer)", weekend: SAT_SUN, privacyLaw: "Chile's personal data protection law",
    context: "Santiago is one of Latin America's most important business centres, with digital-first customers who expect quick replies.",
  },

  // ---------------------------------------------------------------- more of Asia Pacific
  tokyo: {
    name: "Tokyo", country: "Japan", region: "asia-pacific",
    languages: ["Japanese", "English", "Chinese", "Korean"],
    currency: "JPY", timeZone: "Japan Standard Time (GMT+9)", weekend: SAT_SUN, privacyLaw: "Japan's Act on the Protection of Personal Information (APPI)",
    context: "Tokyo is the world's largest metropolitan area, and its businesses also answer a fast-growing number of international visitors in English, Chinese and Korean.",
  },
  osaka: {
    name: "Osaka", country: "Japan", region: "asia-pacific",
    languages: ["Japanese", "English", "Chinese", "Korean"],
    currency: "JPY", timeZone: "Japan Standard Time (GMT+9)", weekend: SAT_SUN, privacyLaw: "Japan's Act on the Protection of Personal Information (APPI)",
    context: "Osaka is famous for food and shopping, and its businesses welcome large numbers of visitors from across Asia.",
  },
  seoul: {
    name: "Seoul", country: "South Korea", region: "asia-pacific",
    languages: ["Korean", "English", "Chinese", "Japanese"],
    currency: "KRW", timeZone: "Korea Standard Time (GMT+9)", weekend: SAT_SUN, privacyLaw: "South Korea's Personal Information Protection Act (PIPA)",
    context: "Seoul is one of the most connected cities in the world, where customers expect answers on their phone within seconds.",
  },
  "hong-kong": {
    name: "Hong Kong", country: "Hong Kong", region: "asia-pacific",
    languages: ["Cantonese", "English", "Mandarin", "Tagalog"],
    currency: "HKD", timeZone: "Hong Kong Time (GMT+8)", weekend: SAT_SUN, privacyLaw: "Hong Kong's Personal Data (Privacy) Ordinance",
    context: "Hong Kong's fast-paced businesses serve customers in Cantonese, English and Mandarin, often late into the evening.",
  },
  taipei: {
    name: "Taipei", country: "Taiwan", region: "asia-pacific",
    languages: ["Mandarin", "English", "Taiwanese Hokkien", "Japanese"],
    currency: "TWD", timeZone: "Taiwan Time (GMT+8)", weekend: SAT_SUN, privacyLaw: "Taiwan's Personal Data Protection Act",
    context: "Taipei's tech-savvy customers and growing number of visitors expect quick answers online in Mandarin and English.",
  },
  bangkok: {
    name: "Bangkok", country: "Thailand", region: "asia-pacific",
    languages: ["Thai", "English", "Chinese", "Arabic"],
    currency: "THB", timeZone: "Indochina Time (GMT+7)", weekend: SAT_SUN, privacyLaw: "Thailand's Personal Data Protection Act (PDPA)",
    context: "Bangkok is one of the most visited cities in the world, and its clinics, hotels and shops answer visitors in many languages, including Arabic.",
  },
  jakarta: {
    name: "Jakarta", country: "Indonesia", region: "asia-pacific",
    languages: ["Indonesian", "English", "Javanese", "Chinese"],
    currency: "IDR", timeZone: "Western Indonesia Time (GMT+7)", weekend: SAT_SUN, privacyLaw: "Indonesia's Personal Data Protection Law (Law No. 27 of 2022)",
    context: "Jakarta is a huge, mobile-first market where customers prefer to message a business rather than call it.",
  },
  manila: {
    name: "Manila", country: "Philippines", region: "asia-pacific",
    languages: ["Filipino", "English", "Cebuano"],
    currency: "PHP", timeZone: "Philippine Time (GMT+8)", weekend: SAT_SUN, privacyLaw: "the Philippines' Data Privacy Act of 2012",
    context: "Manila's customers switch easily between Filipino and English, and are among the most active online shoppers and messagers in Asia.",
  },
  "ho-chi-minh-city": {
    name: "Ho Chi Minh City", country: "Vietnam", region: "asia-pacific",
    languages: ["Vietnamese", "English", "Chinese"],
    currency: "VND", timeZone: "Indochina Time (GMT+7)", weekend: SAT_SUN, privacyLaw: "Vietnam's personal data protection rules",
    context: "Ho Chi Minh City is Vietnam's commercial centre, with a young, mobile-first population that shops and books online.",
  },
  brisbane: {
    name: "Brisbane", country: "Australia", region: "asia-pacific",
    languages: ["English", "Mandarin", "Vietnamese", "Hindi"],
    currency: "AUD", timeZone: "Australian Eastern Standard Time (GMT+10, no daylight saving)", weekend: SAT_SUN, privacyLaw: AU_LAW,
    context: "Brisbane is one of Australia's fastest-growing cities, with a booming services sector and plenty of visitors.",
  },
  perth: {
    name: "Perth", country: "Australia", region: "asia-pacific",
    languages: ["English", "Mandarin", "Italian", "Vietnamese"],
    currency: "AUD", timeZone: "Australian Western Time (GMT+8)", weekend: SAT_SUN, privacyLaw: AU_LAW,
    context: "Perth is one of the most isolated big cities in the world, so its businesses rely on their websites to serve customers across Western Australia.",
  },
  auckland: {
    name: "Auckland", country: "New Zealand", region: "asia-pacific",
    languages: ["English", "Mandarin", "Samoan", "Hindi", "Māori"],
    currency: "NZD", timeZone: "New Zealand Time (GMT+12, GMT+13 in summer)", weekend: SAT_SUN, privacyLaw: "New Zealand's Privacy Act 2020",
    context: "Auckland is New Zealand's largest and most diverse city, with large Asian and Pacific communities.",
  },

  // ---------------------------------------------------------------- more of South Asia
  hyderabad: {
    name: "Hyderabad", country: "India", region: "south-asia",
    languages: ["Telugu", "English", "Hindi", "Urdu"],
    currency: "INR", timeZone: "India Standard Time (GMT+5:30)", weekend: null, privacyLaw: IN_LAW,
    context: "Hyderabad is a major technology and pharmaceutical hub, and its customers write in Telugu, English, Hindi and Urdu.",
  },
  chennai: {
    name: "Chennai", country: "India", region: "south-asia",
    languages: ["Tamil", "English", "Hindi", "Telugu"],
    currency: "INR", timeZone: "India Standard Time (GMT+5:30)", weekend: null, privacyLaw: IN_LAW,
    context: "Chennai is a leading centre for healthcare, manufacturing and IT, and many of its customers prefer to write in Tamil.",
  },
  kolkata: {
    name: "Kolkata", country: "India", region: "south-asia",
    languages: ["Bengali", "English", "Hindi"],
    currency: "INR", timeZone: "India Standard Time (GMT+5:30)", weekend: null, privacyLaw: IN_LAW,
    context: "Kolkata is eastern India's commercial capital, where customers move between Bengali, Hindi and English.",
  },
  pune: {
    name: "Pune", country: "India", region: "south-asia",
    languages: ["Marathi", "English", "Hindi"],
    currency: "INR", timeZone: "India Standard Time (GMT+5:30)", weekend: null, privacyLaw: IN_LAW,
    context: "Pune's universities and technology companies give it a young, digital-first population that expects instant answers online.",
  },
  islamabad: {
    name: "Islamabad", country: "Pakistan", region: "south-asia",
    languages: ["Urdu", "English", "Punjabi", "Pashto"],
    currency: "PKR", timeZone: "Pakistan Standard Time (GMT+5)", weekend: null, privacyLaw: null,
    context: "Islamabad is Pakistan's capital, home to government, embassies and a growing number of businesses serving customers in Urdu and English.",
  },
  dhaka: {
    name: "Dhaka", country: "Bangladesh", region: "south-asia",
    languages: ["Bengali", "English"],
    currency: "BDT", timeZone: "Bangladesh Standard Time (GMT+6)", weekend: FRI_SAT, privacyLaw: null,
    context: "Dhaka is one of the most densely populated cities in the world, with a fast-growing online market and customers who write in Bengali and English.",
  },
  colombo: {
    name: "Colombo", country: "Sri Lanka", region: "south-asia",
    languages: ["Sinhala", "Tamil", "English"],
    currency: "LKR", timeZone: "Sri Lanka Time (GMT+5:30)", weekend: SAT_SUN, privacyLaw: "Sri Lanka's Personal Data Protection Act, No. 9 of 2022",
    context: "Colombo is Sri Lanka's commercial capital, where businesses serve customers in Sinhala, Tamil and English, and many tourists.",
  },
};
