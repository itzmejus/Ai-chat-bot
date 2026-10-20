import type { TopicPage } from "../types";
import type { NewUseCase } from "./slugs";

/** More jobs the assistant does. Every point describes something the product does today. */
export const useCasesMoreEn: Record<NewUseCase, TopicPage> = {
  "appointment-requests": {
    name: "Appointment requests",
    short: "Collect booking requests with the customer's details, day and night.",
    meta: {
      title: "AI chatbot for appointment requests on your website",
      description: "Let {name} answer booking questions and collect appointment requests with name, phone and preferred time, ready for your team to confirm.",
    },
    h1: "Collect appointment requests while you are busy",
    sub: "Customers ask about availability at all hours. The assistant answers their questions and takes the request, so your team only has to confirm it.",
    intro: [
      "Before someone books, they usually want to know a few things first: what the service costs, how long it takes, whether you are open on Saturday, whether they need to prepare anything. {name} answers those questions from your information, then asks for their name, phone number and preferred time.",
      "The request arrives in your leads list with the whole conversation attached, and you get an email. Your team calls back or messages to confirm, knowing exactly what the customer wants.",
    ],
    points: [
      { title: "Questions first, then the request", text: "The assistant answers price, duration and opening-hour questions before asking for details, which is how people decide to book." },
      { title: "Everything in one place", text: "Each request is saved with the customer's name, number and the conversation, and marked new until someone follows up." },
      { title: "Requests outside working hours", text: "Evening and weekend requests are waiting for you in the morning instead of going to a competitor who answered first." },
      { title: "Optional form before the chat", text: "Turn on the pre-chat form if you want every conversation to start with a name and phone number." },
    ],
    faq: [
      { q: "Does it book straight into my calendar?", a: "No. It collects the request and the customer's details for your team to confirm. Calendar booking is not available yet." },
      { q: "Can it tell customers which times are free?", a: "It can tell them your opening hours and anything you write in your notes, but it does not see your live diary, so it does not promise specific slots." },
      { q: "How do I know a request came in?", a: "You receive an email for each new lead, and it appears in your leads list and inbox." },
    ],
  },

  "faq-automation": {
    name: "FAQ automation",
    short: "Turn your FAQs into instant answers in the customer's words.",
    meta: {
      title: "Automate your FAQs with an AI assistant",
      description: "Turn your frequently asked questions into instant answers. {name} understands each question however it is worded and replies from your own FAQs and pages.",
    },
    h1: "Answer frequently asked questions automatically",
    sub: "An FAQ page only helps the customers who read it. The assistant answers the same questions in the chat, however they are phrased.",
    intro: [
      "Most businesses have an FAQ page, and most customers still ask the questions on it. They do not want to scroll; they want to type their question and get an answer. {name} uses your FAQs, your pages and your notes to give that answer straight away.",
      "Because it understands meaning rather than matching keywords, \"do you open on Fridays\", \"friday timings?\" and a question in Arabic all get the same correct answer.",
    ],
    points: [
      { title: "Add questions in seconds", text: "Type a question and its answer in your knowledge base, and the assistant uses it from then on." },
      { title: "Understands any wording", text: "Customers do not need to use your words. Spelling mistakes and mixed languages are fine." },
      { title: "Finds the gaps for you", text: "Questions it could not answer are listed in your dashboard with a button to add the answer." },
      { title: "Grouped most-asked questions", text: "See which questions come up most, with similar wordings grouped, so you know what matters to customers." },
    ],
    faq: [
      { q: "Do I need to write every possible question?", a: "No. Write each answer once. The assistant recognises the many ways people ask the same thing." },
      { q: "What if my FAQ page and price list disagree?", a: "The assistant answers from what you gave it, so keep your sources consistent. Re-sync your website after you update it." },
      { q: "Can I see what it answered?", a: "Yes. Every conversation is in your inbox, and the test chat shows the sources behind each reply." },
    ],
  },

  "pre-sales-questions": {
    name: "Pre-sales questions",
    short: "Answer the questions people ask before they decide to buy.",
    meta: {
      title: "Answer pre-sales questions with an AI chatbot",
      description: "Answer pre-sales questions on your website instantly. {name} explains prices, options and policies from your information and captures interested buyers.",
    },
    h1: "Answer the questions that come before the sale",
    sub: "People rarely buy with an open question. The assistant answers it while they are still on your page.",
    intro: [
      "\"Is this suitable for me?\", \"what is included?\", \"how soon can you start?\". Questions like these sit between a visitor and a purchase. When nobody answers, the visitor leaves to compare elsewhere. {name} answers them on the spot, from your own descriptions, prices and policies.",
      "When the visitor is ready, the assistant asks for their name and phone number so your team can close the sale.",
    ],
    points: [
      { title: "Explains your offer", text: "Packages, options, what is included and what is not, using the information you provided." },
      { title: "Shows what you sell", text: "Add products or services with photos and prices, and the assistant shows the relevant ones as cards in the chat." },
      { title: "Captures buying intent", text: "When someone wants a quote, a demo or a call back, their details go to your leads list." },
      { title: "Never invents a discount", text: "It quotes only prices and terms you gave it, and offers a person for anything else." },
    ],
    faq: [
      { q: "Will it negotiate prices?", a: "No. It quotes the prices you provided and passes negotiations and special requests to your team." },
      { q: "Can it compare my products?", a: "Yes, when the details of each product are in your information. It compares what you described, not outside data." },
      { q: "Does it work for services as well as products?", a: "Yes. Add your services the same way, with a description and a price or a starting price." },
    ],
  },

  "quote-requests": {
    name: "Quote requests",
    short: "Gather the details you need to send a quote.",
    meta: {
      title: "Collect quote requests with an AI chatbot",
      description: "Use {name} to collect quote requests on your website: it answers first questions, gathers the customer's needs and contact details, and alerts your team.",
    },
    h1: "Collect quote requests with the details already filled in",
    sub: "A quote request that says only \"how much?\" means another round of questions. The assistant gathers the context in the conversation.",
    intro: [
      "For contractors, agencies, event companies and many other services, every job is priced individually. The first message is usually vague, and the details arrive over several emails. {name} answers what it can from your information, and the conversation itself captures what the customer needs.",
      "Their name and number are saved as a lead with the full chat, so whoever prepares the quote can read the request instead of starting from zero.",
    ],
    points: [
      { title: "Explains how you price", text: "Write a note on what affects your prices and the assistant explains it, without making up a number." },
      { title: "The conversation is the brief", text: "Everything the customer said about the job is attached to the lead." },
      { title: "Alerts the right people", text: "New leads are emailed to you, and anyone on your team can pick up the chat." },
      { title: "Works after hours", text: "Requests sent in the evening are waiting for you, complete, the next morning." },
    ],
    faq: [
      { q: "Can it calculate a price for the customer?", a: "It can give prices and ranges you wrote down, such as starting prices. It does not calculate custom quotes." },
      { q: "Can I ask for specific details every time?", a: "Write in your notes what you need to know for a quote, and the assistant can explain that to customers. The pre-chat form collects name and phone before the chat." },
      { q: "Where do the requests go?", a: "To your leads list, with an email to you. You can export them as a CSV file." },
    ],
  },

  "arabic-chatbot": {
    name: "Arabic chatbot",
    short: "An AI assistant that answers in Arabic, right to left, dialects included.",
    meta: {
      title: "Arabic AI chatbot for your website (Arabic and English)",
      description: "{name} is an AI chatbot that answers customers in Arabic, including Gulf and other dialects, with a right-to-left chat window, and in English and other languages too.",
    },
    h1: "An AI chatbot that answers your customers in Arabic",
    sub: "Customers in the Gulf and the wider Arab world switch between Arabic and English. The assistant follows them, in proper right-to-left layout.",
    intro: [
      "Many chatbots treat Arabic as an afterthought: broken layout, stiff translations, no understanding of dialect. {name} was built for businesses whose customers write in Arabic and English, often in the same conversation.",
      "Customers can write in Modern Standard Arabic, in Gulf, Egyptian or Levantine dialect, or in Arabic words typed with Latin letters. The assistant answers in their language, using the facts from your information, whichever language you wrote it in.",
    ],
    points: [
      { title: "Right-to-left done properly", text: "The chat window switches to a right-to-left layout for Arabic, including numbers and mixed text." },
      { title: "Understands dialects", text: "Questions in regional dialects are understood and answered clearly." },
      { title: "One set of information", text: "Your price list can be in English and Arabic-speaking customers still get answers in Arabic." },
      { title: "Arabic dashboard", text: "Your team can use the dashboard in Arabic or English." },
    ],
    faq: [
      { q: "Do I need to write my information in Arabic?", a: "No. Write it in the language you have it in. The assistant answers Arabic-speaking customers in Arabic." },
      { q: "Which Arabic does it reply in?", a: "Clear, polite Arabic that customers across the region understand. It understands dialect in the customer's messages." },
      { q: "Can the greeting be in Arabic?", a: "Yes. Write your greeting in Arabic, English or both." },
    ],
  },

  "fewer-phone-calls": {
    name: "Fewer phone calls",
    short: "Move routine questions from the phone to the chat.",
    meta: {
      title: "Reduce repetitive phone calls with an AI website assistant",
      description: "Cut the routine calls that interrupt your team. {name} answers questions on prices, hours, location and policies in your website chat, day and night.",
    },
    h1: "Fewer phone calls about things your website already says",
    sub: "\"Are you open today?\", \"how much is it?\", \"where are you?\". The assistant answers these in the chat so your phone rings for the conversations that matter.",
    intro: [
      "Every routine call interrupts someone: a receptionist with a customer in front of them, a technician on a job, an owner trying to work. Most of those calls are questions with simple, fixed answers. {name} gives those answers in your website chat, instantly.",
      "Customers often prefer it too: no waiting on hold, no calling during working hours, and the answer is in writing.",
    ],
    points: [
      { title: "The common questions, handled", text: "Prices, opening hours, directions, parking, what to bring, payment methods: whatever you put in your information." },
      { title: "Visible on every page", text: "The chat button is where customers already are, before they reach for the phone." },
      { title: "Your number when it matters", text: "Your contact details are in the assistant's information, so it can tell customers when a call is the right step." },
      { title: "See what people asked", text: "Your dashboard shows the most asked questions, so you know what was taking up phone time." },
    ],
    faq: [
      { q: "Will customers still be able to call me?", a: "Of course. The assistant does not hide your number; it simply answers the questions that do not need a call." },
      { q: "Can it answer the phone?", a: "No. It works in the chat on your website. Voice calls are not part of the product." },
      { q: "What about customers who prefer WhatsApp?", a: "The website chat is available today. WhatsApp and Instagram are planned to arrive in the same inbox." },
    ],
  },

  "small-business-support": {
    name: "Customer service for small businesses",
    short: "Big-company responsiveness for a team of one to ten.",
    meta: {
      title: "AI customer service for small businesses",
      description: "{name} gives small businesses instant, accurate customer service on their website without hiring: answers from your information, lead capture and a shared inbox.",
    },
    h1: "Customer service that keeps up, even with a small team",
    sub: "You do not have a support department. You have a few people doing everything. The assistant takes the questions so they can do the work.",
    intro: [
      "In a small business the person who answers customer questions is usually also doing the selling, the bookkeeping and the actual job. Questions wait, and some customers do not. {name} answers them immediately, from the information you give it, and brings you in when a person is needed.",
      "The free plan lets you try it on your own site, and the paid plans grow with your number of conversations and team members.",
    ],
    points: [
      { title: "Set up in an afternoon", text: "Enter your website, add a price list and a few notes, paste one line of code. No developers, no scripts to write." },
      { title: "Accurate by design", text: "It answers only from what you gave it, and says so when it does not know." },
      { title: "One inbox for everyone", text: "Owners and agents see every conversation, and anyone can take over a chat in one click." },
      { title: "Clear monthly pricing", text: "A free plan to start and monthly plans by number of AI replies, knowledge pages and team members." },
    ],
    faq: [
      { q: "How much time does it take to run?", a: "After setup, a few minutes a week: glance at unanswered questions, add the missing answers, follow up your leads." },
      { q: "Do I need to be technical?", a: "No. If you can paste a line of text into your website settings, you can install it." },
      { q: "What if I outgrow the free plan?", a: "When you reach your plan's monthly limit, the widget stays on your site and shows your contact details instead of AI answers, and customers can leave their name and number. The count resets each month, or you can upgrade." },
    ],
  },

  "ecommerce-support": {
    name: "E-commerce customer support",
    short: "Delivery, returns, sizes and payment questions, answered instantly.",
    meta: {
      title: "AI chatbot for e-commerce customer support",
      description: "Answer online shoppers' questions on delivery, returns, sizes and payment instantly. {name} replies from your store content and shows product cards in the chat.",
    },
    h1: "Customer support for your online store, around the clock",
    sub: "Online shoppers expect an answer in seconds. The assistant gives it, using your own policies and product information.",
    intro: [
      "An online store gets the same questions every day: delivery times and costs, return windows, sizes, payment options, cash on delivery. Answering them by email is slow, and slow answers lose sales. {name} answers in the chat on every page of your store.",
      "It works with Shopify, WooCommerce, BigCommerce and any other store you can add a line of code to.",
    ],
    points: [
      { title: "Policies, answered precisely", text: "Delivery areas, costs, return windows and exchange rules, quoted from your own policy text." },
      { title: "Product cards", text: "Add products with photos and prices, and the assistant shows the right ones when shoppers ask." },
      { title: "Shoppers in their language", text: "International customers get answers in the language they write in." },
      { title: "Hand over order problems", text: "Questions about a specific order are flagged for your team, who can take over the chat." },
    ],
    faq: [
      { q: "Can it track orders?", a: "No. It does not connect to your order system. It can explain how tracking works and flag the chat for your team." },
      { q: "Does it read my product pages?", a: "Yes, it reads your public store pages when you add your website, up to your plan's page limit." },
      { q: "Will it work during big sales?", a: "Yes. It answers many shoppers at once, so sale-day questions do not pile up." },
    ],
  },

  "human-handover": {
    name: "AI with human handover",
    short: "The assistant answers first and steps aside for your team.",
    meta: {
      title: "AI chatbot with human handover and live takeover",
      description: "{name} answers routine questions and hands complaints, unusual requests and customers who ask for a person to your team, who take over the chat in one click.",
    },
    h1: "AI that knows when to bring in a person",
    sub: "Some conversations need a human. The assistant flags them, tells your team and steps aside the moment someone takes over.",
    intro: [
      "Fully automated support frustrates customers when their problem does not fit the script. Fully manual support is slow and expensive. {name} combines the two: the assistant handles routine questions instantly, and your team handles the rest, inside the same conversation.",
      "Customers can press \"Talk to a human\" at any time, and the assistant also flags conversations it cannot answer.",
    ],
    points: [
      { title: "Flagged automatically", text: "Chats the assistant could not answer, and customers who ask for a person, are marked as needing a human." },
      { title: "Your team is told", text: "An email goes to the addresses you choose, so nobody has to watch the inbox all day." },
      { title: "Takeover in one click", text: "Open the chat and press take over. The assistant goes quiet and your replies appear instantly in the customer's window." },
      { title: "Hand it back", text: "When you are done, return the chat to the assistant or close it." },
    ],
    faq: [
      { q: "Does the customer know a person has joined?", a: "Yes. A note appears in the chat when a team member joins." },
      { q: "What if nobody is available?", a: "The customer is told the team will get back to them, and the chat stays flagged until someone does. Their contact details can be collected as a lead." },
      { q: "Can several people work in the inbox?", a: "Yes. Invite team members as owners or agents; the number of seats depends on your plan." },
    ],
  },

  "customer-insights": {
    name: "Customer insights",
    short: "Learn what customers ask and what your website fails to answer.",
    meta: {
      title: "Customer insights from your website chat",
      description: "{name} shows the questions customers ask most, the ones your assistant could not answer, and how each conversation was handled, so you can improve your site.",
    },
    h1: "Find out what your customers really want to know",
    sub: "Every chat is a customer telling you, in their own words, what they are looking for. The dashboard turns that into a short list of things to fix.",
    intro: [
      "Analytics tell you which pages people visit. They do not tell you what people could not find. {name} does: every question asked in the chat is recorded, similar questions are grouped, and the ones the assistant could not answer are listed separately.",
      "That list is often the most useful to-do list a business can get: missing prices, unclear policies, services customers expect you to offer.",
    ],
    points: [
      { title: "Most asked questions", text: "The questions customers ask most, with different wordings of the same question grouped together." },
      { title: "Unanswered questions", text: "What the assistant could not answer, each with a button to add the answer straight away." },
      { title: "How chats were handled", text: "Conversations per day, and how many were answered by the assistant or needed a person." },
      { title: "Usage at a glance", text: "Your AI replies this month against your plan's limit." },
    ],
    faq: [
      { q: "Can I export conversations?", a: "Leads can be exported as a CSV file. Conversations are available in your inbox, with search and filters." },
      { q: "How are questions grouped?", a: "By meaning: different wordings of the same question in one language are counted together. The same question asked in two languages may appear as two entries." },
      { q: "How often is the dashboard updated?", a: "It reflects your conversations as they happen." },
    ],
  },
};
