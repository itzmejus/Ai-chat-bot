import type { SiteContent } from "../types";
import type { NewIndustry } from "./slugs";

type Industry = SiteContent["industries"][NewIndustry];

/** More industry pages. Sample prices are illustrations, written as a business would put them. */
export const industriesMoreEn: Record<NewIndustry, Industry> = {
  gyms: {
    name: "Gyms and fitness studios",
    short: "Memberships, class times, trials and personal training enquiries.",
    meta: {
      title: "AI chatbot for gyms and fitness studios",
      description: "An AI assistant for gyms and fitness studios. It answers questions on memberships, class schedules, trials and personal training, and captures new member enquiries.",
    },
    h1: "Turn membership questions into new members",
    sub: "People compare gyms in the evening, on their phones. The assistant answers about prices, classes and trials instantly and passes keen prospects to your team.",
    questions: ["How much is a monthly membership?", "Do you have ladies-only hours?", "هل يوجد يوم تجربة مجاني؟", "What time is the first yoga class?", "Do you offer personal training?"],
    benefits: [
      { title: "Never miss a prospect", text: "Membership enquiries at 10 pm are answered, and the visitor's name and number are waiting for your sales team in the morning." },
      { title: "Your timetable on demand", text: "Upload your class schedule and the assistant answers \"when is the next spin class?\" correctly." },
      { title: "Front desk freed up", text: "Staff spend less time repeating prices and more time with members in the gym." },
    ],
    chat: [
      { from: "customer", text: "Do you have a free trial?" },
      { from: "assistant", text: "Yes, your first day is free, including any class. Shall I take your name and number so the team can book it for you?" },
    ],
  },

  hotels: {
    name: "Hotels and holiday homes",
    short: "Rooms, facilities, check-in times and booking requests.",
    meta: {
      title: "AI chatbot for hotels and holiday homes",
      description: "An AI assistant for hotels, apartments and holiday homes. It answers guests' questions on rooms, facilities, check-in and policies in their language, day and night.",
    },
    h1: "Answer every guest question, in every language, at any hour",
    sub: "Guests write from every time zone. The assistant answers about rooms, facilities and policies instantly and passes booking requests to your reservations team.",
    questions: ["What time is check-in?", "Is breakfast included?", "Есть ли трансфер из аэропорта?", "Do you allow pets?", "Is there parking for guests?"],
    benefits: [
      { title: "Guests from everywhere", text: "Questions in Russian, German, Arabic or Hindi are answered in the same language, from one set of information." },
      { title: "Fewer emails to reception", text: "Check-in times, Wi-Fi, parking and pool hours are answered in the chat instead of the inbox." },
      { title: "Requests for your reservations team", text: "Guests who want specific dates leave their details, ready for your team to confirm availability and rates." },
    ],
    chat: [
      { from: "customer", text: "Can I check in early? My flight lands at 8 am." },
      { from: "assistant", text: "Standard check-in is at 3 pm. Early check-in depends on availability on the day; I can pass your request to reception with your arrival time." },
    ],
  },

  "travel-agencies": {
    name: "Travel agencies",
    short: "Packages, visas, itineraries and quote requests.",
    meta: {
      title: "AI chatbot for travel agencies and tour operators",
      description: "An AI assistant for travel agencies. It answers questions on packages, inclusions, visa requirements you list and payment terms, and captures quote requests.",
    },
    h1: "Answer travellers while they are still dreaming",
    sub: "People plan holidays in the evening and at weekends. The assistant explains your packages instantly and collects quote requests with dates and group size.",
    questions: ["What is included in the Georgia package?", "Do you help with visas?", "क्या बच्चों के लिए छूट है?", "Can I pay in instalments?", "Do you have honeymoon packages?"],
    benefits: [
      { title: "Packages explained clearly", text: "Upload your brochures and the assistant answers what is included, from flights to transfers." },
      { title: "Quote requests with context", text: "Each request arrives with the destination, dates and travellers the customer mentioned in the chat." },
      { title: "Peak season under control", text: "Holiday rushes no longer bury your agents in the same questions." },
    ],
    chat: [
      { from: "customer", text: "What's included in your Maldives package?" },
      { from: "assistant", text: "It includes return flights, 4 nights half board and airport transfers by speedboat. Would you like a quote for your dates?" },
    ],
  },

  "training-centres": {
    name: "Training centres and tutors",
    short: "Courses, schedules, fees and enrolment enquiries.",
    meta: {
      title: "AI chatbot for training centres, institutes and tutors",
      description: "An AI assistant for training centres and tutoring. It answers questions on courses, schedules, fees and certificates, and collects enrolment enquiries.",
    },
    h1: "Answer course enquiries and fill your classes",
    sub: "Students and parents compare courses online. The assistant explains your courses, timings and fees and collects enrolment enquiries for your admissions team.",
    questions: ["When does the next IELTS course start?", "Are classes online or in person?", "ما هي رسوم دورة اللغة الإنجليزية؟", "Do you give a certificate?", "Is there a weekend batch?"],
    benefits: [
      { title: "Course details on demand", text: "Durations, timings, fees and requirements, answered from your course list." },
      { title: "Enquiries ready to call", text: "Each enquiry arrives with the course the student asked about and their contact details." },
      { title: "Parents and students in their language", text: "Families can ask in Arabic, English, Hindi or Urdu and get clear answers." },
    ],
    chat: [
      { from: "customer", text: "Do you have evening classes for beginners?" },
      { from: "assistant", text: "Yes, beginner English runs Monday and Wednesday from 7 to 9 pm for 8 weeks. Would you like the admissions team to call you?" },
    ],
  },

  schools: {
    name: "Schools and nurseries",
    short: "Admissions, fees, transport and visits.",
    meta: {
      title: "AI chatbot for schools and nurseries: admissions enquiries",
      description: "An AI assistant for schools and nurseries. It answers parents' questions on admissions, curriculum, fees and transport, and collects requests for tours.",
    },
    h1: "Answer parents' questions during admissions season",
    sub: "Parents research schools late at night. The assistant answers about curriculum, fees and transport and collects requests for a school tour.",
    questions: ["Which curriculum do you follow?", "What are the fees for Year 1?", "هل يوجد نقل مدرسي؟", "Is there a waiting list?", "Can we book a school tour?"],
    benefits: [
      { title: "Admissions office relieved", text: "Fees, age requirements and documents needed are answered in the chat, not by phone." },
      { title: "Tours booked from interest", text: "Parents who want to visit leave their details for your admissions team." },
      { title: "Every family welcome", text: "Parents can ask in their preferred language, and the answers come from your official information." },
    ],
    chat: [
      { from: "customer", text: "What documents do I need to apply?" },
      { from: "assistant", text: "You'll need the child's passport and Emirates ID, recent school reports and a passport photo. Would you like to book a school tour?" },
    ],
  },

  "law-firms": {
    name: "Law firms",
    short: "Practice areas, consultations and first enquiries.",
    meta: {
      title: "AI chatbot for law firms: capture consultation requests",
      description: "An AI assistant for law firms. It explains your practice areas, fees for consultations and process, and collects consultation requests, without giving legal advice.",
    },
    h1: "Respond to every potential client, without giving legal advice",
    sub: "People contact several firms at once. The assistant explains how you work and collects consultation requests, and leaves legal questions to your lawyers.",
    questions: ["Do you handle employment cases?", "How much is a consultation?", "هل تتعاملون مع قضايا الأحوال الشخصية؟", "Can we meet online?", "What documents should I bring?"],
    benefits: [
      { title: "First contact, handled professionally", text: "Prospective clients learn your practice areas, consultation fees and process straight away." },
      { title: "No legal advice from the bot", text: "Questions about a specific case are passed to your team, and the assistant only answers from information you approve." },
      { title: "Requests ready for review", text: "Each consultation request comes with the client's description of their matter." },
    ],
    chat: [
      { from: "customer", text: "Can you help with a rental dispute?" },
      { from: "assistant", text: "Yes, property and rental disputes are one of our practice areas. A first consultation is 45 minutes. Shall I take your details so a lawyer can contact you?" },
    ],
  },

  "accounting-firms": {
    name: "Accounting and tax firms",
    short: "Services, VAT and corporate tax questions, and new client enquiries.",
    meta: {
      title: "AI chatbot for accounting, bookkeeping and tax firms",
      description: "An AI assistant for accountants and tax consultants. It explains your services, packages and onboarding, and captures new client enquiries for your team.",
    },
    h1: "Win new clients while you are busy with deadlines",
    sub: "Enquiries peak exactly when you are busiest. The assistant explains your services and packages and collects new client details for when you have time.",
    questions: ["Do you offer VAT registration?", "How much is monthly bookkeeping?", "هل تقدمون خدمات ضريبة الشركات؟", "Do you work with freelancers?", "What do you need to get started?"],
    benefits: [
      { title: "Services explained", text: "Bookkeeping, VAT, payroll and audit support, explained from your own service descriptions and packages." },
      { title: "Busy season covered", text: "Enquiries during filing deadlines are answered and saved instead of waiting days for a reply." },
      { title: "No advice without you", text: "Specific tax questions are passed to your team rather than answered by the assistant." },
    ],
    chat: [
      { from: "customer", text: "Do you do bookkeeping for small companies?" },
      { from: "assistant", text: "Yes, our bookkeeping packages start from AED 750 a month for up to 100 transactions. Would you like an accountant to contact you?" },
    ],
  },

  "car-service": {
    name: "Car service and repair",
    short: "Servicing, repairs, prices and booking requests for garages.",
    meta: {
      title: "AI chatbot for garages and car service centres",
      description: "An AI assistant for garages and car service centres. It answers questions on servicing, repairs, prices and pick-up, and collects booking requests.",
    },
    h1: "Book more services without picking up the phone",
    sub: "Your technicians are under the cars, not on the phone. The assistant answers service and price questions and collects booking requests with the car's details.",
    questions: ["How much is a minor service?", "Do you offer pick-up and drop-off?", "كم تكلفة تغيير الزيت؟", "Do you work on German cars?", "How long does a service take?"],
    benefits: [
      { title: "Prices answered instantly", text: "Service packages, oil changes and common repairs quoted from your price list." },
      { title: "Bookings with details", text: "Requests arrive with the customer's name, number and the car they mentioned." },
      { title: "Fewer interruptions", text: "Routine calls drop, so the workshop keeps working." },
    ],
    chat: [
      { from: "customer", text: "How much is a full service for a Toyota Camry?" },
      { from: "assistant", text: "A full service for a Camry is AED 650, including oil, filters and a 50-point check. Would you like to book it?" },
    ],
  },

  "home-services": {
    name: "Home services",
    short: "AC, cleaning, plumbing and maintenance enquiries.",
    meta: {
      title: "AI chatbot for home services: AC, cleaning and maintenance",
      description: "An AI assistant for home service companies: AC maintenance, cleaning, plumbing and handyman services. It answers price and area questions and collects job requests.",
    },
    h1: "Capture every job request, even while your team is on site",
    sub: "Customers want to know if you cover their area and what it costs. The assistant answers and collects the job details for your dispatcher.",
    questions: ["Do you cover Jumeirah Village Circle?", "How much is AC cleaning for a 2-bedroom?", "ممكن تنظيف عميق للشقة؟", "Do you have same-day service?", "Is there a call-out charge?"],
    benefits: [
      { title: "Areas and prices answered", text: "Service areas, call-out charges and package prices, straight from your price list." },
      { title: "Job requests with details", text: "The customer's description of the job is attached to every request." },
      { title: "Urgent jobs flagged", text: "Customers who need a person are flagged in your inbox and your team is emailed." },
    ],
    chat: [
      { from: "customer", text: "How much is AC servicing for a 3-bedroom villa?" },
      { from: "assistant", text: "AC servicing for a 3-bedroom villa is AED 450 for up to 5 units, including cleaning and gas check. Shall I take your address and preferred day?" },
    ],
  },

  "event-venues": {
    name: "Event venues and planners",
    short: "Capacity, packages, dates and event enquiries.",
    meta: {
      title: "AI chatbot for event venues and event planners",
      description: "An AI assistant for event venues and planners. It answers questions on capacity, packages, catering and dates, and collects event enquiries with the details.",
    },
    h1: "Turn event enquiries into site visits",
    sub: "Event enquiries come in with many questions. The assistant answers capacity, package and catering questions and collects the date, guest count and contact details.",
    questions: ["What is the capacity of the main hall?", "Do you allow outside catering?", "هل تتوفر قاعة لحفل زفاف في ديسمبر؟", "Is there a minimum spend?", "Do you provide audio-visual equipment?"],
    benefits: [
      { title: "Packages explained", text: "Capacities, inclusions and starting prices answered from your brochures." },
      { title: "Enquiries with the essentials", text: "Each enquiry includes the event type, date and number of guests mentioned in the chat." },
      { title: "Faster than your competitors", text: "Couples and companies usually contact several venues; the first clear answer stands out." },
    ],
    chat: [
      { from: "customer", text: "Can the garden host 200 guests for a wedding?" },
      { from: "assistant", text: "Yes, the garden seats up to 250 guests for a dinner. Packages start from AED 95,000. Would you like to arrange a visit?" },
    ],
  },
};
