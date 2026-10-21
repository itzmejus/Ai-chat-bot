import type { IndustrySlug } from "@/lib/site-routes";

/**
 * Extra wording per industry for the local pages (industry x city, website builder x industry).
 * The industry's questions, benefits and sample chat come from the main site content; this adds
 * the words needed to write about it in a sentence. Placeholders: {city}, {language}.
 */
export type IndustryProfile = {
  /** Plural, lower case, as in "AI chatbot for {label} in Dubai". */
  label: string;
  /** As in "AI chatbot for {site} on WordPress". */
  site: string;
  /** Who writes in: "patients", "diners"... */
  customers: string;
  /** What they ask about, for "answers questions about ...". */
  topics: string[];
  /** What the assistant collects when someone is ready: "their name, phone number and ...". */
  lead: string;
  /** When most questions come in. */
  peak: string;
  /** What to give the assistant to read. */
  content: string;
  /** Two questions a customer in a given city might ask. */
  localQuestions: [string, string];
  /** Where on the website the chat matters most. */
  pages: string;
};

export const INDUSTRY_PROFILES: Record<IndustrySlug, IndustryProfile> = {
  clinics: {
    label: "clinics", site: "clinic websites", customers: "patients",
    topics: ["treatment prices", "insurance", "doctors and specialities", "opening hours", "location and parking", "appointment requests"],
    lead: "the patient's name, phone number and preferred appointment time",
    peak: "in the evening, when patients finally have time to look into a treatment",
    content: "your treatment price list, accepted insurers, doctors' specialities and opening hours",
    localQuestions: ["Do you have a doctor in {city} who speaks {language}?", "Can I get an appointment at your {city} clinic this week?"],
    pages: "your treatments, prices and booking pages",
  },
  "real-estate": {
    label: "real estate agencies", site: "real estate websites", customers: "buyers and tenants",
    topics: ["available listings", "prices and payment plans", "service charges", "viewings", "off-plan projects", "areas and communities"],
    lead: "the client's name, phone number, budget and the property they asked about",
    peak: "late at night and at weekends, often from overseas investors in other time zones",
    content: "your listings, project brochures, payment plans and area guides",
    localQuestions: ["Which areas of {city} do you have 2-bedroom apartments in?", "Can an agent who speaks {language} show me the property?"],
    pages: "your listings, project pages and contact page",
  },
  salons: {
    label: "salons and spas", site: "salon and spa websites", customers: "clients",
    topics: ["services and prices", "availability", "stylists and therapists", "packages and offers", "opening hours", "booking requests"],
    lead: "the client's name, phone number, the service they want and a preferred time",
    peak: "in the evening and on the day before the weekend",
    content: "your service menu with prices, packages, staff specialities and opening hours",
    localQuestions: ["Do you have a slot for a blow-dry at your {city} salon tomorrow?", "Does anyone at the spa speak {language}?"],
    pages: "your services, prices and booking pages",
  },
  restaurants: {
    label: "restaurants", site: "restaurant websites", customers: "diners",
    topics: ["the menu", "opening hours", "reservations", "dietary options", "delivery areas", "private dining and catering"],
    lead: "the guest's name, phone number, party size and preferred date and time",
    peak: "in the afternoon and early evening, just before people decide where to eat",
    content: "your menu, opening hours, delivery areas and private dining details",
    localQuestions: ["Do you deliver to my area of {city}?", "Is your menu available in {language}?"],
    pages: "your menu, reservations and contact pages",
  },
  "car-rental": {
    label: "car rental companies", site: "car rental websites", customers: "renters",
    topics: ["daily and monthly rates", "documents needed", "deposits", "insurance", "delivery and collection", "mileage limits"],
    lead: "the renter's name, phone number, dates and the car they want",
    peak: "late at night and early in the morning, often from travellers about to land",
    content: "your rate card, rental requirements, deposit and insurance terms",
    localQuestions: ["Can you deliver the car to the airport in {city}?", "Do I need an international licence to rent in {city}?"],
    pages: "your fleet, prices and booking pages",
  },
  "coach-hire": {
    label: "bus and coach hire companies", site: "coach hire websites", customers: "group organisers",
    topics: ["vehicle sizes", "quotes", "routes and transfers", "drivers", "luggage", "group and event bookings"],
    lead: "the organiser's name, phone number, group size, date and route",
    peak: "in the evenings and at weekends, when organisers plan trips and events",
    content: "your fleet list, typical routes, pricing rules and booking terms",
    localQuestions: ["Do you have a 50-seat coach for an airport transfer in {city}?", "Can the driver speak {language}?"],
    pages: "your fleet, quote request and contact pages",
  },
  retail: {
    label: "shops and online stores", site: "online store websites", customers: "shoppers",
    topics: ["products and stock", "sizes and specifications", "delivery times and costs", "returns and exchanges", "payment options", "store hours"],
    lead: "the shopper's name, phone number and what they want to buy",
    peak: "in the evening and during sales and holidays",
    content: "your product pages, delivery and returns policies, and store details",
    localQuestions: ["How long does delivery take within {city}?", "Can I return an item at your {city} store?"],
    pages: "your product, delivery and returns pages",
  },
  gyms: {
    label: "gyms and fitness studios", site: "gym and fitness studio websites", customers: "members",
    topics: ["membership prices", "class timetables", "personal training", "trial sessions", "facilities", "freezing or cancelling"],
    lead: "the visitor's name, phone number and the membership or class they are interested in",
    peak: "early in the morning and late in the evening, around workout times",
    content: "your membership options, class timetable, trainers and facilities",
    localQuestions: ["Do you have a ladies-only area at your {city} gym?", "Is there a trainer who speaks {language}?"],
    pages: "your memberships, timetable and free trial pages",
  },
  hotels: {
    label: "hotels and holiday homes", site: "hotel and holiday home websites", customers: "guests",
    topics: ["room types and rates", "availability", "check-in and check-out", "airport transfers", "facilities", "cancellation policy"],
    lead: "the guest's name, phone number, dates and number of guests",
    peak: "around the clock, from guests in every time zone",
    content: "your room types, rates, policies, facilities and directions",
    localQuestions: ["How far is the hotel from the airport in {city}?", "Can I check in late at night in {city}?"],
    pages: "your rooms, offers and booking pages",
  },
  "travel-agencies": {
    label: "travel agencies", site: "travel agency websites", customers: "travellers",
    topics: ["holiday packages", "visas", "flights and hotels", "group tours", "prices and deposits", "travel insurance"],
    lead: "the traveller's name, phone number, destination, dates and number of travellers",
    peak: "in the evening and at weekends, when families plan their trips",
    content: "your packages, visa requirements, prices and booking terms",
    localQuestions: ["Do you arrange visas for travellers from {city}?", "Can a consultant who speaks {language} call me?"],
    pages: "your packages, visa and enquiry pages",
  },
  "training-centres": {
    label: "training centres and tutors", site: "training centre websites", customers: "students and parents",
    topics: ["courses and levels", "schedules", "fees", "certificates", "online or in-person classes", "placement tests"],
    lead: "the student's name, phone number and the course they want",
    peak: "in the evening, after work and school",
    content: "your course catalogue, schedules, fees and certification details",
    localQuestions: ["Do you have weekend classes at your {city} centre?", "Is there a course taught in {language}?"],
    pages: "your courses, schedules and registration pages",
  },
  schools: {
    label: "schools and nurseries", site: "school and nursery websites", customers: "parents",
    topics: ["admissions", "fees", "curriculum", "school transport", "age requirements", "visits and tours"],
    lead: "the parent's name, phone number, the child's age and the year group they are applying for",
    peak: "in the evening and during the admissions season",
    content: "your admissions process, fee structure, curriculum and transport details",
    localQuestions: ["Do you have school bus routes across {city}?", "Do you teach {language} as a subject?"],
    pages: "your admissions, fees and contact pages",
  },
  "law-firms": {
    label: "law firms", site: "law firm websites", customers: "clients",
    topics: ["practice areas", "consultation fees", "the documents needed", "lawyers and languages", "office hours", "booking a consultation"],
    lead: "the client's name, phone number and the kind of matter they need help with",
    peak: "in the evening, when people finally sit down to deal with a legal problem",
    content: "your practice areas, consultation process, fees and office details",
    localQuestions: ["Do you have a lawyer in {city} who speaks {language}?", "How much is a first consultation at your {city} office?"],
    pages: "your practice areas and consultation pages",
  },
  "accounting-firms": {
    label: "accounting and tax firms", site: "accounting firm websites", customers: "clients",
    topics: ["bookkeeping packages", "tax and VAT filing", "company setup", "fees", "deadlines", "the documents needed"],
    lead: "the client's name, phone number, company type and the service they need",
    peak: "before filing deadlines and in the evening",
    content: "your service packages, fees, deadlines and onboarding checklist",
    localQuestions: ["Do you help with company setup in {city}?", "Is there an accountant who speaks {language}?"],
    pages: "your services, packages and contact pages",
  },
  "car-service": {
    label: "car service and repair garages", site: "garage and car service websites", customers: "car owners",
    topics: ["service prices", "repairs and diagnostics", "parts", "pick-up and drop-off", "warranty", "booking a service"],
    lead: "the owner's name, phone number, car make and model, and what needs doing",
    peak: "in the evening and at weekends, when drivers notice a problem",
    content: "your service menu, prices, warranty terms and opening hours",
    localQuestions: ["Do you offer pick-up and drop-off anywhere in {city}?", "How much is a full service for my car in {city}?"],
    pages: "your services, prices and booking pages",
  },
  "home-services": {
    label: "home services companies", site: "home services websites", customers: "homeowners",
    topics: ["services offered", "call-out fees", "quotes", "availability", "areas covered", "emergency visits"],
    lead: "the homeowner's name, phone number, address area and the job they need done",
    peak: "in the evening and at weekends, often when something has just broken",
    content: "your service list, pricing, areas covered and booking process",
    localQuestions: ["Do you cover my area of {city}?", "Can a technician who speaks {language} come today?"],
    pages: "your services, areas and quote request pages",
  },
  "event-venues": {
    label: "event venues and planners", site: "event venue websites", customers: "event organisers",
    topics: ["capacity", "packages and prices", "available dates", "catering", "decoration and AV", "site visits"],
    lead: "the organiser's name, phone number, event type, date and number of guests",
    peak: "in the evening and at weekends, when couples and companies plan events",
    content: "your spaces, capacities, packages, menus and availability rules",
    localQuestions: ["Do you have a hall in {city} for 300 guests in March?", "Can your planner speak {language} with our family?"],
    pages: "your venues, packages and enquiry pages",
  },
};
