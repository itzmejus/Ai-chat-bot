import type { SiteContent } from "./types";

export const en: SiteContent = {
  nav: {
    features: "Features",
    pricing: "Pricing",
    industries: "Industries",
    login: "Log in",
    start: "Start free",
    menu: "Menu",
    otherLanguage: "العربية",
    skip: "Skip to content",
  },

  home: {
    meta: {
      title: "{name}: AI customer support chatbot for UAE businesses, in your customers' language",
      description:
        "Add an AI assistant to your website in minutes. It answers customers 24/7 in their own language using only your business information, captures leads, and hands over to your team when needed.",
    },
    badge: "Built for businesses in the UAE",
    h1: ["AI customer support that speaks ", "your customers' language", ""],
    sub: "An assistant for your website that answers customers day and night using only your business information, collects their contact details, and calls in your team when a person is needed.",
    ctaPrimary: "Start free",
    ctaSecondary: "See how it works",
    assurances: ["Free plan, no card needed", "Live on your site in minutes", "Replies in the language customers write"],
    demo: {
      site: "brightsmile.ae",
      assistant: "Noor",
      status: "Online · Bright Smile Dental Clinic",
      placeholder: "Type a message…",
      chat: [
        { from: "customer", text: "Hi, how much is teeth whitening?" },
        { from: "assistant", text: "Laser whitening is AED 900 for a one-hour session. Would you like to book?" },
        { from: "customer", text: "وهل تقبلون تأمين ضمان؟" },
        { from: "assistant", text: "نعم، نتعامل مباشرة مع ضمان. ممكن اسمك ورقم هاتفك لنأكد لك الموعد؟" },
      ],
      leadTitle: "New lead captured",
      leadName: "Fatima Al Marzouqi",
      leadPhone: "+971 50 555 0142",
      answered: "Answered from your price list",
    },
    madeFor: "Made for",
    steps: {
      eyebrow: "How it works",
      title: "From sign-up to answering customers in three steps",
      sub: "No developers, no training sessions, no scripts to write.",
      items: [
        { title: "Add your business information", text: "Enter your website address and the assistant reads up to 50 pages. Upload PDF, Word or text files, add FAQs, or just type what customers should know." },
        { title: "Paste one line of code", text: "Choose your colour, logo and greeting, then copy a single script tag into your website. It works with WordPress, Shopify, Wix, Webflow and custom sites." },
        { title: "Let it answer, and step in when you want", text: "Customers get instant answers in their language. You see every conversation, get an email for each new lead, and can take over a chat with one click." },
      ],
    },
    features: {
      eyebrow: "What you get",
      title: "Everything a small team needs to never miss a customer",
      sub: "One assistant, one inbox, one place for your leads.",
      items: {
        grounded: { title: "Answers only from your information", text: "The assistant replies using what you gave it and nothing else. When it does not know, it says so and offers to connect the customer with your team instead of guessing." },
        bilingual: { title: "Replies in your customers' language", text: "It replies in the language the customer writes in, from Gulf Arabic to Hindi, Urdu, French or Russian, and the chat window switches to right-to-left when the language needs it." },
        leads: { title: "Turns chats into leads", text: "When a customer wants to book or buy, the assistant asks for their name and phone number and saves them to your leads list. Export to CSV any time." },
        handover: { title: "Human takeover in one click", text: "Jump into any conversation. The AI pauses, your reply appears in the customer's chat instantly, and you can hand it back when you are done." },
        inbox: { title: "A live inbox for your team", text: "Every conversation in one place, updated as it happens, with filters for chats that need a person and search by name or phone." },
        insights: { title: "See what customers ask", text: "The most asked questions, and the ones your assistant could not answer, with a button to add the missing answer." },
        widget: { title: "A chat widget that matches your brand", text: "Your colour, logo, position and greeting. Optional form to collect name and phone before the chat starts. Looks right on phones." },
        security: { title: "Your data stays yours", text: "Each business's data is kept strictly separate. The widget only loads on the websites you approve." },
      },
      more: "See all features",
    },
    handover: {
      eyebrow: "AI and people, together",
      title: "The assistant knows when to call a human",
      text: "Some conversations need a person: a complaint, an unusual request, a customer who simply asks. The assistant flags those chats, emails your team, and steps aside the moment someone takes over.",
      flow: [
        { title: "The AI answers first", text: "Prices, opening hours, policies: routine questions get an instant answer from your own information, day and night." },
        { title: "It knows when to stop", text: "A complaint, an unusual request, or a customer who asks for a person. The chat is flagged and your team is told straight away." },
        { title: "Your team steps in", text: "One click to take over. The AI goes quiet while you reply, and picks the chat up again when you hand it back." },
      ],
      points: ["Flags chats it cannot answer with confidence", "\"Talk to a human\" button always available to customers", "Email alert the moment a chat needs you", "Hand the chat back to the AI when you are done"],
      inboxTitle: "Inbox",
      filters: ["All", "Needs human", "AI handled", "Closed"],
      takeover: "Take over",
      chat: [
        { from: "customer", text: "My son has a bad toothache, can I speak to someone?" },
        { from: "assistant", text: "Of course. We keep same-day slots for emergencies. I am connecting you with our team now." },
        { from: "note", text: "Sara joined the chat" },
        { from: "agent", text: "Hi, this is Sara from reception. We can see him today at 5:30 pm. Does that work?" },
      ],
      names: ["Khalid Al Mansoori", "Fatima Al Marzouqi", "James Carter"],
    },
    stats: [
      { value: "24/7", label: "Answers day and night, weekends and holidays" },
      { value: "Any", label: "Language your customer writes in: the assistant replies in the same one" },
      { value: "1", label: "Line of code to add the widget to your site" },
      { value: "50", label: "Pages of your website it reads to build its knowledge" },
    ],
    industries: {
      eyebrow: "Industries",
      title: "Set up for the way UAE businesses work",
      sub: "The same assistant, tuned to the questions your customers actually ask.",
      link: "Learn more",
    },
    pricing: {
      eyebrow: "Pricing",
      title: "Start free. Upgrade when your chats grow",
      sub: "Simple monthly plans in dirhams. Every plan includes multilingual answers, lead capture and human takeover.",
      link: "Compare plans",
    },
    faq: {
      eyebrow: "Questions",
      title: "Frequently asked questions",
      sub: "What business owners ask us before they start.",
      items: [
        { q: "What is {name}?", a: "{name} is an AI customer support assistant for your website. You give it your business information, add a chat widget to your site with one line of code, and it answers your customers' questions around the clock in their own language." },
        { q: "Will the AI make up answers?", a: "It is built not to. The assistant answers only from the information you provide: your website pages, files, FAQs and notes. If the answer is not there, it tells the customer it does not have that information and offers to connect them with your team." },
        { q: "Does it really understand Arabic?", a: "Yes. It replies in the language the customer uses, including Gulf dialect, and the chat window switches to a right-to-left layout for Arabic. Your knowledge can be in English, Arabic or both. It also answers customers who write in other languages, such as Hindi, Urdu, French or Russian." },
        { q: "How long does setup take?", a: "You can be live in a few minutes. Enter your website address so the assistant can read it, review the answers in the test chat, then paste the embed code into your website." },
        { q: "Do I need a developer?", a: "No. Adding the widget is a single line of code pasted before the closing body tag, or into the custom code box of WordPress, Shopify, Wix or Webflow." },
        { q: "What happens when a customer wants to talk to a person?", a: "Customers can press \"Talk to a human\" at any time. The chat is flagged in your inbox, your team gets an email, and any team member can take over. While a person is replying, the AI stays silent." },
        { q: "How are leads captured?", a: "When a customer shows interest in booking or buying, the assistant asks for their name and phone number. The details are saved to your leads list with a link to the conversation, and you can be emailed for each new lead." },
        { q: "Can I use it on WhatsApp?", a: "The website chat widget is available today. WhatsApp and Instagram are planned next and will arrive in the same inbox." },
        { q: "Is my business data kept private?", a: "Yes. Every business has its own separate workspace, and one business's information is never used to answer another's customers. The widget only works on the websites you approve." },
        { q: "How much does it cost?", a: "There is a free plan to get started, and paid plans with higher message limits, more knowledge pages and more team members. See the pricing page for details." },
      ],
    },
    cta: {
      title: "Give your customers an answer in seconds, not hours",
      sub: "Create your assistant now. It takes a few minutes and the free plan needs no card.",
      button: "Start free",
      note: "Free plan · Multilingual · Cancel any time",
    },
  },

  featuresPage: {
    meta: {
      title: "Features: AI chatbot, live inbox, lead capture and human takeover",
      description:
        "Everything in {name}: an AI assistant trained on your business information, a multilingual chat widget, a live team inbox, human takeover, lead capture with CSV export, and analytics on what customers ask.",
    },
    eyebrow: "Features",
    h1: "One assistant, one inbox, every customer answered",
    sub: "{name} combines an AI assistant that knows your business with the tools your team needs to step in, follow up and improve.",
    groups: [
      {
        key: "grounded",
        title: "An assistant trained on your business",
        text: "Build its knowledge from the material you already have. It answers from that material only.",
        points: ["Reads your website: up to 50 pages per site, respecting robots.txt", "Upload PDF, Word and text files", "Add question-and-answer pairs and free-form business notes", "Re-sync a source when your information changes", "Says \"I don't know\" and offers a person instead of inventing an answer", "Test chat that shows the confidence and sources behind each reply"],
      },
      {
        key: "bilingual",
        title: "Multilingual by design",
        text: "Made for a market where one customer writes in English, the next in Arabic, and the one after in Hindi.",
        points: ["Replies in the customer's language, including Gulf dialect", "Also answers in Hindi, Urdu, French, Russian and other languages customers write", "Chat window in a growing list of languages, switching to right-to-left automatically", "Dashboard in English and Arabic, with more languages on the way", "Knowledge base can mix languages", "Formal or friendly tone, your choice"],
      },
      {
        key: "widget",
        title: "A chat widget your customers will use",
        text: "Fast, small and styled to match your site.",
        points: ["One line of code to install", "Your brand colour, logo, position and greeting", "Optional pre-chat form for name and phone", "Typing indicator and replies that appear word by word", "Remembers the conversation while the customer browses", "A compact sheet on phones that never covers the whole page", "Only loads on the websites you approve"],
      },
      {
        key: "handover",
        title: "Human takeover",
        text: "Your team stays in control of every conversation.",
        points: ["Take over any chat with one click; the AI pauses", "Your replies reach the customer instantly", "\"Talk to a human\" button in the widget", "Chats the AI could not answer are flagged automatically", "Email alert when a chat needs a person", "Return the chat to the AI or close it"],
      },
      {
        key: "inbox",
        title: "A shared inbox",
        text: "All conversations in one live list.",
        points: ["Updates in real time, no refreshing", "Filter by needs human, AI handled or closed", "Search by name, phone number or message text", "Unread markers", "Invite your team as owners or agents"],
      },
      {
        key: "leads",
        title: "Lead capture",
        text: "Interest turns into a name and a number you can call.",
        points: ["The assistant asks for name and phone when a customer wants to book or buy", "Leads list with status: new, contacted, converted", "Jump from a lead to its conversation", "Export to CSV, Arabic names included", "Email for each new lead"],
      },
      {
        key: "insights",
        title: "Analytics that tell you what to fix",
        text: "Know what customers want and where your information has gaps.",
        points: ["Conversations per day and how each was handled", "Most asked questions, with similar wording grouped", "Unanswered questions with one-click \"Add answer\"", "Usage against your plan"],
      },
      {
        key: "security",
        title: "Privacy and security",
        text: "Built as a multi-business platform from the first line of code.",
        points: ["Each business's data is isolated from every other", "Approved-website list for the widget", "Rate limits on the public chat", "Protection against attempts to trick the assistant into ignoring its rules", "Roles: owners manage settings, agents handle chats"],
      },
    ],
    channels: {
      title: "Channels",
      text: "Start on your website today. More channels will land in the same inbox.",
      live: "Available",
      soon: "Coming soon",
      items: [
        { name: "Website chat widget", live: true },
        { name: "WhatsApp", live: false },
        { name: "Instagram", live: false },
      ],
    },
  },

  pricingPage: {
    meta: {
      title: "Pricing: free plan and simple monthly plans in AED",
      description: "{name} pricing. Start with a free plan, then choose a monthly plan in dirhams by the number of AI messages, knowledge pages and team members you need.",
    },
    eyebrow: "Pricing",
    h1: "Simple plans that grow with your business",
    sub: "Start free. Every plan includes multilingual answers, lead capture, human takeover and the live inbox.",
    perMonth: "per month",
    free: "Free",
    popular: "Most popular",
    plans: {
      free: { name: "Free", tagline: "Try it on your site", cta: "Start free" },
      starter: { name: "Starter", tagline: "For a growing business", cta: "Get started" },
      pro: { name: "Pro", tagline: "For busy teams", cta: "Get started" },
    },
    limits: { messages: "AI messages per month", pages: "knowledge pages", seats: "team members" },
    included: {
      title: "Included in every plan",
      items: ["Answers in your customers' language", "Customisable chat widget", "Lead capture and CSV export", "Human takeover and live inbox", "Email notifications", "Most asked and unanswered questions"],
    },
    compare: { title: "Compare plans", feature: "What you get", price: "Monthly price", yes: "Included" },
    faq: {
      title: "Pricing questions",
      items: [
        { q: "What counts as an AI message?", a: "Each reply the assistant sends to a customer counts as one message. Messages your team sends and the test chat in your dashboard are not counted." },
        { q: "What happens if I reach my monthly limit?", a: "The widget stays on your site. Instead of an AI answer, customers are shown your contact details and can leave their name and number, and the chat is flagged for your team. The count resets at the start of each month." },
        { q: "What is a knowledge page?", a: "One page read from your website, or one file, FAQ or notes entry. A 20-page website uses 20 knowledge pages." },
        { q: "Can I change plan later?", a: "Yes, you can move up or down at any time." },
        { q: "Is there a contract?", a: "No. Plans are monthly and you can cancel whenever you like." },
      ],
    },
  },

  industriesPage: {
    meta: {
      title: "AI chatbot by industry: clinics, real estate, salons, restaurants, car rental, retail",
      description: "See how {name} answers customers in your industry. Sample questions and conversations for clinics, real estate agencies, salons, restaurants, car rental companies and shops in the UAE.",
    },
    h1: "An assistant that already knows your kind of business",
    sub: "Pick your industry to see the questions it answers and how a conversation goes.",
    all: "All industries",
  },

  industryPage: { eyebrow: "Industries", asks: "Questions it answers for you", benefits: "Why it fits", other: "Other industries", cta: "Start free" },

  industries: {
    clinics: {
      name: "Clinics",
      short: "Prices, insurance, doctors and appointment requests.",
      meta: {
        title: "AI chatbot for clinics in Dubai and the UAE",
        description: "An AI assistant for dental and medical clinics. It answers questions about prices, insurance, doctors and opening hours in your customers' language, and collects appointment requests around the clock.",
      },
      h1: "An AI receptionist for your clinic, in your patients' language",
      sub: "Patients ask the same questions every day: prices, insurance, opening hours, which doctor. Let the assistant answer them instantly and pass appointment requests to your reception.",
      questions: ["How much is a check-up?", "Do you accept Daman insurance?", "هل عندكم طبيب أسنان للأطفال؟", "Are you open on Friday?", "Can I get an appointment today?"],
      benefits: [
        { title: "Fewer calls to reception", text: "Routine questions are answered in the chat, so your front desk can focus on the patients in the clinic." },
        { title: "Appointment requests after hours", text: "The assistant takes the patient's name and number at 11 pm, and reception calls back in the morning." },
        { title: "Accurate, never improvised", text: "It quotes only the prices and policies you gave it, and hands medical questions to your team." },
      ],
      chat: [
        { from: "customer", text: "Do you accept Daman for a check-up?" },
        { from: "assistant", text: "Yes, we work directly with Daman. Please bring your insurance card and Emirates ID. Would you like to book?" },
      ],
    },
    "real-estate": {
      name: "Real estate",
      short: "Listings, viewings and payment plans, with every enquiry saved.",
      meta: {
        title: "AI chatbot for real estate agencies in Dubai and the UAE",
        description: "An AI assistant for real estate brokers and developers. It answers questions about listings, payment plans and viewings in your customers' language, and captures every buyer and tenant enquiry as a lead.",
      },
      h1: "Capture every property enquiry, even at midnight",
      sub: "Buyers and tenants browse at all hours and from every time zone. The assistant answers their first questions and gives your agents a name and number to call.",
      questions: ["Is the 2-bedroom in Marina still available?", "What is the payment plan?", "كم رسوم الخدمات السنوية؟", "Can I book a viewing on Saturday?", "Do you have off-plan projects?"],
      benefits: [
        { title: "No enquiry goes cold", text: "Overseas investors get an answer in seconds instead of waiting for office hours in Dubai." },
        { title: "Qualified leads for your agents", text: "Each lead arrives with the conversation attached, so the agent knows what the client asked before calling." },
        { title: "Your listings, your words", text: "Upload brochures and price lists; the assistant answers from them and nothing else." },
      ],
      chat: [
        { from: "customer", text: "What's the payment plan for the Creek project?" },
        { from: "assistant", text: "It is 60/40: 60% during construction and 40% on handover. Shall I have an agent call you with the full details?" },
      ],
    },
    salons: {
      name: "Salons and spas",
      short: "Services, prices, availability and booking requests.",
      meta: {
        title: "AI chatbot for salons and spas in Dubai and the UAE",
        description: "An AI assistant for beauty salons, barbers and spas. It answers questions about services, prices and opening hours in your customers' language and collects booking requests while you work.",
      },
      h1: "Answer booking questions while your hands are busy",
      sub: "Your team is with clients, not on the phone. The assistant replies to price and availability questions instantly and collects booking requests for you to confirm.",
      questions: ["How much is a hair colour?", "Do you do home service?", "هل عندكم باقات للعرايس؟", "What time do you close today?", "Can I book for two people?"],
      benefits: [
        { title: "Stop missing messages", text: "Customers who do not get a quick reply book elsewhere. Now they always get one." },
        { title: "Your full price list, on demand", text: "Upload your service menu once and the assistant quotes it accurately." },
        { title: "Bookings to confirm, not chase", text: "Each request arrives with a name and number, ready for you to confirm." },
      ],
      chat: [
        { from: "customer", text: "كم سعر صبغة الشعر؟" },
        { from: "assistant", text: "صبغة الشعر تبدأ من 250 درهماً حسب الطول. تحبين أحجز لك موعد؟" },
      ],
    },
    restaurants: {
      name: "Restaurants",
      short: "Menus, hours, location, reservations and catering enquiries.",
      meta: {
        title: "AI chatbot for restaurants and cafes in Dubai and the UAE",
        description: "An AI assistant for restaurants and cafes. It answers questions about the menu, opening hours, location, parking and catering in your customers' language, and takes reservation requests.",
      },
      h1: "Answer every \"are you open?\" without picking up the phone",
      sub: "Menu, hours, location, parking, allergens, group bookings. The assistant handles the questions that interrupt service and collects reservation and catering requests.",
      questions: ["Are you open during Ramadan?", "Do you have vegetarian options?", "هل يوجد جلسات خارجية؟", "Can I book a table for 10?", "Do you do catering?"],
      benefits: [
        { title: "Quiet phones during service", text: "Routine questions are answered in the chat, so staff stay with your guests." },
        { title: "Group and catering leads", text: "Larger enquiries are captured with contact details for a manager to follow up." },
        { title: "Always up to date", text: "Change your hours or menu in one place and the assistant uses the new information." },
      ],
      chat: [
        { from: "customer", text: "Do you have outdoor seating?" },
        { from: "assistant", text: "Yes, we have a terrace with 12 tables, open in the evenings. Would you like to reserve one?" },
      ],
    },
    "car-rental": {
      name: "Car rental",
      short: "Rates, requirements, deposits and delivery, any time of day.",
      meta: {
        title: "AI chatbot for car rental companies in Dubai and the UAE",
        description: "An AI assistant for car rental companies. It answers questions about daily and monthly rates, deposits, required documents and delivery in your customers' language, and captures booking enquiries around the clock.",
      },
      h1: "Quote rates and requirements the moment a customer asks",
      sub: "Tourists and residents compare several rental companies at once. The first clear answer usually wins the booking.",
      questions: ["How much is a monthly rental?", "What documents do tourists need?", "كم مبلغ التأمين؟", "Do you deliver to the airport?", "Is Salik included?"],
      benefits: [
        { title: "Be the first to reply", text: "Instant answers on rates, deposits and documents, including late at night when flights land." },
        { title: "Bookings with contact details", text: "The assistant takes the customer's name and number so your team can confirm the car." },
        { title: "Clear on the rules", text: "It explains your deposit, mileage and insurance terms exactly as you wrote them." },
      ],
      chat: [
        { from: "customer", text: "What do I need to rent a car as a tourist?" },
        { from: "assistant", text: "Your passport, visit visa, and home country licence with an international driving permit. Shall I check a car for your dates?" },
      ],
    },
    retail: {
      name: "Retail and e-commerce",
      short: "Products, delivery, returns and stock questions.",
      meta: {
        title: "AI chatbot for retail and online shops in the UAE",
        description: "An AI assistant for shops and online stores. It answers questions about products, delivery, returns and payment in your customers' language, and captures customers who are ready to buy.",
      },
      h1: "Answer product and delivery questions before the customer leaves",
      sub: "Shoppers with an unanswered question abandon the page. The assistant replies in seconds with your delivery times, return policy and product details.",
      questions: ["Do you deliver to Abu Dhabi?", "What is your return policy?", "هل الدفع عند الاستلام متاح؟", "How long does delivery take?", "Do you have this in other sizes?"],
      benefits: [
        { title: "Fewer abandoned visits", text: "Delivery and return questions are answered while the customer is still deciding." },
        { title: "Support that scales with sales", text: "Promotions and sale days no longer flood your team with the same questions." },
        { title: "Works on any store", text: "One line of code on Shopify, WooCommerce or a custom site." },
      ],
      chat: [
        { from: "customer", text: "Do you deliver to Abu Dhabi?" },
        { from: "assistant", text: "Yes, delivery to Abu Dhabi takes 1 to 2 working days and is free for orders over AED 200." },
      ],
    },
  },

  legal: {
    updated: "Last updated: October 2026",
    privacy: {
      meta: { title: "Privacy policy", description: "How {name} collects, uses and protects information from businesses that use the service and from the customers who chat with them." },
      title: "Privacy policy",
      intro: "This policy explains what information {name} handles, why, and the choices you have. It covers two groups: businesses that create an account, and visitors who use a chat widget on a business's website.",
      sections: [
        { h: "Information from businesses", p: ["When you create an account we collect your name, email address and a password (stored only in hashed form), or your Google account's name and email if you sign in with Google.", "You also give us information about your business: its name, industry, website, phone numbers, working hours, and the content you add to your knowledge base such as website pages, files, FAQs and notes."] },
        { h: "Information from chat visitors", p: ["When someone chats through a widget, we store the messages they send and the replies they receive, together with an anonymous visitor identifier kept in their browser for the length of the session.", "If the visitor chooses to share a name, phone number or email address, it is saved as a lead for the business they are talking to. The business is responsible for how it uses those details."] },
        { h: "How information is used", p: ["To provide the service: answering visitors' questions using the business's own knowledge base, showing conversations and leads to the business, and sending notification emails.", "To keep the service secure and within fair use, for example rate limiting and counting messages against a plan.", "We do not sell personal information, and one business's content is never used to answer another business's customers."] },
        { h: "Service providers", p: ["Messages and knowledge base content are sent to OpenAI to generate answers and to prepare content for search. Data is stored in a managed PostgreSQL database and the application runs on cloud hosting. Email notifications are delivered through an email provider. If a business turns on WhatsApp alerts for its team, the alert, which includes the visitor's name and their last message, is delivered through Meta's WhatsApp Business platform.", "These providers process information on our behalf and only to deliver the service."] },
        { h: "Cookies", p: ["The dashboard uses a small number of cookies that are necessary for it to work: one to keep you signed in, one to remember your workspace and one for your language. The chat widget stores its visitor identifier in the browser's session storage. We do not use advertising cookies."] },
        { h: "Retention and deletion", p: ["Conversations, leads and knowledge base content are kept for as long as the business's workspace exists. A business can delete knowledge sources at any time, and can ask us to delete its workspace and all associated data.", "Visitors who want their conversation or contact details removed should contact the business they chatted with, or us."] },
        { h: "Your rights", p: ["Depending on where you live, you may have the right to access, correct or delete your personal information, including under the UAE Personal Data Protection Law. Contact us and we will respond within a reasonable time."] },
        { h: "Changes and contact", p: ["We may update this policy as the service changes and will revise the date above when we do. Questions about privacy can be sent to the contact address at the bottom of this page."] },
      ],
    },
    terms: {
      meta: { title: "Terms of service", description: "The terms that apply when you use {name}, including acceptable use, plans and limits, and responsibility for AI-generated answers." },
      title: "Terms of service",
      intro: "These terms apply to your use of {name}. By creating an account you agree to them.",
      sections: [
        { h: "The service", p: ["{name} lets a business create an AI assistant from its own information and place a chat widget on its website. The assistant answers visitors, records conversations and leads, and lets the business's team take over a conversation."] },
        { h: "Your account", p: ["You are responsible for the accuracy of the details you provide, for keeping your password confidential, and for what the people you invite to your workspace do there."] },
        { h: "Your content", p: ["You keep ownership of the content you add. You confirm you have the right to use it and give us permission to process it in order to run the service, including sending it to our AI provider to generate answers.", "You are responsible for making sure your knowledge base is accurate and kept up to date."] },
        { h: "AI-generated answers", p: ["Answers are generated automatically from your content. We work to keep them accurate and limited to that content, but automated answers can be wrong or incomplete. You should review how your assistant responds, and you remain responsible for the information given to your customers. The service is not a substitute for professional medical, legal or financial advice."] },
        { h: "Acceptable use", p: ["You must not use the service for unlawful, misleading or harmful purposes, to send spam, to collect personal information without a lawful basis, to attempt to access another workspace's data, or to disrupt the service."] },
        { h: "Your customers' data", p: ["You are responsible for telling your website visitors how you use their information and for complying with the laws that apply to your business, including the UAE Personal Data Protection Law where relevant."] },
        { h: "Plans and limits", p: ["Each plan includes a monthly number of AI messages, a number of knowledge pages and a number of team members. When a monthly message limit is reached the assistant stops generating answers until the next month or until the plan is changed. Plan details are shown on the pricing page and may change with notice."] },
        { h: "Availability and liability", p: ["We aim to keep the service available but do not guarantee uninterrupted operation. To the extent permitted by law, the service is provided as is, and we are not liable for indirect or consequential losses arising from its use."] },
        { h: "Ending the agreement", p: ["You can stop using the service at any time and ask for your workspace to be deleted. We may suspend or close accounts that break these terms."] },
        { h: "Changes", p: ["We may update these terms and will revise the date above when we do. Continuing to use the service after a change means you accept the updated terms."] },
      ],
    },
  },

  footer: {
    tagline: "AI customer support for businesses in the UAE, in your customers' language.",
    product: "Product",
    industries: "Industries",
    company: "Company",
    privacy: "Privacy policy",
    terms: "Terms of service",
    contact: "Contact",
    rights: "All rights reserved.",
    madeIn: "Made for the UAE",
  },
  breadcrumbHome: "Home",
};
