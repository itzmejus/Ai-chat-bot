import type { TopicContent } from "./types";

/**
 * Search-focused pages: how to add the widget to each website builder, what the assistant
 * is used for, and a few longer guides. Every statement here describes something the
 * product does today; keep it that way when editing.
 */
export const topicsEn: TopicContent = {
  labels: {
    integrations: "Integrations",
    useCases: "Use cases",
    guides: "Blog",
    faq: "FAQ",
    resources: "Resources",
    steps: "How to set it up",
    why: "Why it works",
    related: "Keep reading",
    readMore: "Read more",
    questions: "Common questions",
    cta: "Start free",
    updated: "Updated October 2026",
  },

  hubs: {
    integrations: {
      meta: {
        title: "Integrations: add an AI chatbot to WordPress, Shopify, Wix, Webflow and more",
        description: "{name} works on any website. Step-by-step instructions for adding the AI chat widget to WordPress, Shopify, Wix, Webflow and Squarespace with one line of code.",
      },
      h1: "Works with the website you already have",
      sub: "The chat widget is one line of code, so it runs on every website builder and on custom sites. Pick yours for the exact steps.",
    },
    useCases: {
      meta: {
        title: "Use cases: what businesses use an AI website assistant for",
        description: "How businesses use {name}: answering customer questions automatically, capturing leads from website visitors, supporting customers in their own language, and replying after hours.",
      },
      h1: "What you can use it for",
      sub: "One assistant on your website, doing the jobs that otherwise wait for someone to be free.",
    },
    guides: {
      meta: {
        title: "Blog: AI chatbots for business websites, explained plainly",
        description: "Practical guides from {name}: how to add an AI chatbot to a website, how to train it on your own content, how it compares with live chat, and how to capture leads with it.",
      },
      h1: "Blog",
      sub: "Short, practical guides for business owners. No jargon.",
    },
    faq: {
      meta: {
        title: "Frequently asked questions about {name}",
        description: "Answers to common questions about {name}: how the AI assistant works, which languages it supports, how setup, pricing and message limits work, and how your data is handled.",
      },
      h1: "Frequently asked questions",
      sub: "How it works, what it costs, and what happens to your data.",
    },
  },

  integrations: {
    wordpress: {
      name: "WordPress",
      short: "Add the widget to any WordPress theme in a few minutes.",
      meta: {
        title: "AI chatbot for WordPress: add it with one line of code",
        description: "How to add the {name} AI chatbot to a WordPress site. Paste one line of code into your theme's footer or a code-snippet plugin and it answers visitors from your own content.",
      },
      h1: "An AI chatbot for your WordPress site",
      sub: "No dedicated plugin to maintain. Paste one line of code and the assistant answers your visitors from your own pages, files and FAQs.",
      intro: [
        "WordPress powers everything from one-page business sites to large shops, and visitors on all of them ask the same things: prices, opening hours, how to book. {name} reads your site and answers those questions for you, day and night.",
        "Because the widget is a single script tag, it works with every theme and page builder, including Elementor, Divi and the block editor.",
      ],
      steps: [
        { title: "Create your assistant", text: "Sign up, enter your website address and let the assistant read your pages. Add price lists, FAQs or notes for anything that is not on the site." },
        { title: "Allow your domain", text: "On the Widget page, add your website's domain under Allowed websites. The widget only loads on the sites you list there." },
        { title: "Copy the embed code", text: "On the same page, copy the one-line script tag." },
        { title: "Paste it into WordPress", text: "The simplest way is a header-and-footer code plugin such as WPCode: add a new snippet, paste the code and choose the site-wide footer. You can also paste it before the closing body tag in your theme's footer.php through Appearance > Theme File Editor." },
        { title: "Check it", text: "Open your site in a private window. The chat button appears in the corner. Ask it a question a customer would ask." },
      ],
      points: [
        { title: "Nothing to update", text: "There is no plugin to keep compatible with each WordPress release. The script loads the latest widget by itself." },
        { title: "Light on your pages", text: "The loader is under one kilobyte and the chat runs in its own frame, so it does not slow your theme or clash with its styles." },
        { title: "Answers from your content", text: "It replies only from what you gave it and offers a person when it does not know." },
      ],
      faq: [
        { q: "Is there a {name} plugin for WordPress?", a: "No, and you do not need one. The widget is one line of code that you paste into your site's footer, either with a code-snippet plugin or in your theme. It works with any theme or page builder." },
        { q: "Will it work with WooCommerce?", a: "Yes. It runs on every page of a WordPress site, including WooCommerce shop and product pages, and can answer questions about delivery, returns and products from the information you give it." },
        { q: "Will it slow down my site?", a: "The script that loads on your pages is very small and loads asynchronously, and the chat itself runs in a separate frame, so it does not block your page from rendering." },
      ],
    },
    shopify: {
      name: "Shopify",
      short: "Answer delivery, returns and product questions on your store.",
      meta: {
        title: "AI chatbot for Shopify stores: answer shoppers automatically",
        description: "How to add the {name} AI chatbot to a Shopify store. Paste one line of code into theme.liquid and it answers questions about products, delivery and returns in the shopper's language.",
      },
      h1: "An AI chatbot for your Shopify store",
      sub: "Shoppers with an unanswered question leave. The assistant replies in seconds with your delivery times, return policy and product details.",
      intro: [
        "Most pre-sale questions on a store are the same few: how long delivery takes, what it costs, how returns work, whether an item suits a need. {name} answers them from your own store content and policies.",
        "It can also show your products as cards in the chat, with a photo, a price and a link, when you add them to your account.",
      ],
      steps: [
        { title: "Create your assistant", text: "Sign up and enter your store's address so the assistant can read your pages. Upload your delivery and returns policy if they are not on the site." },
        { title: "Allow your domain", text: "Add your store's domain under Allowed websites on the Widget page. If customers also use your myshopify.com address, add that too." },
        { title: "Copy the embed code", text: "Copy the one-line script tag from the Widget page." },
        { title: "Paste it into your theme", text: "In Shopify admin go to Online Store > Themes, open the menu on your current theme and choose Edit code. Open theme.liquid, paste the code just before the closing body tag and save." },
        { title: "Check it", text: "Open your store in a private window and ask the assistant about delivery or returns." },
      ],
      points: [
        { title: "Fewer abandoned visits", text: "Questions are answered while the shopper is still deciding, including at night and on sale days." },
        { title: "Product cards in the chat", text: "Add your products with photos and prices and the assistant shows the relevant ones as cards the shopper can open." },
        { title: "Leads from interested shoppers", text: "When someone wants a quote or a call back, it takes their name and number and saves them to your leads list." },
      ],
      faq: [
        { q: "Is {name} in the Shopify App Store?", a: "Not at the moment. You add it by pasting one line of code into your theme, which takes a couple of minutes and does not need an app." },
        { q: "Does it read my Shopify product catalogue automatically?", a: "It reads the public pages of your store when you add your website address. Product cards with photos and prices are added in your {name} account; an automatic sync with the Shopify catalogue is not available yet." },
        { q: "Can it take orders or process payments?", a: "No. It answers questions and captures contact details. Checkout stays in Shopify." },
      ],
    },
    wix: {
      name: "Wix",
      short: "Add the widget through Wix's custom code setting.",
      meta: {
        title: "AI chatbot for Wix websites: setup in a few steps",
        description: "How to add the {name} AI chatbot to a Wix website using Custom Code. The assistant answers visitors from your own business information and collects their contact details.",
      },
      h1: "An AI chatbot for your Wix website",
      sub: "Paste one line into Wix's Custom Code setting and your site answers visitors by itself.",
      intro: [
        "Wix sites are often run by one person who is also running the business. {name} takes over the repeated questions, so a visitor gets an answer even when you are with a customer.",
      ],
      steps: [
        { title: "Create your assistant", text: "Sign up and enter your Wix site's address. The assistant reads your pages and learns from them." },
        { title: "Allow your domain", text: "Add your site's domain under Allowed websites on the Widget page." },
        { title: "Copy the embed code", text: "Copy the one-line script tag from the Widget page." },
        { title: "Add it as custom code", text: "In your Wix dashboard open Settings > Custom Code and choose Add Custom Code. Paste the script, apply it to all pages, and place it at the end of the body. Wix offers custom code on premium plans with a connected domain." },
        { title: "Publish and check", text: "Publish the site, open it in a private window and ask the assistant a question." },
      ],
      points: [
        { title: "No Wix app needed", text: "It is your own widget, styled with your colour and logo, not a generic chat app." },
        { title: "Reads a site drawn by JavaScript", text: "Wix pages are built in the browser. The assistant uses a page reader that opens them the way a visitor's browser does." },
        { title: "Works on phones", text: "On a phone the chat opens as a sheet over the lower part of the page instead of covering the whole screen." },
      ],
      faq: [
        { q: "Do I need a paid Wix plan?", a: "Wix makes its Custom Code setting available on premium plans with a connected domain. Check your plan in the Wix dashboard." },
        { q: "The widget does not appear. What should I check?", a: "First, that your site's exact domain is listed under Allowed websites. Second, that the custom code is applied to all pages and the site has been published since you added it." },
        { q: "Can the assistant read my Wix site?", a: "Yes. Enter your site's address in the knowledge base and it reads the pages. If a page gives very little text, add the information as a file, FAQs or notes." },
      ],
    },
    webflow: {
      name: "Webflow",
      short: "Paste the code into your site's footer code setting.",
      meta: {
        title: "AI chatbot for Webflow sites: add it in the footer code",
        description: "How to add the {name} AI chatbot to a Webflow site. Paste one line into the site's custom code footer, publish, and the assistant answers visitors from your own content.",
      },
      h1: "An AI chatbot for your Webflow site",
      sub: "A widget that matches your design, added through Webflow's custom code setting.",
      intro: [
        "Webflow sites are carefully designed, and a generic chat bubble can look out of place. {name}'s widget takes your brand colour and logo, and runs in its own frame so it never interferes with your layout or interactions.",
      ],
      steps: [
        { title: "Create your assistant", text: "Sign up and enter your site's address so the assistant can read your pages." },
        { title: "Allow your domain", text: "Add your published domain under Allowed websites on the Widget page. Add your webflow.io staging address as well if you want to test there." },
        { title: "Copy the embed code", text: "Copy the one-line script tag from the Widget page." },
        { title: "Paste it into the footer code", text: "In Webflow open Site settings > Custom code and paste the script into the Footer code box, which places it before the closing body tag. Custom code is available on paid Webflow plans." },
        { title: "Publish and check", text: "Publish the site and open it in a private window." },
      ],
      points: [
        { title: "Your design stays intact", text: "The chat lives in an isolated frame. Your CSS cannot change it and it cannot change your page." },
        { title: "Styled to your brand", text: "Choose the colour, logo, position and greeting in your account and see them in a live preview." },
        { title: "Answers in the visitor's language", text: "It replies in the language the visitor writes in, including right-to-left languages." },
      ],
      faq: [
        { q: "Can I add it to one page only?", a: "Yes. Instead of the site-wide footer code, paste the script into the custom code setting of a single page." },
        { q: "Does it work on the webflow.io staging domain?", a: "Yes, if you add that address under Allowed websites. The widget only loads on domains you have approved." },
        { q: "Will it affect my Webflow interactions or page speed?", a: "The loader script is tiny and loads asynchronously, and the chat runs in its own frame, so it does not interfere with interactions or block rendering." },
      ],
    },
    squarespace: {
      name: "Squarespace",
      short: "Add the widget with Squarespace's code injection.",
      meta: {
        title: "AI chatbot for Squarespace websites: add it with code injection",
        description: "How to add the {name} AI chatbot to a Squarespace website using Code Injection. The assistant answers visitors from your own information and saves their contact details as leads.",
      },
      h1: "An AI chatbot for your Squarespace site",
      sub: "One line in Code Injection, and your site answers enquiries while you work.",
      intro: [
        "Squarespace is popular with studios, salons, restaurants and consultants: businesses where the owner is usually busy with a client. {name} answers the routine questions and collects booking requests for you to confirm.",
      ],
      steps: [
        { title: "Create your assistant", text: "Sign up and enter your Squarespace site's address. Add your price list or service menu as a file if it is not on the site." },
        { title: "Allow your domain", text: "Add your site's domain under Allowed websites on the Widget page." },
        { title: "Copy the embed code", text: "Copy the one-line script tag from the Widget page." },
        { title: "Paste it into Code Injection", text: "In Squarespace open the Code Injection setting (under Settings > Advanced, or Website Tools on newer accounts) and paste the script into the Footer box. Code injection is included in Squarespace's higher plans." },
        { title: "Save and check", text: "Save, open your site in a private window and ask the assistant a question." },
      ],
      points: [
        { title: "Bookings to confirm", text: "When a visitor wants an appointment, it takes their name and number and you get an email." },
        { title: "Your price list, quoted accurately", text: "Upload your services and prices once. It quotes them as written and never invents one." },
        { title: "A person when needed", text: "Visitors can ask for a human at any time, and you can take over a chat with one click." },
      ],
      faq: [
        { q: "Which Squarespace plans support this?", a: "Squarespace includes code injection in its higher plans. If you do not see the setting, check which plan your site is on." },
        { q: "Where exactly is Code Injection?", a: "Squarespace has moved it between menus over time. Look under Settings > Advanced, or under Website > Website Tools on newer accounts." },
        { q: "Can it replace my contact form?", a: "It can work alongside it. Many visitors prefer to ask a quick question in chat, and the assistant saves their contact details the same way a form would." },
      ],
    },
  },

  useCases: {
    "lead-generation": {
      name: "Lead generation",
      short: "Turn website visitors into names and numbers you can call.",
      meta: {
        title: "AI chatbot for lead generation: capture website visitors automatically",
        description: "Use {name} to capture leads from your website. The AI assistant answers a visitor's questions, asks for their name and phone number when they are ready, and saves them to a leads list.",
      },
      h1: "Turn website visitors into leads, automatically",
      sub: "Most visitors leave without filling in a form. An assistant that answers their question first is far more likely to get their details.",
      intro: [
        "A contact form asks the visitor to do the work. A conversation does the opposite: it helps first, and asks for a name and number at the moment the visitor wants something, such as a quote, a booking or a call back.",
      ],
      points: [
        { title: "Asks at the right moment", text: "When a visitor shows they want to book or buy, the assistant asks for their name and phone number. It does not interrupt people who are only browsing." },
        { title: "Every lead saved with its conversation", text: "Leads go into a list with a link to the chat, so you know what the person asked before you call." },
        { title: "Told straight away", text: "You get an email for each new lead, and can mark each one as new, contacted or converted." },
        { title: "What they were interested in", text: "If the visitor opened one of your products or services in the chat, the lead records which one." },
        { title: "Export any time", text: "Download your leads as a CSV file for your CRM or spreadsheet." },
      ],
      faq: [
        { q: "Can I require a name and phone number before the chat starts?", a: "Yes. There is an optional pre-chat form. Turn it on and every visitor who starts a chat becomes a lead." },
        { q: "Does it send leads to my CRM?", a: "Leads can be exported as a CSV file. A direct connection to CRMs is not available yet." },
        { q: "Will it ask everyone for their details?", a: "No. It asks when a visitor shows buying intent, such as wanting a quote, a booking or a call back, or when it cannot answer and offers to have your team get in touch." },
      ],
    },
    "customer-support": {
      name: "Customer support automation",
      short: "Answer the repeated questions without adding staff.",
      meta: {
        title: "Automate customer support with an AI assistant trained on your business",
        description: "Use {name} to answer repeated customer questions automatically. The AI assistant replies from your own information, flags chats it cannot answer, and lets your team take over.",
      },
      h1: "Answer the repeated questions without adding staff",
      sub: "Prices, opening hours, policies, directions. The assistant handles them instantly and your team handles the rest.",
      intro: [
        "In most small businesses the same dozen questions make up the bulk of enquiries. They are easy to answer and expensive to keep answering by hand. {name} takes them, using only the information you provide, and passes on anything it should not handle.",
      ],
      points: [
        { title: "Answers only from your information", text: "It replies from your website, files, FAQs and notes. If the answer is not there it says so and offers to connect the customer with your team." },
        { title: "Knows when to hand over", text: "Chats it cannot answer, and customers who ask for a person, are flagged in your inbox and your team is emailed." },
        { title: "One-click takeover", text: "Any team member can step into a conversation. The assistant goes quiet until the chat is handed back." },
        { title: "Shows you the gaps", text: "A list of the questions it could not answer, each with a button to add the missing answer." },
        { title: "A shared inbox", text: "Every conversation in one live list, with filters and search." },
      ],
      faq: [
        { q: "Will it invent answers?", a: "It is built not to. It answers only from the information you provide, and when the answer is missing it tells the customer and offers a person instead." },
        { q: "How does my team know a chat needs them?", a: "The chat is marked as needing a human in the inbox and an email is sent to the addresses you choose." },
        { q: "Can it replace my support team?", a: "It replaces the repetitive part of the work. Complaints, unusual requests and anything sensitive still go to your people, with the conversation so far attached." },
      ],
    },
    "multilingual-support": {
      name: "Multilingual support",
      short: "Reply to every customer in the language they write in.",
      meta: {
        title: "Multilingual AI chatbot: answer customers in their own language",
        description: "{name} replies in the language each customer writes in, including Arabic, Spanish, French, German, Hindi, Urdu and Russian, from information you provide in one language.",
      },
      h1: "Reply to every customer in their own language",
      sub: "Write your information once. The assistant answers in whatever language the customer uses.",
      intro: [
        "If your customers speak more than one language, someone on your team usually ends up translating the same answers over and over. {name} does that automatically: it reads the customer's message, answers in the same language, and takes the facts from the information you gave it, whatever language that is in.",
      ],
      points: [
        { title: "Follows the customer's language", text: "An English question gets an English answer; the next customer's Arabic or Spanish question gets a reply in that language." },
        { title: "Right-to-left when needed", text: "The chat window switches layout for languages such as Arabic and Urdu." },
        { title: "One knowledge base", text: "Your prices and policies can be written in one language. The assistant translates the facts when it answers." },
        { title: "Dialects and mixed messages", text: "It handles regional dialects and messages that mix two languages, which is how many people actually write." },
        { title: "Your team reads the same chat", text: "When a person takes over, they see the whole conversation as the customer wrote it." },
      ],
      faq: [
        { q: "Which languages does it support?", a: "It replies in the language the customer writes in: English, Arabic, Spanish, French, German, Hindi, Urdu, Russian and many others. The chat window's own buttons are translated into a growing list of languages." },
        { q: "Do I need to translate my website or price list?", a: "No. Provide your information in the language you have it in. The assistant answers customers in theirs." },
        { q: "How accurate are answers in other languages?", a: "The facts come from your information, so prices and policies stay the same in every language. As with any translation, review a few conversations in the languages that matter most to you." },
      ],
    },
    "after-hours-support": {
      name: "After-hours support",
      short: "Answer and capture enquiries when you are closed.",
      meta: {
        title: "After-hours customer support with an AI assistant",
        description: "Use {name} to answer website visitors when your business is closed. The assistant replies at any hour, takes booking requests and contact details, and has them ready for your team in the morning.",
      },
      h1: "Stay open on your website when your doors are closed",
      sub: "People look for services in the evening and at weekends. The assistant answers them then, and your team follows up the next day.",
      intro: [
        "An enquiry sent at 10 pm usually goes to whichever business replies first. With {name} that reply is immediate: the visitor gets their answer, and if they want to go further, the assistant takes their details so nothing is lost overnight.",
      ],
      points: [
        { title: "Answers at any hour", text: "The assistant never closes. It knows your opening hours and tells customers when your team is next available." },
        { title: "Requests waiting for you", text: "Booking and quote requests are saved as leads with the conversation, ready when you open." },
        { title: "Honest about what it is", text: "When a customer asks for a person outside working hours, it says a team member will reply and takes their contact details." },
        { title: "First reply wins", text: "Customers often ask several businesses at once. Answering instantly puts you ahead of those who reply the next morning." },
      ],
      faq: [
        { q: "Does it know my opening hours?", a: "Yes. You set your working hours in your account and the assistant uses them when customers ask." },
        { q: "What happens to a chat that needs a person at night?", a: "It is flagged in your inbox and an email is sent, so your team sees it first thing. The customer is told someone will get back to them." },
        { q: "Can it confirm bookings by itself?", a: "It collects the request and the customer's details for you to confirm. Booking directly into a calendar is not available yet." },
      ],
    },
  },

  guides: {
    "add-ai-chatbot-to-website": {
      name: "How to add an AI chatbot to your website",
      short: "The four steps, and what to check before you go live.",
      meta: {
        title: "How to add an AI chatbot to your website (step by step)",
        description: "A plain guide to adding an AI chatbot to a business website: give it your information, test its answers, paste one line of code, and check it on your phone. No developer needed.",
      },
      h1: "How to add an AI chatbot to your website",
      sub: "You do not need a developer. You need your business information, about fifteen minutes, and access to your website's settings.",
      intro: ["Adding an AI chatbot used to mean writing conversation scripts. Today it means giving an assistant your information and letting it answer in its own words. Here is the whole process."],
      sections: [
        { h: "1. Gather what customers ask about", p: ["Start with what you already have: your website, a price list, a service menu, your returns or cancellation policy, your opening hours. These are the things customers ask about most.", "Anything that lives only in your head, such as which areas you deliver to or whether you take walk-ins, is worth writing down as a short note."] },
        { h: "2. Give it to the assistant", p: ["In {name} you enter your website address and the assistant reads the pages. You can also upload PDF, Word and text files, add question-and-answer pairs, and type free-form notes.", "The assistant answers only from this material. That is what keeps it accurate: it cannot quote a price you never gave it."] },
        { h: "3. Test it like a customer would", p: ["Before it goes on your site, ask it the questions your customers ask, including awkward ones. Check that the prices and policies are right.", "When it says it does not know something it should know, add that information and ask again."] },
        { h: "4. Paste one line of code", p: ["The chat widget is a single script tag. You paste it before the closing body tag of your site, or into the custom code setting of your website builder. We have step-by-step pages for WordPress, Shopify, Wix, Webflow and Squarespace.", "You also list the domains the widget is allowed to appear on, so nobody else can put your assistant on their site."] },
        { h: "5. Check it on your phone", p: ["Most visitors will use the chat on a phone. Open your site on yours, ask a question, and make sure the chat is easy to open, read and close."] },
        { h: "After it is live", p: ["Look at the questions it could not answer once a week for the first month and add the missing information. Most businesses find the list gets short quickly."] },
      ],
      faq: [
        { q: "Do I need to know how to code?", a: "No. You copy one line and paste it into a settings box in your website builder, or send it to whoever maintains your site." },
        { q: "How long does it take?", a: "The assistant reads a typical small-business site in a few minutes. Testing its answers and pasting the code usually takes about fifteen minutes more." },
        { q: "What if my website has very little text?", a: "Upload your price list or service menu as a file, and add a few FAQs. The assistant does not need the information to be on the website." },
      ],
    },
    "train-chatbot-on-your-content": {
      name: "How to train an AI chatbot on your own content",
      short: "What to give it, what to leave out, and how to keep it accurate.",
      meta: {
        title: "How to train an AI chatbot on your own business content",
        description: "How an AI chatbot learns from your website, files and FAQs, what information to give it for accurate answers, common mistakes, and how to keep it up to date.",
      },
      h1: "How to train an AI chatbot on your own content",
      sub: "\"Training\" here does not mean anything technical. It means choosing what the assistant is allowed to answer from.",
      intro: ["A general AI model knows a great deal about the world and nothing about your business. An assistant that is useful to your customers works the other way round: it answers from your information and nothing else. The quality of its answers depends almost entirely on what you give it."],
      sections: [
        { h: "How it uses your content", p: ["When a customer asks a question, the assistant looks through your material for the passages that relate to it, and writes its answer from those passages. This approach is often called retrieval-augmented generation.", "The practical consequence: if a fact is not in your material, the assistant should say it does not know, and a well-built one does."] },
        { h: "What to give it", p: ["Prices and what they include. Opening hours, including holidays. Location, parking and how to get there. How to book, order or get a quote. Delivery, returns, cancellation and payment policies. The questions you are tired of answering.", "Write the way you would explain it to a customer. Short, plain sentences work better than marketing copy."] },
        { h: "What to leave out", p: ["Anything out of date, such as last year's price list. Internal notes customers should not see. Long documents where one page matters: upload that page.", "If two sources disagree, the assistant cannot know which is right. Remove the old one."] },
        { h: "Common mistakes", p: ["Relying only on the website. Many business sites say little about prices or policies, so the assistant has nothing to answer from. Add a price list and a few FAQs.", "Forgetting to update it. When your prices or hours change, update the source and re-read it."] },
        { h: "Keeping it accurate", p: ["Check the list of questions the assistant could not answer. Each one is a gap in your information. In {name} every unanswered question has a button that opens the FAQ form with the question filled in.", "Read a handful of real conversations now and then. You will quickly see where a clearer sentence in your notes would help."] },
      ],
      faq: [
        { q: "Is my content used to train a public AI model?", a: "Your content is used to answer your own customers. One business's information is never used to answer another business's customers." },
        { q: "How much content does it need?", a: "Less than most people expect. A price list, your hours and policies, and ten to twenty FAQs cover the majority of questions for a small business." },
        { q: "What file types can I upload?", a: "PDF, Word and plain text files, as well as website pages, question-and-answer pairs and free-form notes." },
      ],
    },
    "ai-chatbot-vs-live-chat": {
      name: "AI chatbot vs live chat",
      short: "What each is good at, and why most businesses end up using both.",
      meta: {
        title: "AI chatbot vs live chat: which does a small business need?",
        description: "A practical comparison of AI chatbots and live chat for small businesses: response time, cost, accuracy and when a person is needed. Most businesses are best served by both together.",
      },
      h1: "AI chatbot vs live chat: which do you need?",
      sub: "They are not rivals. One answers instantly and never gets tired; the other handles what a machine should not.",
      intro: ["Live chat puts a person on your website. An AI chatbot puts an assistant there. For a small business the real question is who answers at 9 pm, and who answers the tenth person asking about parking today."],
      sections: [
        { h: "What live chat does well", p: ["A person can deal with a complaint, bend a rule, read between the lines, and close a sale that needs persuasion. Customers with a complicated or emotional problem want a human.", "The cost is that someone has to be there. Unanswered live chat is worse than none: the visitor waits, then leaves."] },
        { h: "What an AI chatbot does well", p: ["It answers in seconds at any hour, in the customer's language, and gives the same correct answer the hundredth time. It handles many conversations at once.", "It is at its best with factual questions: prices, hours, policies, availability, how to book."] },
        { h: "Where an AI chatbot falls short", p: ["It only knows what you told it. It should not make judgement calls, give medical or legal advice, or handle an upset customer on its own.", "A good one recognises these moments and passes the conversation to a person."] },
        { h: "Using both together", p: ["The practical setup is an assistant that answers first and a team that steps in when needed. Routine questions never reach your staff; difficult ones reach them with the conversation so far.", "This is how {name} works: the assistant flags chats it cannot answer and customers who ask for a person, and any team member can take over with one click. The assistant stays silent until the chat is handed back."] },
        { h: "How to decide", p: ["If most of your enquiries are repeated factual questions, start with an AI assistant. If your sales depend on long, consultative conversations, keep people in the chat and let the assistant cover the hours and the questions they should not have to."] },
      ],
      faq: [
        { q: "Can customers still reach a person?", a: "Yes. A \"Talk to a human\" button is always available, and the assistant offers a person when it cannot answer." },
        { q: "Is an AI chatbot cheaper than live chat?", a: "The software cost is usually similar; the difference is staff time. An assistant answers routine questions without anyone being on duty." },
        { q: "Will customers mind talking to an AI?", a: "Most people care about getting a correct answer quickly. Problems arise when a bot blocks them from reaching a person, which is why handover matters." },
      ],
    },
    "chatbot-lead-capture": {
      name: "How to capture leads with a website chatbot",
      short: "Why chat converts better than a form, and how to set it up well.",
      meta: {
        title: "How to capture more leads with a website chatbot",
        description: "Why a chatbot captures more leads than a contact form, when to ask for contact details, what to ask for, and how to follow up. Practical advice for small businesses.",
      },
      h1: "How to capture leads with a website chatbot",
      sub: "A form asks for details before giving anything. A chat answers first, and that changes how many people leave their number.",
      intro: ["Visitors arrive with a question. If the page does not answer it and the only option is a form, most leave. A chatbot gives them the answer straight away and can then ask, naturally, whether they would like a call or a booking."],
      sections: [
        { h: "Answer first, ask second", p: ["The most reliable way to get someone's details is to be useful first. When the assistant has just told a visitor the price and availability they asked about, \"shall I have someone confirm a time with you?\" is a natural next step."] },
        { h: "Ask for little", p: ["A name and a phone number are enough to follow up. Every extra field loses people. You can ask the rest when you call."] },
        { h: "Ask at the right moment", p: ["Asking every visitor for their details straight away puts people off. Ask when they show intent: they want to book, get a quote, check availability or be called back.", "In {name} this is the default. The assistant asks for a name and phone number when a visitor shows buying intent, and there is an optional form before the chat for businesses that want details from everyone."] },
        { h: "Keep the context", p: ["A lead is worth more when you know what the person wanted. Save the conversation with the lead, so whoever calls back can open with the answer instead of starting again."] },
        { h: "Follow up quickly", p: ["A lead goes cold in hours. Get notified as each one arrives, and track which have been contacted. A simple list with new, contacted and converted is enough for most small businesses."] },
      ],
      faq: [
        { q: "Should I use a pre-chat form?", a: "Only if every enquiry is valuable enough to justify losing some visitors. For most businesses, letting people ask freely and capturing details when they show intent brings in more leads overall." },
        { q: "What contact details should the chatbot ask for?", a: "A name and a phone number, or an email address if your customers prefer it. Ask for anything else when you follow up." },
        { q: "How do I get the leads out?", a: "In {name} leads are listed in your dashboard with their conversations, you are emailed for each new one, and you can export the list as a CSV file." },
      ],
    },
  },
};
