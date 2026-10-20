import type { TopicPage } from "../types";
import type { NewGuide } from "./slugs";

/**
 * Blog articles. Practical advice for business owners; where an article mentions {name},
 * it describes only what the product does today.
 */
export const guidesMoreEn: Record<NewGuide, TopicPage> = {
  "ai-chatbot-cost": {
    name: "How much does an AI chatbot cost?",
    short: "What you actually pay for, and how to estimate it for your business.",
    meta: {
      title: "How much does an AI chatbot cost for a small business?",
      description: "What drives the cost of an AI chatbot for a business website: message volume, knowledge size, team seats and setup time, with a worked example.",
    },
    h1: "How much does an AI chatbot cost?",
    sub: "Less than most owners expect, as long as you know which numbers to look at.",
    intro: [
      "Ask five vendors what an AI chatbot costs and you will get five answers in five different units: per conversation, per resolution, per seat, per month. Underneath, the cost is driven by the same few things. Once you know them, comparing offers becomes simple.",
    ],
    sections: [
      { h: "What you are really paying for", p: ["An AI assistant costs money every time it writes a reply, because a language model runs for each answer. That is why almost every product prices by volume: messages, conversations or replies per month.", "The other costs are how much information it can hold (often counted in pages or documents) and how many people on your team can use the inbox."] },
      { h: "Estimate your message volume first", p: ["Look at how many enquiries you get today through your website, email and phone. A typical customer conversation is three to six replies from the assistant.", "If you get 100 website enquiries a month and each conversation has four replies, you need roughly 400 AI replies a month. Add some headroom for growth and for visitors who would not have contacted you at all without a chat button."] },
      { h: "Then count your knowledge", p: ["Count the pages on your website that matter to customers, plus the documents you would add: a price list, a menu, a policy. Most small businesses need between 10 and 100 pages.", "You do not need to add your whole site. Blog posts from years ago rarely help; your services, prices and policies always do."] },
      { h: "A worked example with {name}", p: ["{name} has a free plan with 30 AI messages and 10 knowledge pages a month, which is enough to test it on your own site. Paid plans start at €19 a month for 500 messages and 50 pages, then €49 for 2,000 messages, 200 pages and 3 team members, and €149 for 10,000 messages, 1,000 pages and 10 team members.", "The business with 400 replies a month from the example above would fit the Starter plan. Only the assistant's replies count: messages your team sends and test chats in your dashboard are free."] },
      { h: "The costs that are not on the price list", p: ["Setup time: with a modern assistant this is an afternoon of gathering information, not weeks of scripting. Ongoing time: a few minutes a week reviewing unanswered questions.", "The cost of not having one is real too. An enquiry that waits until tomorrow often goes to the business that replied tonight."] },
    ],
    faq: [
      { q: "Is there a free AI chatbot for small businesses?", a: "Many products, {name} included, have a free plan. Check its message limit: it decides whether the free plan is a trial or something you can actually run on." },
      { q: "What happens if I go over my message limit?", a: "With {name}, the widget stays on your site and shows your contact details instead of AI answers until the month resets, and customers can leave their name and number." },
      { q: "Are prices per conversation better than per message?", a: "Neither is better in itself. Convert both to your expected monthly volume and compare the totals." },
    ],
  },

  "write-faqs-for-chatbot": {
    name: "How to write FAQs your chatbot can use",
    short: "Short, factual answers make an AI assistant accurate. Here is how to write them.",
    meta: {
      title: "How to write FAQs for an AI chatbot (with examples)",
      description: "How to write question-and-answer pairs that make an AI chatbot accurate: one fact per answer, real customer wording, prices with conditions, and what to leave out.",
    },
    h1: "How to write FAQs your chatbot can use",
    sub: "An AI assistant is only as good as the information you give it. Good FAQs are the fastest way to make it excellent.",
    intro: [
      "Your website was written to persuade. An assistant needs something slightly different: plain facts it can quote without guessing. A short list of well-written questions and answers fills that gap, and it takes less than an hour.",
    ],
    sections: [
      { h: "Start from real questions", p: ["Do not invent questions. Look at your inbox, your WhatsApp chats and what your receptionist hears every day. Write the ten questions you answer most often, in the words customers use.", "\"How much is a cleaning?\" is a better question than \"Pricing information for dental hygiene services\"."] },
      { h: "One fact per answer, stated plainly", p: ["Answer in one to three sentences. Put the fact first: \"A cleaning costs AED 300 and takes 45 minutes.\" Then add the condition that matters: \"Insurance patients pay their co-payment only.\"", "Avoid answers that say \"it depends\" without saying on what. If it depends, write the cases down."] },
      { h: "Include prices, conditions and exceptions", p: ["Customers ask about money, time and rules. Give prices with what they include, opening hours with holiday exceptions, and policies with their time limits.", "If something is not offered, say so: \"We do not deliver outside Dubai.\" A clear no is better than an assistant that cannot answer."] },
      { h: "Leave out what should not be answered automatically", p: ["Some questions need a person: medical advice, legal opinions, complaints, refunds for a specific order. Do not write answers for those. When an assistant like {name} has no answer, it tells the customer and offers to connect them with your team.", "Also leave out anything you would not tell any visitor, such as internal prices or staff details."] },
      { h: "Keep them up to date", p: ["Review your FAQs whenever prices or policies change. In {name}, the dashboard lists questions the assistant could not answer, each with a button to add the answer; that list is your best source of new FAQs."] },
    ],
    faq: [
      { q: "How many FAQs do I need?", a: "Start with ten to twenty covering your most common questions. Add more as the unanswered-questions list shows you what is missing." },
      { q: "Should I write FAQs in several languages?", a: "Not for {name}. Write them in one language and the assistant answers customers in theirs." },
      { q: "Can I just upload my existing FAQ page?", a: "Yes. If it is on your website, the assistant reads it when you add your site. Rewrite only the answers that are vague." },
    ],
  },

  "chatbot-greeting-messages": {
    name: "Chatbot greeting messages that get replies",
    short: "Examples of opening messages for clinics, shops, restaurants and services.",
    meta: {
      title: "Chatbot greeting message examples for business websites",
      description: "Chatbot greeting message examples that invite customers to ask: short, specific and in the right tone, with examples for clinics, stores, restaurants and services.",
    },
    h1: "Chatbot greeting messages that get replies",
    sub: "The first line in the chat window decides whether a visitor types anything at all. Here is how to write it.",
    intro: [
      "Most chat greetings say \"Hi! How can I help you today?\". It is polite, and it is easy to ignore. A greeting that names what the assistant can actually help with gets more people to ask their first question.",
    ],
    sections: [
      { h: "Keep it short and specific", p: ["One or two lines. Mention two or three things people often ask about, so visitors know what to expect.", "\"Hi! Ask me about prices, opening hours or booking an appointment.\" tells the visitor exactly what they can do."] },
      { h: "Match the tone of your business", p: ["A law firm and a beach café should not sound the same. Formal businesses can greet with \"Welcome. How may we help you?\" while casual brands can be warmer.", "In {name} you choose a formal or friendly tone for the assistant's replies as well, so the greeting and the conversation feel consistent."] },
      { h: "Examples by industry", p: ["Clinic: \"Hello! I can help with prices, insurance and appointment requests.\" Online shop: \"Hi! Questions about delivery, returns or sizes? Ask away.\" Restaurant: \"Welcome! Ask about our menu, opening hours or a table for tonight.\"", "Home services: \"Hi! Tell me what needs fixing and I will explain our prices and availability.\" Real estate: \"Hello! Ask about a property, a payment plan or booking a viewing.\""] },
      { h: "Greet in two languages if your customers do", p: ["If many customers write in Arabic and English, put both in the greeting. It signals immediately that either language is welcome.", "The assistant itself answers in whatever language the customer writes in, so the greeting is about making people comfortable, not limiting them."] },
      { h: "Test it, then change it", p: ["Watch how many chats start after you change the greeting. A greeting is the easiest thing in your chat to improve: it is one line, and you can change it in seconds."] },
    ],
    faq: [
      { q: "Should the greeting pop up automatically?", a: "A greeting that appears inside the chat window is enough for most sites. Aggressive pop-ups annoy visitors, especially on phones." },
      { q: "Should I say it is an AI?", a: "Being upfront builds trust. Naming the assistant and keeping a \"talk to a human\" option visible works well." },
      { q: "How long can a greeting be?", a: "Keep it under about 20 words. Longer greetings are skipped." },
    ],
  },

  "stop-chatbot-making-things-up": {
    name: "How to stop a chatbot making things up",
    short: "Why AI assistants invent answers, and how grounded answers prevent it.",
    meta: {
      title: "How to stop an AI chatbot making things up (hallucinations)",
      description: "Why AI chatbots sometimes invent prices and policies, and how to prevent it: answering only from your own information, clear sources and a human fallback.",
    },
    h1: "How to stop a chatbot making things up",
    sub: "An assistant that invents a price or a policy does more harm than no assistant at all. Here is how to make sure yours does not.",
    intro: [
      "Language models are trained to produce fluent, plausible text. Ask a general chatbot about your business and it may produce a plausible price that you never charged. In AI this is called a hallucination. For a business it is simply a wrong answer given with confidence.",
    ],
    sections: [
      { h: "Ground every answer in your own information", p: ["The most reliable fix is to give the assistant your information and instruct it to answer only from that. This is called grounding, or retrieval: before replying, the system finds the relevant parts of your content and the model writes its answer from them.", "{name} works this way. It answers from your website pages, files, FAQs and notes, and nothing else."] },
      { h: "Make \"I don't know\" an acceptable answer", p: ["An assistant should be allowed, and expected, to say it does not have the information. The right follow-up is to offer a person, not to guess.", "In {name}, when the answer is not in your information, the assistant tells the customer and offers to connect them with your team, and the chat is flagged in your inbox."] },
      { h: "Check the sources behind answers", p: ["Before going live, test the assistant with real questions and look at where each answer came from. {name}'s test chat shows a confidence level and the sources behind each reply.", "If an answer is wrong, the fix is usually in the source: an outdated page, two documents that disagree, or a missing fact."] },
      { h: "Keep your information consistent", p: ["If your price list says one thing and an old blog post says another, any assistant can be confused. Remove outdated content from what you give it, and re-sync your website after changes."] },
      { h: "Guard against tricks", p: ["Some visitors try to make chatbots say silly things or ignore their rules. A business assistant should resist instructions hidden in customer messages. {name} has protections against attempts to make it ignore its rules."] },
    ],
    faq: [
      { q: "Can any AI chatbot be 100% accurate?", a: "No system is perfect, but grounded answers, a clear \"I don't know\" and a human fallback make wrong answers rare and easy to catch." },
      { q: "Does training a chatbot on my data mean retraining a model?", a: "Usually not. Modern assistants look up your information when answering. Updating them means updating your content, not retraining anything." },
      { q: "What should I test before going live?", a: "Your ten most common questions, a few awkward ones, and at least one question it should not be able to answer." },
    ],
  },

  "when-to-hand-over-to-a-human": {
    name: "When should a chatbot hand over to a human?",
    short: "The conversations AI should not handle alone, and how a good handover works.",
    meta: {
      title: "When should a chatbot hand over to a human agent?",
      description: "Which customer conversations an AI chatbot should pass to a person, how to make the handover smooth, and how to avoid customers repeating themselves.",
    },
    h1: "When should a chatbot hand over to a human?",
    sub: "The best AI support knows its limits. Here are the moments to bring in a person, and how to do it without losing the customer.",
    intro: [
      "An AI assistant can answer most routine questions faster than any person. But some conversations need judgement, empathy or authority that an assistant should not pretend to have. Planning for those moments is what separates helpful automation from frustrating automation.",
    ],
    sections: [
      { h: "When the customer asks for a person", p: ["This is the simplest rule and the most important. If someone asks to speak to a human, let them. A visible \"Talk to a human\" button saves customers from arguing with a bot.", "In {name}, customers can press it at any time, and the chat is flagged for your team."] },
      { h: "When the answer is not in your information", p: ["If the assistant cannot answer from what you gave it, it should say so and offer a person rather than guess. These chats are also your best clue to what your information is missing."] },
      { h: "Complaints and emotional conversations", p: ["An unhappy customer wants to be heard by someone who can fix things. Hand complaints, cancellations and disputes to a person quickly."] },
      { h: "Anything sensitive or specific to one customer", p: ["Medical, legal and financial advice, payments, refunds for a particular order, changes to an account: these need a person who can see the details and take responsibility."] },
      { h: "Make the handover seamless", p: ["The worst handover makes the customer start again. The person taking over should see the whole conversation. In {name}, the team member opens the chat in the inbox, presses take over, and replies in the same window; the assistant stays quiet until the chat is handed back.", "If nobody is available, tell the customer when they will hear back and collect a way to reach them."] },
    ],
    faq: [
      { q: "Will customers be annoyed that they talked to a bot first?", a: "Not if the bot was useful and the handover is quick. Most frustration comes from bots that block access to people." },
      { q: "How quickly should a person reply after a handover?", a: "As quickly as you can during working hours. Outside them, say honestly when someone will reply." },
      { q: "How is my team told about a handover?", a: "In {name}, the chat is marked as needing a human in the inbox and an email is sent." },
    ],
  },

  "chatbot-vs-contact-form": {
    name: "Chatbot or contact form?",
    short: "Which one gets you more enquiries, and why many sites use both.",
    meta: {
      title: "Chatbot vs contact form: which gets more leads?",
      description: "Comparing a website chatbot and a contact form: speed, effort for the visitor, lead quality and follow-up, and when to keep both.",
    },
    h1: "Chatbot or contact form: which works better?",
    sub: "A contact form asks the visitor to do the work. A chat answers first. Here is what that difference means for your enquiries.",
    intro: [
      "The contact form has been the default way to get enquiries from a website for decades. It is simple and it works, up to a point. A chat assistant changes the order of things: the visitor gets an answer before they are asked for anything.",
    ],
    sections: [
      { h: "The visitor's effort", p: ["A form asks for a name, an email, a phone number and a message before the visitor learns anything. Many people with a simple question will not bother.", "A chat lets them type one line and get an answer. When they are interested, giving their details feels like the natural next step."] },
      { h: "Speed of the answer", p: ["Form submissions wait in an inbox until someone reads them. If the visitor was comparing several businesses, the first one to reply usually wins.", "An AI assistant replies in seconds, at any hour, and collects contact details for anything that needs a person."] },
      { h: "Quality of the lead", p: ["A form tells you what the visitor chose to write. A chat transcript shows what they asked, what they were told and what they want, which makes the follow-up call much easier.", "In {name}, each lead is saved with a link to the conversation."] },
      { h: "When the form is still right", p: ["Detailed applications, file uploads and job applications still suit a form. Some visitors simply prefer one.", "Most businesses keep their contact page and add a chat for the visitors who want a quick answer."] },
      { h: "Getting both right", p: ["Keep the form short, and make the chat button visible on every page, not only on the contact page. Measure both: how many enquiries each brings, and how many turn into customers."] },
    ],
    faq: [
      { q: "Will a chatbot replace my contact form?", a: "It can, but it does not have to. Many sites keep both." },
      { q: "Do chat leads include an email address?", a: "In {name}, the assistant asks for a name and phone number by default; visitors can share an email in the conversation too." },
      { q: "Can I make visitors fill in details before chatting?", a: "Yes. {name} has an optional pre-chat form for name and phone." },
    ],
  },

  "after-hours-customer-service": {
    name: "After-hours customer service",
    short: "How to answer customers when your business is closed.",
    meta: {
      title: "After-hours customer service for small businesses",
      description: "How small businesses can answer customers after hours without staff on call: what customers expect, what to automate, and how to follow up in the morning.",
    },
    h1: "After-hours customer service without a night shift",
    sub: "Customers browse and decide in the evening. Here is how to be there for them without working around the clock.",
    intro: [
      "For many businesses the busiest browsing hours are after work: in the evening, at weekends and on public holidays, exactly when nobody is there to reply. You do not need a night shift to fix that, but you do need a plan.",
    ],
    sections: [
      { h: "What customers expect after hours", p: ["Most people do not expect a full service at midnight. They expect an answer to a simple question, and confidence that their request has been received.", "Both are possible without staff: instant answers to routine questions, and a clear promise of when a person will follow up."] },
      { h: "Automate the routine questions", p: ["Prices, services, location, parking, what to bring, how to book: the answers do not change at night. An AI assistant like {name} gives them from your information at any hour, and it knows your opening hours."] },
      { h: "Capture everything else", p: ["When a request needs a person, the visitor should not have to come back tomorrow. The assistant takes their name and number, and the request is waiting for you in the morning with the full conversation."] },
      { h: "Follow up first thing", p: ["After-hours leads go cold quickly. Make the first task of the day calling or messaging the overnight requests. People are impressed when a business they contacted at 11 pm calls them at 9 am."] },
      { h: "Be honest about availability", p: ["Do not pretend a person is online when nobody is. Tell customers when the team will reply. Honesty keeps trust even when the answer is \"tomorrow morning\"."] },
    ],
    faq: [
      { q: "Is an AI assistant enough for after-hours support?", a: "For routine questions and capturing requests, yes. Anything urgent or sensitive should be flagged for your team, with your emergency contact details in the assistant's information if you have them." },
      { q: "How will I know what came in overnight?", a: "{name} emails you about each new lead and each chat that needs a person, and everything is in your inbox." },
      { q: "Does it know when we are closed?", a: "Yes, it uses the working hours you set in your account." },
    ],
  },

  "multilingual-customer-support": {
    name: "Multilingual customer support for small teams",
    short: "How to serve customers in several languages without hiring for each.",
    meta: {
      title: "Multilingual customer support for small businesses",
      description: "How small teams can support customers in several languages: which content to prepare, how AI assistants translate facts, and when a native speaker is needed.",
    },
    h1: "Multilingual customer support for small teams",
    sub: "Your customers speak many languages. Your team probably does not. Here is how to close that gap.",
    intro: [
      "In cities like Dubai, London or Toronto, a small business can serve customers in a dozen languages in a single week. Hiring for each is impossible, and translating every answer by hand is slow. AI assistants have made multilingual support practical for small teams for the first time.",
    ],
    sections: [
      { h: "Find out which languages matter", p: ["Look at the names in your customer list, the languages in your messages and the countries in your website analytics. Usually two or three languages cover most customers."] },
      { h: "Keep one source of truth", p: ["Maintaining a price list in five languages means five chances to get a price wrong. Keep one version of your facts, in the language you work in.", "An assistant like {name} answers each customer in their language while taking the facts from that single source."] },
      { h: "Let the customer choose the language", p: ["Do not force visitors to pick a language from a menu. Let them write the way they are comfortable, including mixed messages and dialects, and reply in kind.", "For right-to-left languages such as Arabic and Urdu, the chat layout should switch direction too."] },
      { h: "Know when a native speaker is needed", p: ["Routine answers translate well. Complaints, negotiations and sensitive matters are better handled by a person who speaks the language, or carefully in a shared one.", "Review a few conversations in your main languages from time to time to check the tone."] },
      { h: "Show customers they are welcome", p: ["A greeting in two languages, a note on your contact page, and staff names in the inbox make customers more comfortable writing in their own language."] },
    ],
    faq: [
      { q: "Which languages can an AI assistant handle?", a: "{name} replies in the language the customer writes in, including English, Arabic, Spanish, French, German, Hindi, Urdu, Russian and many others." },
      { q: "Do I need to translate my website first?", a: "No. The assistant answers in the customer's language from the information you have." },
      { q: "Can my team reply in another language?", a: "Your team replies however they like when they take over. The assistant handles its own replies in the customer's language." },
    ],
  },

  "serving-arabic-speaking-customers": {
    name: "Serving Arabic-speaking customers online",
    short: "Practical tips for Arabic customer service on your website.",
    meta: {
      title: "How to serve Arabic-speaking customers online",
      description: "Practical tips for Arabic customer service on a business website: right-to-left layout, dialects, bilingual greetings, tone and response times.",
    },
    h1: "How to serve Arabic-speaking customers online",
    sub: "Arabic-speaking customers notice immediately whether a website was made for them. Here is what makes the difference.",
    intro: [
      "Arabic is spoken by hundreds of millions of people, and in the Gulf many customers move between Arabic and English several times a day. A business that answers comfortably in both earns trust that a translated afterthought never does.",
    ],
    sections: [
      { h: "Get right-to-left right", p: ["Arabic text reads right to left, and so should the layout around it: chat bubbles, buttons, lists and icons. Broken direction, where punctuation jumps to the wrong end or numbers flip, looks careless.", "Test any chat or form on your site with a real Arabic sentence that includes a number and an English word."] },
      { h: "Expect dialects and mixed messages", p: ["Customers rarely write formal Arabic in a chat. They use Gulf, Egyptian or Levantine dialect, switch to English for a product name, or type Arabic with Latin letters.", "Whoever, or whatever, answers needs to understand all of these. {name} reads dialects and mixed messages and replies in clear Arabic."] },
      { h: "Greet in both languages", p: ["A greeting such as \"مرحباً! Hello!\" tells customers immediately that Arabic is welcome. It costs nothing and removes hesitation."] },
      { h: "Mind the tone", p: ["Courtesy matters. Greetings, thanks and polite closings are expected, and an abrupt reply reads as rude. In {name} you can set a formal or friendly tone for the assistant."] },
      { h: "Respect the calendar", p: ["Working hours change during Ramadan and around Eid, and customers ask about them. Update your hours and add a note when your schedule changes, so the assistant answers correctly."] },
    ],
    faq: [
      { q: "Do I need an Arabic version of my website first?", a: "It helps, but it is not required for the chat. {name} answers Arabic-speaking customers in Arabic from your information in any language." },
      { q: "Does the dashboard support Arabic?", a: "Yes. The {name} dashboard is available in Arabic and English." },
      { q: "What is Arabizi?", a: "Arabic written with Latin letters and numbers, such as \"7abibi\". Many younger customers use it in chats." },
    ],
  },

  "measure-chatbot-success": {
    name: "How to measure chatbot success",
    short: "The handful of numbers that tell you whether your assistant is working.",
    meta: {
      title: "How to measure the success of your website chatbot",
      description: "The metrics that show whether a website chatbot is working: conversations, answer rate, handovers, leads and the questions it could not answer.",
    },
    h1: "How to measure whether your chatbot is working",
    sub: "You do not need a data team. Five numbers, checked once a week, tell you almost everything.",
    intro: [
      "A chatbot is easy to install and easy to forget. Checking a few numbers regularly is what turns it from a widget into a tool that keeps improving.",
    ],
    sections: [
      { h: "1. Conversations per week", p: ["How many visitors start a chat. If the number is low, make the chat button more visible or improve the greeting. A sudden drop can also mean the widget stopped loading, for example after a website change."] },
      { h: "2. Questions answered by the assistant", p: ["The share of conversations handled without a person. A rising share means your information is getting more complete.", "{name} shows conversations per day and how each was handled."] },
      { h: "3. Unanswered questions", p: ["The most useful list of all. Each unanswered question is either a gap in your information or a request that genuinely needs a person.", "In {name}, each one has a button to add the missing answer."] },
      { h: "4. Leads captured", p: ["How many conversations ended with a name and number, and how many of those became customers. Mark leads as contacted or converted to see the whole picture."] },
      { h: "5. Handovers", p: ["How often customers ask for a person, and how quickly your team responds. Many handovers on the same topic means the assistant needs better information there."] },
    ],
    faq: [
      { q: "What is a good answer rate?", a: "It depends on your business. Track your own trend: it should rise in the first weeks as you fill the gaps." },
      { q: "How often should I review?", a: "Weekly at first, then every two weeks once things are stable." },
      { q: "Can I export the data?", a: "{name} lets you export leads as a CSV file. Conversations are searchable in the inbox." },
    ],
  },

  "chatbot-data-privacy": {
    name: "Chatbot data privacy: what to ask a vendor",
    short: "The questions to ask before you put an AI chatbot on your website.",
    meta: {
      title: "AI chatbot data privacy: questions to ask before you choose",
      description: "What to check about data privacy before adding an AI chatbot to your website: what is stored, who can see it, data separation, website restrictions and deletion.",
    },
    h1: "Chatbot data privacy: what to ask before you choose",
    sub: "A chatbot handles your business information and your customers' messages. These are the questions worth asking first.",
    intro: [
      "Adding an AI assistant to your website means trusting a vendor with two kinds of data: the information you give the assistant, and the conversations your customers have with it. Both deserve a few direct questions.",
    ],
    sections: [
      { h: "What exactly is stored?", p: ["Ask what is kept: messages, visitor details, files you upload. For example, {name} stores chat messages and any contact details a visitor chooses to share; for uploaded files, only the extracted text is kept, not the file itself."] },
      { h: "Is my data kept separate from other businesses?", p: ["A multi-business platform must make sure one business's information never answers another's customers. In {name}, each business has its own workspace and its data is isolated from every other."] },
      { h: "Where can the chat be used?", p: ["If anyone can copy your embed code to their site, your assistant and your message allowance can be used without you knowing. Look for a list of approved websites: {name}'s widget only loads on the domains you allow."] },
      { h: "Who on my team can see conversations?", p: ["Check that you can control access. In {name}, owners manage settings and agents handle chats, and you invite each person yourself."] },
      { h: "What should I avoid putting into it?", p: ["Whatever you give an assistant may be repeated to any visitor. Never add internal prices, staff details or anything confidential to its knowledge.", "Read the vendor's privacy policy, and update your own website's privacy notice to mention the chat."] },
    ],
    faq: [
      { q: "Do customers need to give personal details to chat?", a: "Not with {name} by default. Visitors can chat anonymously; contact details are collected only if they share them, or if you turn on the pre-chat form." },
      { q: "Can visitors trick the assistant into revealing other data?", a: "The assistant only has access to the information you gave it for your business, and {name} includes protections against attempts to make it ignore its rules." },
      { q: "Should I mention the chat in my privacy policy?", a: "Yes. Explain that chats are stored and how you use contact details shared in them." },
    ],
  },

  "reduce-customer-response-time": {
    name: "How to reduce customer response time",
    short: "Practical ways to reply faster without hiring more people.",
    meta: {
      title: "How to reduce customer response time (small business guide)",
      description: "Practical ways for small businesses to reply to customers faster: instant answers for routine questions, alerts, shared inboxes and saved answers.",
    },
    h1: "How to reply to customers faster without hiring",
    sub: "Response time is one of the few things a small business can beat a big one on. Here is how.",
    intro: [
      "When a customer contacts several businesses, the first reply often wins the job. Speed is not about working harder; it is about removing the delays between a question and its answer.",
    ],
    sections: [
      { h: "Answer routine questions instantly", p: ["A large share of questions have fixed answers: prices, hours, location, policies. Let an AI assistant answer those in seconds, at any hour, so people only handle what needs them."] },
      { h: "Get alerts where you will see them", p: ["Requests that sit unseen are the biggest source of delay. Make sure new leads and chats that need a person reach you immediately. {name} sends an email for each."] },
      { h: "Use one shared inbox", p: ["When messages are spread over personal phones and email accounts, nobody knows who is replying. A shared inbox shows every conversation, who took it and what is waiting."] },
      { h: "Prepare your answers", p: ["Write down your best answers to common questions once, and reuse them. The same text then feeds your assistant's knowledge base."] },
      { h: "Set a target and check it", p: ["Pick a realistic goal, such as replying to every lead within an hour during working hours, and look at how often you meet it."] },
    ],
    faq: [
      { q: "What is a good response time?", a: "For website chat, customers expect seconds. For a follow-up call or email after a request, within an hour during working hours is excellent." },
      { q: "Will an instant AI reply feel impersonal?", a: "Not if it is accurate and offers a person when needed. Most customers prefer an immediate correct answer to waiting." },
      { q: "How do I handle messages outside working hours?", a: "Answer routine questions automatically and capture requests for follow-up first thing in the morning." },
    ],
  },

  "website-chatbot-best-practices": {
    name: "Website chatbot best practices",
    short: "Ten practical rules for a chatbot customers actually like.",
    meta: {
      title: "Website chatbot best practices for businesses",
      description: "Best practices for a business website chatbot: accurate information, a clear greeting, visible human option, mobile-friendly design and regular reviews.",
    },
    h1: "Website chatbot best practices",
    sub: "Most bad chatbots fail in the same few ways. Avoid them and yours will be one customers are glad to use.",
    intro: [
      "A good website chatbot feels like a knowledgeable receptionist: quick, accurate, polite and happy to fetch a colleague. These practices get you there.",
    ],
    sections: [
      { h: "Give it complete, current information", p: ["Prices, services, hours, location and policies first. Most wrong or missing answers trace back to missing information, not to the AI."] },
      { h: "Answer only from that information", p: ["An assistant that invents answers damages trust. Choose one that answers from your content and says when it does not know, as {name} does."] },
      { h: "Make the human option obvious", p: ["Never trap customers with a bot. A visible way to reach a person, and a quick handover, keeps frustration away."] },
      { h: "Write a specific greeting and pick a tone", p: ["Tell visitors what they can ask about, and use the tone your customers expect from you, formal or friendly."] },
      { h: "Respect the page and the phone", p: ["The chat should not cover the content people came for, especially on mobile. {name}'s widget opens as a compact sheet on phones and never covers the whole page.", "Finally, review your conversations and unanswered questions regularly, and keep improving the information the assistant uses."] },
    ],
    faq: [
      { q: "Where should the chat button go?", a: "Bottom right or bottom left, consistently on every page. Pick the corner that does not cover your own buttons." },
      { q: "Should the chat open automatically?", a: "Usually not. A visible button and a good greeting work better than pop-ups." },
      { q: "How do I keep it on brand?", a: "Use your brand colour, logo and greeting; {name} lets you set all three." },
    ],
  },

  "qualify-leads-with-chatbot": {
    name: "How to qualify leads with a chatbot",
    short: "Turn chat conversations into leads your team can prioritise.",
    meta: {
      title: "How to qualify leads with a website chatbot",
      description: "How to use a website chatbot to qualify leads: let customers explain their needs, capture contact details at the right moment and prioritise follow-up.",
    },
    h1: "How to qualify leads with a chatbot",
    sub: "Not every enquiry is equal. A good conversation tells you which ones to call first.",
    intro: [
      "Lead qualification means working out which enquiries are likely to become customers, so your team spends its time well. A chat conversation is a natural place to do it, because the customer explains what they want in their own words.",
    ],
    sections: [
      { h: "Let the customer talk first", p: ["The questions a visitor asks reveal their intent. Someone asking about a specific service, a date and a price is further along than someone browsing.", "Answer their questions fully before asking for anything. People share more once they have been helped."] },
      { h: "Ask for contact details at the right moment", p: ["Ask when the customer wants something only a person can give: a quote, a booking, a call back. {name} asks for a name and phone number when it sees that intent, and does not interrupt visitors who are only browsing."] },
      { h: "Keep the conversation with the lead", p: ["A name and number alone tell you little. A lead with the full conversation tells you what they need, what they were already told and what to say first.", "In {name}, every lead links to its conversation, and records the product or service they looked at in the chat."] },
      { h: "Prioritise and track", p: ["Call the most specific requests first. Mark each lead as new, contacted or converted, so nobody is called twice or forgotten."] },
      { h: "Learn from the results", p: ["After a month, look at which kinds of conversations became customers. Use that to improve your greeting, your information and your follow-up."] },
    ],
    faq: [
      { q: "Should the chatbot ask budget questions?", a: "Only if it suits your business. Many customers find budget questions in a chat intrusive; let your team ask on the call." },
      { q: "Can I send leads to my CRM?", a: "{name} exports leads as a CSV file you can import into most CRMs. A direct connection is not available yet." },
      { q: "How fast should we follow up?", a: "As fast as possible: within an hour during working hours, and first thing in the morning for overnight leads." },
    ],
  },

  "is-a-chatbot-worth-it-for-small-business": {
    name: "Is an AI chatbot worth it for a small business?",
    short: "An honest look at when it pays off, and when it does not.",
    meta: {
      title: "Is an AI chatbot worth it for a small business?",
      description: "An honest look at whether an AI chatbot is worth it for a small business: the costs, the time saved, the enquiries won, and when it is not the right fit.",
    },
    h1: "Is an AI chatbot worth it for a small business?",
    sub: "Sometimes yes, sometimes no. Here is how to tell which applies to you.",
    intro: [
      "AI chatbots are heavily promoted, and not every business needs one. The question is simple: does your website bring in questions that cost you time or customers? If it does, an assistant usually pays for itself quickly.",
    ],
    sections: [
      { h: "It is probably worth it if…", p: ["You answer the same questions every day by phone, email or messaging. Customers contact you outside working hours. You serve customers in more than one language. Enquiries go unanswered because everyone is busy.", "These are exactly the situations an assistant handles well."] },
      { h: "It is probably not worth it yet if…", p: ["Your website gets very few visitors, or almost every enquiry is complex and unique. In that case, improve your website and your traffic first."] },
      { h: "What it costs in time", p: ["With a modern assistant, setup is an afternoon: add your website, a price list and a few notes, test it, paste one line of code. After that, a few minutes a week to review unanswered questions and follow up leads."] },
      { h: "What it costs in money", p: ["Plans are usually monthly and priced by volume. {name} has a free plan to try on your own site and paid plans from €19 a month. Compare that with the value of one extra customer a month."] },
      { h: "Try it before you decide", p: ["The easiest way to know is to try it on your own site for a few weeks and look at the conversations: how many there were, what people asked, and how many leads came in."] },
    ],
    faq: [
      { q: "Will customers actually use it?", a: "If the button is visible and the greeting is specific, yes. Many people prefer typing a quick question to calling." },
      { q: "Can it hurt my business?", a: "A badly configured bot that invents answers can. Choose one that answers only from your information and offers a person when it does not know." },
      { q: "How long until I see results?", a: "Usually within the first weeks, as conversations and leads start appearing in your dashboard." },
    ],
  },

  "prepare-content-for-ai-chatbot": {
    name: "How to prepare your content for an AI chatbot",
    short: "What to give your assistant, in what form, and what to leave out.",
    meta: {
      title: "How to prepare your business content for an AI chatbot",
      description: "A checklist for preparing the information an AI chatbot answers from: website pages, price lists, policies, FAQs and notes, plus what to leave out.",
    },
    h1: "How to prepare your content for an AI chatbot",
    sub: "Good answers start with good information. This checklist takes about an hour.",
    intro: [
      "An AI assistant like {name} answers only from what you give it. You do not need to write anything new to start, but a little preparation makes a big difference to the quality of its answers.",
    ],
    sections: [
      { h: "Start with your website", p: ["Your service pages, pricing page, about page and contact page are the core. Add your website address and the assistant reads those pages.", "If parts of your site are out of date, fix them first or leave them out: the assistant will repeat what they say."] },
      { h: "Add the documents customers ask about", p: ["Price lists, menus, brochures, terms and conditions, delivery and returns policies. {name} accepts PDF, Word and text files of up to 4 MB.", "Scanned images of documents do not work well; use files that contain real text."] },
      { h: "Write down what only you know", p: ["Many answers live in your head: which areas you cover, whether you take walk-ins, how far ahead people should book, what happens if they are late. Write short notes for these."] },
      { h: "Add FAQs for the top questions", p: ["For your ten most common questions, write a clear question-and-answer pair. These give the assistant precise wording for the things that matter most."] },
      { h: "Leave out what should stay private", p: ["Internal prices, supplier details, staff information and anything you would not tell a stranger. Whatever the assistant knows, any visitor might be told."] },
    ],
    faq: [
      { q: "How many pages can it read?", a: "{name} reads your site up to your plan's knowledge-page limit, from 10 pages on the free plan to 1,000 on Pro. Each file, FAQ or note also counts as a page." },
      { q: "What happens when I change my website?", a: "Press Re-sync on your website source and the assistant reads the updated pages." },
      { q: "Does the content need to be in English?", a: "No. Use the language your content is in. The assistant answers customers in theirs." },
    ],
  },

  "customer-service-in-the-uae": {
    name: "Customer service expectations in the UAE",
    short: "Languages, hours and channels: what customers in the UAE expect.",
    meta: {
      title: "Customer service in the UAE: what customers expect online",
      description: "What customers in the UAE expect from online customer service: fast replies, Arabic and English, many other languages, evening hours and Ramadan schedules.",
    },
    h1: "Customer service in the UAE: what customers expect",
    sub: "A diverse, mobile-first market with high expectations. Here is what that means for your website.",
    intro: [
      "The UAE is one of the most international markets in the world. A single business in Dubai or Abu Dhabi may serve Emirati families, expatriates from dozens of countries and tourists in the same day. Online customer service has to keep up with that variety.",
    ],
    sections: [
      { h: "Speed is expected", p: ["Customers are used to instant messaging and fast service. An enquiry left unanswered for a day is often already lost to a competitor.", "Instant answers to routine questions, and quick follow-up on requests, set a business apart."] },
      { h: "Arabic and English, and many more", p: ["Arabic and English are the baseline. Many customers are more comfortable in Hindi, Urdu, Malayalam, Tagalog, Russian or another language.", "An assistant that replies in each customer's language, such as {name}, makes all of them feel served without hiring for each language."] },
      { h: "Evenings and weekends matter", p: ["Many people research services after work, late in the evening. The UAE weekend for government and many companies is Saturday and Sunday, but plenty of businesses keep their own schedules.", "Make sure your website states your hours clearly, and that enquiries outside them still get an answer."] },
      { h: "Plan for Ramadan and holidays", p: ["Working hours change during Ramadan and around public holidays, and customers ask about them. Update your hours and add a note for the period, so your website and assistant give the right answer."] },
      { h: "Mobile first", p: ["Most browsing happens on phones. A chat that works well on a small screen, without covering the page, is essential."] },
    ],
    faq: [
      { q: "Do I need Arabic on my website?", a: "It is strongly recommended. At minimum, make sure Arabic-speaking customers can get answers in Arabic, which {name} does in the chat." },
      { q: "What about WhatsApp?", a: "WhatsApp is very popular in the UAE. {name}'s website chat is available today, and WhatsApp is planned to arrive in the same inbox." },
      { q: "Which currency should I quote?", a: "Quote prices in AED for local customers, and write them that way in the information your assistant uses." },
    ],
  },

  "chatbot-mistakes-to-avoid": {
    name: "Chatbot mistakes to avoid",
    short: "The common mistakes that make customers hate chatbots.",
    meta: {
      title: "8 chatbot mistakes businesses make (and how to avoid them)",
      description: "The most common website chatbot mistakes: invented answers, no human option, outdated information, pushy pop-ups and never reviewing conversations.",
    },
    h1: "Chatbot mistakes to avoid",
    sub: "Most of what people dislike about chatbots comes from a few avoidable mistakes.",
    intro: [
      "Customers do not hate chatbots. They hate chatbots that waste their time. Here are the mistakes behind most bad experiences, and the simple fixes.",
    ],
    sections: [
      { h: "Letting it guess", p: ["A bot that invents a price or a policy creates angry customers. Use an assistant that answers only from your information and says when it does not know."] },
      { h: "Hiding the human", p: ["If customers cannot reach a person, they leave or complain elsewhere. Keep a visible \"talk to a human\" option and respond to handovers quickly."] },
      { h: "Outdated information", p: ["Last year's prices and old opening hours turn an assistant into a liability. Re-sync your website and update notes whenever things change."] },
      { h: "Interrupting visitors", p: ["Pop-ups that cover the page, sounds and repeated prompts annoy people, especially on phones. A visible button and a good greeting are enough."] },
      { h: "Asking for details too early, and never looking back", p: ["Demanding a phone number before answering anything drives visitors away; answer first, then ask when they want something.", "And do not set it and forget it. The conversations show you what customers want and where the assistant needs better information. Review them regularly."] },
    ],
    faq: [
      { q: "What is the single most important fix?", a: "Accurate information plus a clear way to reach a person. Most other problems are minor in comparison." },
      { q: "Should I name the assistant?", a: "A name and a friendly greeting make the chat feel less mechanical; just be clear it is an assistant." },
      { q: "How often should I review conversations?", a: "Weekly at first, then every couple of weeks." },
    ],
  },

  "chat-on-mobile": {
    name: "Website chat on mobile phones",
    short: "Why mobile chat is different, and how to get it right.",
    meta: {
      title: "Website chat on mobile: how to get it right",
      description: "Most website visitors are on phones. How to make your website chat work on mobile: placement, size, keyboard, speed and short answers.",
    },
    h1: "Getting website chat right on mobile phones",
    sub: "Most of your visitors are on a phone. A chat designed for desktops frustrates them.",
    intro: [
      "On many business websites, most visitors arrive on a phone. They are often on the move, typing with one thumb, with a small screen and a patchy connection. Website chat has to be designed for that.",
    ],
    sections: [
      { h: "Do not cover the page", p: ["A chat window that fills the whole screen hides the content the visitor came for. On phones, the chat should open as a sheet that leaves the page visible behind it, and close easily.", "{name}'s widget opens as a compact sheet on phones and never covers the whole page."] },
      { h: "Keep the button out of the way", p: ["The chat button should not cover your own call-to-action buttons, cookie banners or navigation. Choose the left or right corner to suit your site."] },
      { h: "Short answers win", p: ["Long paragraphs are hard to read on a phone. Assistants should answer briefly and offer more detail if asked. Replies that appear word by word feel faster than a long wait for a block of text."] },
      { h: "Make typing optional", p: ["Product cards that can be tapped, and a short pre-chat form only when you really need it, save visitors from typing on small keyboards."] },
      { h: "Load fast", p: ["Every extra second of loading costs visitors on mobile networks. The chat script should be small and load without blocking the page. The {name} loader is under one kilobyte."] },
    ],
    faq: [
      { q: "Should the chat open automatically on phones?", a: "No. It takes over a small screen. Let visitors open it when they want." },
      { q: "Does the conversation survive moving between pages?", a: "With {name}, yes: the conversation is remembered while the visitor browses your site." },
      { q: "How do I test it?", a: "Open your site on your own phone, on mobile data rather than Wi-Fi, and ask a few questions." },
    ],
  },

  "what-is-ai-customer-support": {
    name: "What is AI customer support?",
    short: "A plain-language explanation for business owners.",
    meta: {
      title: "What is AI customer support? A plain-language guide",
      description: "What AI customer support is, how AI assistants answer from your information, what they do well, what they should not do and how to start.",
    },
    h1: "What is AI customer support?",
    sub: "A plain explanation, without the hype, for business owners deciding whether it is for them.",
    intro: [
      "AI customer support means using an AI assistant to answer customers' questions, usually in a chat on your website or in messaging apps. Modern assistants write their own replies in natural language, instead of following the rigid scripts of older chatbots.",
    ],
    sections: [
      { h: "How it works", p: ["You give the assistant your business information: website pages, documents, FAQs and notes. When a customer asks a question, the system finds the relevant parts of that information and an AI model writes an answer from them, in the customer's language.", "This approach is often called retrieval-augmented generation. For a business owner, what matters is that the answers come from your information, not from the internet."] },
      { h: "What it does well", p: ["Answering routine questions instantly, at any hour. Replying in many languages. Capturing contact details from interested customers. Handling many conversations at once without a queue."] },
      { h: "What it should not do", p: ["Give medical, legal or financial advice, make promises you did not authorise, handle complaints alone, or invent answers. A good system passes these to your team."] },
      { h: "How it differs from old chatbots", p: ["Old chatbots offered menus of buttons and broke as soon as a customer typed something unexpected. AI assistants understand free text, typos and mixed languages, and they can be set up from information you already have."] },
      { h: "How to start", p: ["Pick one channel, usually your website. Give the assistant your most important information, test it with real questions, and put it live. {name} has a free plan so you can try it on your own site first."] },
    ],
    faq: [
      { q: "Is AI customer support the same as a chatbot?", a: "A chatbot is the interface. AI customer support is the broader practice of using AI to answer customers, usually through a chatbot." },
      { q: "Does it replace human support?", a: "It replaces the repetitive part. People still handle complaints, exceptions and relationships." },
      { q: "Is it expensive?", a: "Not necessarily. Many products, including {name}, have a free plan and monthly plans priced by volume." },
    ],
  },
};
