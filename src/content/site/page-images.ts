/**
 * The picture of each industry, integration, use-case and blog page.
 *
 * `scene` describes what the picture shows; it is the prompt scripts/generate-page-images.ts
 * sends to OpenAI's image model (together with the shared style), so write it from the page's
 * own subject, as a real-life scene a photographer could shoot. `alt` is the text for screen readers and search engines, in both languages.
 * The files are public/images/pages/<page path with dashes>-{480,960,1440}.webp and -og.jpg.
 */
export type PageImageEntry = { scene: string; alt: { en: string; ar: string } };

export const PAGE_IMAGES: Record<string, PageImageEntry> = {
  // ---------------------------------------------------------------- industries
  "/industries/clinics": {
    scene: "A calm, modern dental clinic reception: a patient sitting in the waiting area holds a smartphone showing a chat conversation, while a dental chair and a receptionist's desk are visible behind.",
    alt: { en: "A patient in a dental clinic waiting room chatting with the clinic's assistant on her phone", ar: "مريضة في غرفة انتظار عيادة أسنان تتحدث مع مساعد العيادة على هاتفها" },
  },
  "/industries/real-estate": {
    scene: "A young couple on a sofa at home in the evening browsing apartment listings on a laptop; a chat window is open in the corner of the property website, and a city skyline with modern towers is visible through the window.",
    alt: { en: "A couple browsing apartments online in the evening and chatting with the agency's assistant", ar: "زوجان يتصفحان الشقق مساءً ويتحدثان مع مساعد الوكالة العقارية" },
  },
  "/industries/salons": {
    scene: "A bright beauty salon: a stylist works on a client's hair while, on the counter, a tablet shows a chat conversation answering a booking question; mirrors, hair products and plants around.",
    alt: { en: "A busy hair salon where booking questions are answered in the website chat", ar: "صالون تجميل مزدحم تُجاب فيه أسئلة الحجز عبر محادثة الموقع" },
  },
  "/industries/restaurants": {
    scene: "A cosy restaurant during dinner service: waiters serving tables in the background, and in the foreground a guest's phone on the table shows a chat about a table reservation.",
    alt: { en: "A restaurant during service, with a guest's phone showing a chat about a reservation", ar: "مطعم وقت الخدمة وهاتف ضيف يعرض محادثة عن حجز طاولة" },
  },
  "/industries/car-rental": {
    scene: "A car rental counter with keys on hooks and a row of shiny rental cars outside the glass front; a traveller with a suitcase checks a chat conversation on his phone.",
    alt: { en: "A traveller at a car rental office checking rental details in a chat on his phone", ar: "مسافر في مكتب تأجير سيارات يتحقق من تفاصيل الإيجار في محادثة على هاتفه" },
  },
  "/industries/coach-hire": {
    scene: "A large modern passenger coach parked outside a hotel, with a group of travellers waiting; one organiser holds a phone showing a chat conversation about a group booking.",
    alt: { en: "A group organiser arranging coach hire through the company's website chat", ar: "منظم رحلة جماعية يرتب استئجار حافلة عبر محادثة موقع الشركة" },
  },
  "/industries/retail": {
    scene: "An online shopper at a kitchen table with a laptop showing an e-commerce product page with a chat window open, shopping bags and a delivered parcel beside her.",
    alt: { en: "An online shopper asking about delivery in the store's chat before buying", ar: "متسوقة إلكترونية تسأل عن التوصيل في محادثة المتجر قبل الشراء" },
  },
  "/industries/gyms": {
    scene: "A bright modern gym reception: a member at the front desk looks at her smartphone, which shows a chat conversation, while dumbbells, a treadmill and a class schedule board sit in the background.",
    alt: { en: "A gym member at reception reading the gym's answers about classes on her phone", ar: "عضوة في صالة رياضية عند الاستقبال تقرأ إجابات الصالة عن الحصص على هاتفها" },
  },
  "/industries/hotels": {
    scene: "An elegant hotel lobby with a reception desk and luggage trolley; a guest who has just arrived reads a chat conversation on her phone, palm plants and warm lighting around.",
    alt: { en: "A hotel guest in the lobby reading answers about check-in in a chat on her phone", ar: "ضيفة فندق في الردهة تقرأ إجابات عن تسجيل الوصول في محادثة على هاتفها" },
  },
  "/industries/travel-agencies": {
    scene: "A travel agency desk with a globe, passports, plane tickets and a laptop showing a holiday package page with a chat window open; a beach and mountains poster without text on the wall.",
    alt: { en: "A travel agency desk with a laptop showing a holiday package and an open chat", ar: "مكتب وكالة سفر عليه حاسوب يعرض باقة عطلة ونافذة محادثة مفتوحة" },
  },
  "/industries/training-centres": {
    scene: "A small classroom at a training centre with a few adult students and a whiteboard; in the foreground a student uses a laptop with a chat conversation about course schedules.",
    alt: { en: "A student at a training centre asking about course times in the website chat", ar: "طالب في مركز تدريب يسأل عن مواعيد الدورات في محادثة الموقع" },
  },
  "/industries/schools": {
    scene: "A parent at home in the evening with a young child beside her, looking at a school website on a tablet with a chat window open; school bag and colouring pencils on the table.",
    alt: { en: "A parent researching a school in the evening and chatting with its admissions assistant", ar: "أم تبحث عن مدرسة مساءً وتتحدث مع مساعد القبول فيها" },
  },
  "/industries/law-firms": {
    scene: "A refined law office with bookshelves, a desk with documents and a set of scales; a laptop on the desk shows a website with a chat window where a visitor requests a consultation.",
    alt: { en: "A law office where a laptop shows a consultation request in the website chat", ar: "مكتب محاماة يعرض فيه حاسوب طلب استشارة في محادثة الموقع" },
  },
  "/industries/accounting-firms": {
    scene: "An accountant's tidy desk with a calculator, receipts, folders and a laptop showing a chat conversation with a new client enquiry; a calendar with marked deadlines without text.",
    alt: { en: "An accountant's desk with a new client enquiry arriving in the website chat", ar: "مكتب محاسب يصل إليه استفسار عميل جديد عبر محادثة الموقع" },
  },
  "/industries/car-service": {
    scene: "A clean car service workshop with a car on a lift and a mechanic working underneath; at the front desk a phone on a stand shows a chat conversation booking a service.",
    alt: { en: "A car workshop where service bookings arrive through the website chat", ar: "ورشة سيارات تصل إليها حجوزات الصيانة عبر محادثة الموقع" },
  },
  "/industries/home-services": {
    scene: "A technician servicing a wall-mounted air conditioner in a bright apartment, with a toolbox; the homeowner nearby holds a phone showing a chat conversation with the service company.",
    alt: { en: "An air-conditioning technician at work while the customer chats with the company on her phone", ar: "فني تكييف يعمل بينما تتحدث العميلة مع الشركة على هاتفها" },
  },
  "/industries/event-venues": {
    scene: "An elegant event hall prepared for a wedding dinner with round tables, flowers and soft lights; an event planner holds a tablet showing a chat conversation about guest numbers.",
    alt: { en: "An event hall set for a wedding, with a planner reading an enquiry in the chat", ar: "قاعة مجهزة لحفل زفاف ومنظمة تقرأ استفساراً في المحادثة" },
  },

  // ---------------------------------------------------------------- integrations
  "/integrations/wordpress": {
    scene: "A small business owner at a desk with a laptop showing a blog-style website editor; a single line of code is being pasted and a round chat button appears in the corner of the site preview.",
    alt: { en: "A business owner adding the chat widget to a WordPress website", ar: "صاحب عمل يضيف نافذة المحادثة إلى موقع ووردبريس" },
  },
  "/integrations/shopify": {
    scene: "A laptop showing an online store's product grid with a chat window open in the corner, surrounded by shipping boxes, a card reader and a coffee cup on a shop counter.",
    alt: { en: "An online store with the chat widget answering shoppers", ar: "متجر إلكتروني تجيب فيه نافذة المحادثة المتسوقين" },
  },
  "/integrations/wix": {
    scene: "A creative entrepreneur dragging blocks in a drag-and-drop website builder on a large monitor; a chat bubble button sits in the corner of the website being designed.",
    alt: { en: "A drag-and-drop website builder with the chat widget added to the page", ar: "أداة بناء مواقع بالسحب والإفلات مع نافذة المحادثة مضافة إلى الصفحة" },
  },
  "/integrations/webflow": {
    scene: "A web designer at a dual-monitor setup with a visual design tool showing layout panels and a polished landing page, with a chat window open in the page preview.",
    alt: { en: "A web designer adding the chat widget to a site in a visual design tool", ar: "مصمم مواقع يضيف نافذة المحادثة إلى موقع في أداة تصميم مرئية" },
  },
  "/integrations/squarespace": {
    scene: "A photographer's portfolio website with elegant image tiles on a laptop, and a chat window open in the corner; a camera and prints lie on the desk.",
    alt: { en: "A portfolio website with a chat window for client questions", ar: "موقع معرض أعمال مع نافذة محادثة لأسئلة العملاء" },
  },
  "/integrations/woocommerce": {
    scene: "A shop owner packing orders in a small stockroom with shelves of products; a laptop on the packing table shows the store website with a chat window answering a delivery question.",
    alt: { en: "A small online shop owner packing orders while the store's chat answers delivery questions", ar: "صاحب متجر إلكتروني صغير يجهز الطلبات بينما تجيب محادثة المتجر عن أسئلة التوصيل" },
  },
  "/integrations/joomla": {
    scene: "An office of an organisation with filing cabinets; a staff member's monitor shows a large content website with many sections and a chat window helping a visitor find information.",
    alt: { en: "A content-rich organisation website with a chat window helping visitors", ar: "موقع مؤسسة غني بالمحتوى مع نافذة محادثة تساعد الزوار" },
  },
  "/integrations/drupal": {
    scene: "A university-style website with many navigation sections displayed on a large screen in a modern campus office; a chat window in the corner answers a student's question.",
    alt: { en: "A large university-style website with an assistant answering visitors in the chat", ar: "موقع كبير بأسلوب جامعي مع مساعد يجيب الزوار في المحادثة" },
  },
  "/integrations/framer": {
    scene: "A startup founder in a bright studio with a laptop showing a sleek modern landing page with smooth gradients; a small chat window is open in the corner of the page.",
    alt: { en: "A sleek startup landing page with the chat widget in the corner", ar: "صفحة هبوط أنيقة لشركة ناشئة مع نافذة المحادثة في الزاوية" },
  },
  "/integrations/bigcommerce": {
    scene: "A larger online retail operation: a laptop showing a product catalogue page with a chat window, next to a stack of branded-colour boxes without text and a barcode scanner.",
    alt: { en: "An online retailer's store with the chat answering product questions", ar: "متجر تجزئة إلكتروني تجيب فيه المحادثة عن أسئلة المنتجات" },
  },
  "/integrations/ghost": {
    scene: "A writer at a wooden desk with a laptop showing a minimalist publication website with article cards, a newsletter mug and a notebook; a chat window is open on the page.",
    alt: { en: "A writer's publication website with a chat window for readers' questions", ar: "موقع منشور لكاتب مع نافذة محادثة لأسئلة القراء" },
  },
  "/integrations/hubspot": {
    scene: "A marketing team desk with a laptop showing a business website and a contact section, plus a chat window collecting a visitor's details; sticky notes and charts without text on a board.",
    alt: { en: "A marketing website where the chat collects enquiries before the contact form", ar: "موقع تسويقي تجمع فيه المحادثة الاستفسارات قبل نموذج التواصل" },
  },
  "/integrations/weebly": {
    scene: "A friendly older shop owner in a small family business, sitting at a counter with a simple laptop showing a basic website with a chat window; a flower pot and a cash register nearby.",
    alt: { en: "A small family business owner with a simple website and the chat widget", ar: "صاحب عمل عائلي صغير مع موقع بسيط ونافذة المحادثة" },
  },
  "/integrations/google-tag-manager": {
    scene: "A marketer at a laptop showing an abstract tag management dashboard with connected blocks and toggles, and a second screen showing a website with a chat button appearing.",
    alt: { en: "A marketer publishing the chat widget through a tag manager", ar: "مسوّق ينشر نافذة المحادثة عبر أداة إدارة الوسوم" },
  },
  "/integrations/html": {
    scene: "A developer's desk with a code editor showing abstract coloured lines of code on one monitor and the finished website with a chat window on the other; a mechanical keyboard and a plant.",
    alt: { en: "A developer adding one script tag that shows the chat widget on a custom website", ar: "مطوّر يضيف وسم سكربت واحداً يُظهر نافذة المحادثة في موقع مخصص" },
  },

  // ---------------------------------------------------------------- use cases
  "/use-cases/lead-generation": {
    scene: "A website chat window on a laptop handing over a new contact card into a neat list of contacts, with a small notification badge; a salesperson with a phone ready to call beside it.",
    alt: { en: "A chat conversation turning a website visitor into a saved lead", ar: "محادثة تحوّل زائر الموقع إلى عميل محتمل محفوظ" },
  },
  "/use-cases/customer-support": {
    scene: "A small support team in a modern office: one team member relaxes with a cup of tea while her laptop screen shows customer chats being answered, and a colleague in the background is on a phone call.",
    alt: { en: "Many customer questions answered automatically while the team handles the rest", ar: "أسئلة عملاء كثيرة تُجاب تلقائياً بينما يتولى الفريق البقية" },
  },
  "/use-cases/multilingual-support": {
    scene: "Three customers of different nationalities sitting at a cafe table in Dubai, each looking at their own phone with a chat app open, relaxed and smiling.",
    alt: { en: "Customers writing in different languages and getting answers from one assistant", ar: "عملاء يكتبون بلغات مختلفة ويحصلون على إجابات من مساعد واحد" },
  },
  "/use-cases/after-hours-support": {
    scene: "A closed shop at night with the lights off and a crescent moon outside, while a glowing laptop on the counter shows a chat conversation still answering a customer.",
    alt: { en: "A closed business at night whose website chat keeps answering customers", ar: "عمل مغلق ليلاً تواصل محادثة موقعه الإجابة عن العملاء" },
  },
  "/use-cases/appointment-requests": {
    scene: "A receptionist's desk with a paper diary and a tablet showing a chat conversation in which a customer requests an appointment; a wall clock and a potted plant.",
    alt: { en: "An appointment request arriving through the website chat at a reception desk", ar: "طلب موعد يصل عبر محادثة الموقع إلى مكتب الاستقبال" },
  },
  "/use-cases/faq-automation": {
    scene: "A business owner at her desk reviewing printed question-and-answer sheets next to a laptop whose screen shows a chat app answering a customer.",
    alt: { en: "Frequently asked questions turned into instant answers in the chat", ar: "أسئلة شائعة تتحول إلى إجابات فورية في المحادثة" },
  },
  "/use-cases/pre-sales-questions": {
    scene: "A customer at home holding two product boxes and comparing them, with a laptop in front of him showing a product page and an open chat window.",
    alt: { en: "A customer comparing options with help from the website chat before buying", ar: "عميل يقارن الخيارات بمساعدة محادثة الموقع قبل الشراء" },
  },
  "/use-cases/quote-requests": {
    scene: "A contractor reviewing a quote request on a tablet at a job site, with a chat conversation listing a customer's needs; blueprints, a hard hat and a measuring tape on the table.",
    alt: { en: "A contractor reading a detailed quote request that arrived through the chat", ar: "مقاول يقرأ طلب عرض سعر مفصلاً وصل عبر المحادثة" },
  },
  "/use-cases/arabic-chatbot": {
    scene: "A young Emirati professional in a modern cafe in the Gulf holding a phone with a right-to-left chat layout shown as abstract bubbles, with a coffee cup and arabesque patterns on the wall.",
    alt: { en: "A customer in the Gulf chatting in Arabic with a business's website assistant", ar: "عميل في الخليج يتحدث بالعربية مع مساعد موقع إحدى الشركات" },
  },
  "/use-cases/fewer-phone-calls": {
    scene: "A quiet office desk phone resting silently, while a laptop beside it shows a busy chat conversation answering customers; a relaxed employee working on something else.",
    alt: { en: "A quiet office phone while routine questions are answered in the website chat", ar: "هاتف مكتب هادئ بينما تُجاب الأسئلة المعتادة في محادثة الموقع" },
  },
  "/use-cases/small-business-support": {
    scene: "A small neighbourhood business with the owner behind the counter serving a customer, while a laptop on the side shows the website chat taking care of online questions.",
    alt: { en: "A small business owner serving customers while the website chat handles online questions", ar: "صاحب عمل صغير يخدم العملاء بينما تتولى محادثة الموقع الأسئلة عبر الإنترنت" },
  },
  "/use-cases/ecommerce-support": {
    scene: "A delivery parcel arriving at a customer's door, and the customer holding a phone with a chat conversation about returns; product boxes and a delivery van in the background.",
    alt: { en: "An online shopper asking about returns in the store's chat as a parcel arrives", ar: "متسوقة تسأل عن الإرجاع في محادثة المتجر لحظة وصول طردها" },
  },
  "/use-cases/human-handover": {
    scene: "A friendly customer support agent wearing a headset at her desk, reading and replying to a customer's chat on her monitor, in a bright modern office.",
    alt: { en: "The AI assistant handing a conversation over to a human team member", ar: "المساعد الذكي يحوّل محادثة إلى أحد أعضاء الفريق" },
  },
  "/use-cases/customer-insights": {
    scene: "A business owner at a cafe table studying a laptop dashboard with simple bar charts, taking notes in a notebook with a pen.",
    alt: { en: "A dashboard showing the questions customers ask most in the chat", ar: "لوحة تعرض الأسئلة التي يطرحها العملاء أكثر في المحادثة" },
  },

  // ---------------------------------------------------------------- blog
  "/blog/add-ai-chatbot-to-website": {
    scene: "A business owner pasting one line of code into website settings on a laptop, and a chat button popping up on the live website shown on a phone next to it.",
    alt: { en: "Adding an AI chatbot to a website with one line of code", ar: "إضافة مساعد ذكي إلى موقع بسطر واحد من الكود" },
  },
  "/blog/train-chatbot-on-your-content": {
    scene: "A business owner uploading a price list from her laptop, with printed brochures, a menu and handwritten notes spread on the desk beside her.",
    alt: { en: "Business documents and web pages feeding the assistant's knowledge", ar: "مستندات العمل وصفحات الموقع تغذي معرفة المساعد" },
  },
  "/blog/ai-chatbot-vs-live-chat": {
    scene: "A busy support agent with a headset handling several chat windows across two monitors in a contact centre, colleagues working behind him.",
    alt: { en: "Live chat agents compared with an AI assistant that answers instantly", ar: "مقارنة بين موظفي المحادثة المباشرة ومساعد ذكي يجيب فوراً" },
  },
  "/blog/chatbot-lead-capture": {
    scene: "A chat window on a website where a visitor's name and phone number appear as a contact card that slides into a sales pipeline board with simple columns.",
    alt: { en: "A chat conversation capturing a visitor's contact details as a lead", ar: "محادثة تلتقط بيانات تواصل زائر كعميل محتمل" },
  },
  "/blog/ai-chatbot-cost": {
    scene: "A small business owner at a desk with a calculator, a notebook and a laptop showing simple pricing tiers as blank cards, weighing the cost of an AI assistant; coins in a jar.",
    alt: { en: "A business owner estimating the monthly cost of an AI chatbot", ar: "صاحب عمل يقدّر التكلفة الشهرية لمساعد ذكي" },
  },
  "/blog/write-faqs-for-chatbot": {
    scene: "A person writing neat question-and-answer cards at a table, pinning them to a board, with a laptop showing a chat window using those answers.",
    alt: { en: "Writing clear question-and-answer pairs for an AI assistant", ar: "كتابة أسئلة وأجوبة واضحة لمساعد ذكي" },
  },
  "/blog/chatbot-greeting-messages": {
    scene: "Close-up of a phone held in a cafe, showing a website whose chat window has just opened with a short welcome message bubble.",
    alt: { en: "A chat window greeting a website visitor with a friendly opening message", ar: "نافذة محادثة ترحب بزائر الموقع برسالة افتتاحية ودودة" },
  },
  "/blog/stop-chatbot-making-things-up": {
    scene: "A business owner checking the answers in a website chat on her laptop against a printed price list she holds, at a tidy office desk.",
    alt: { en: "An assistant answering only from the business's own documents", ar: "مساعد يجيب فقط من مستندات العمل الخاصة" },
  },
  "/blog/when-to-hand-over-to-a-human": {
    scene: "An unhappy customer on a phone chat being calmly connected to a friendly human agent with a headset, while the assistant steps aside.",
    alt: { en: "A customer with a complaint being handed from the assistant to a person", ar: "عميل لديه شكوى يُحوَّل من المساعد إلى شخص" },
  },
  "/blog/chatbot-vs-contact-form": {
    scene: "A long paper contact form with many empty fields on one side, and on the other a friendly chat window with quick answers, a visitor choosing the chat.",
    alt: { en: "A long contact form compared with a quick website chat", ar: "مقارنة بين نموذج تواصل طويل ومحادثة موقع سريعة" },
  },
  "/blog/after-hours-customer-service": {
    scene: "A city street at night with shops closed, and inside one window a laptop glowing with a chat conversation answering a customer who is browsing from her sofa at home.",
    alt: { en: "A customer getting answers late at night while the business is closed", ar: "عميلة تحصل على إجابات في وقت متأخر من الليل والعمل مغلق" },
  },
  "/blog/multilingual-customer-support": {
    scene: "A small team of three colleagues of different nationalities at one desk replying to customers on a laptop, with a large plain world map on the wall behind them.",
    alt: { en: "A small team serving customers in many languages", ar: "فريق صغير يخدم عملاء بلغات كثيرة" },
  },
  "/blog/serving-arabic-speaking-customers": {
    scene: "A phone showing a right-to-left chat layout with abstract Arabic-style bubbles, held by a customer in a Gulf city setting with a modern mosque silhouette and palm trees in the distance.",
    alt: { en: "A customer in the Gulf chatting with a business in Arabic", ar: "عميل في الخليج يتحدث مع شركة بالعربية" },
  },
  "/blog/measure-chatbot-success": {
    scene: "A business owner reviewing a simple weekly dashboard on a laptop with five clean charts and an upward trend line, a coffee cup and a notebook with ticks.",
    alt: { en: "Reviewing a weekly dashboard of chatbot results", ar: "مراجعة لوحة أسبوعية لنتائج المساعد الذكي" },
  },
  "/blog/chatbot-data-privacy": {
    scene: "A business owner reading a printed checklist on a clipboard at her desk, with a laptop showing a chat app and a closed metal padlock lying beside the keyboard.",
    alt: { en: "Protecting business and customer data in a website chat", ar: "حماية بيانات العمل والعملاء في محادثة الموقع" },
  },
  "/blog/reduce-customer-response-time": {
    scene: "A stopwatch next to a phone showing a chat reply arriving instantly, with a happy customer, and a shared inbox on a laptop showing tidy conversations.",
    alt: { en: "Replying to customers in seconds with an instant chat answer", ar: "الرد على العملاء خلال ثوانٍ بإجابة فورية في المحادثة" },
  },
  "/blog/website-chatbot-best-practices": {
    scene: "A web designer reviewing a client's website on a laptop and a phone side by side, a chat window in the corner of both, and a notebook checklist with ticks.",
    alt: { en: "A well-designed website chat following best practices", ar: "محادثة موقع مصممة جيداً تتبع أفضل الممارسات" },
  },
  "/blog/qualify-leads-with-chatbot": {
    scene: "A salesperson sorting contact cards that come from chat conversations into piles marked with simple coloured flags, prioritising the most promising ones.",
    alt: { en: "Sorting chat leads by how ready they are to buy", ar: "ترتيب العملاء المحتملين من المحادثات حسب جاهزيتهم للشراء" },
  },
  "/blog/is-a-chatbot-worth-it-for-small-business": {
    scene: "A small shop owner at his counter thinking it over, looking at a laptop with a chat app open, a calculator and a cup of coffee beside it.",
    alt: { en: "A small business owner weighing the time and cost of a chatbot against its benefits", ar: "صاحب عمل صغير يوازن وقت المساعد الذكي وتكلفته مقابل فوائده" },
  },
  "/blog/prepare-content-for-ai-chatbot": {
    scene: "A desk with neatly organised documents, printed web pages, a price list, a binder and handwritten notes, next to a laptop uploading files.",
    alt: { en: "Gathering website pages, price lists and notes for an AI assistant", ar: "جمع صفحات الموقع وقوائم الأسعار والملاحظات لمساعد ذكي" },
  },
  "/blog/customer-service-in-the-uae": {
    scene: "A diverse group of customers in a modern UAE mall setting with a Dubai-style skyline outside, each on their phone chatting with businesses; palm trees and evening lights.",
    alt: { en: "Customers in the UAE contacting businesses on their phones in the evening", ar: "عملاء في الإمارات يتواصلون مع الشركات على هواتفهم مساءً" },
  },
  "/blog/chatbot-mistakes-to-avoid": {
    scene: "A frustrated customer frowning at his phone in a cafe, the screen covered by a large pop-up window, his coffee going cold.",
    alt: { en: "A frustrating chatbot compared with a helpful one", ar: "مقارنة بين مساعد محادثة مزعج وآخر مفيد" },
  },
  "/blog/chat-on-mobile": {
    scene: "A person walking in a city holding a phone with one hand, using a compact chat sheet that covers only the lower part of a website, typing with a thumb.",
    alt: { en: "A visitor using a compact website chat on a phone while on the move", ar: "زائر يستخدم محادثة موقع مدمجة على الهاتف أثناء تنقله" },
  },
  "/blog/what-is-ai-customer-support": {
    scene: "A shop owner behind her counter glancing at a laptop where a chat app is answering a customer, while a customer in the shop smiles at his phone.",
    alt: { en: "An AI assistant connecting a business's information with its customers", ar: "مساعد ذكي يربط معلومات العمل بعملائه" },
  },
};
