import type { TopicPage } from "../types";
import type { NewIntegration } from "./slugs";

/**
 * Setup pages for more website builders. Same rule as topics-en.ts: every step describes what
 * the platform and the product actually do today. Step 3 is where the page shows the embed code.
 */
export const integrationsMoreEn: Record<NewIntegration, TopicPage> = {
  woocommerce: {
    name: "WooCommerce",
    short: "Answer shoppers on your WooCommerce store, product pages included.",
    meta: {
      title: "AI chatbot for WooCommerce: answer shoppers automatically",
      description: "Add the {name} AI chatbot to a WooCommerce store with one line of code. It answers delivery, returns and product questions from your own store content.",
    },
    h1: "An AI chatbot for your WooCommerce store",
    sub: "WooCommerce runs on WordPress, so adding the assistant takes one snippet. It answers shoppers on every page, from the home page to checkout.",
    intro: [
      "Shoppers on a WooCommerce store ask the same few things before they buy: how long delivery takes, what it costs, whether they can return an item, whether a product suits what they need. {name} answers those questions from your store pages, your policies and the notes you add.",
      "Because WooCommerce is a WordPress plugin, the widget goes in exactly the way it does on any WordPress site: one script tag in the site-wide footer. There is no extra plugin to install or keep updated.",
    ],
    steps: [
      { title: "Create your assistant", text: "Sign up and enter your store's address so the assistant can read your pages. Upload your shipping and returns policy as a file or note if it is not written on the site." },
      { title: "Allow your domain", text: "On the Widget page, add your store's domain under Allowed websites. The chat only appears on the sites you list." },
      { title: "Copy the embed code", text: "Copy the one-line script tag from the same page." },
      { title: "Add it to the footer", text: "Install a header-and-footer code plugin such as WPCode, add a new snippet, paste the code and set it to load in the site-wide footer. Alternatively, paste it just before the closing body tag in your theme's footer.php." },
      { title: "Test a shopper's question", text: "Open a product page in a private window and ask about delivery to your city or how returns work." },
    ],
    points: [
      { title: "Product cards in the chat", text: "Add your best-selling products with a photo, price and link in your account, and the assistant shows the relevant ones as cards the shopper can open." },
      { title: "Checkout stays in WooCommerce", text: "The assistant answers and recommends; orders and payments go through your normal checkout, untouched." },
      { title: "Buyers become leads", text: "When someone wants a quote, a bulk order or a call back, it takes their name and number and saves them to your leads list." },
    ],
    faq: [
      { q: "Do I need a WooCommerce plugin for {name}?", a: "No. The widget is one line of code added to your site's footer, the same way on any WordPress or WooCommerce site." },
      { q: "Does it read my product catalogue automatically?", a: "It reads the public pages of your store when you add your website address, up to your plan's page limit. Product cards with photos and prices are added in your {name} account; an automatic catalogue sync is not available yet." },
      { q: "Can it look up a customer's order status?", a: "No. It does not connect to your orders. It can explain your delivery times and how to track an order if that information is on your site or in your notes." },
    ],
  },

  joomla: {
    name: "Joomla",
    short: "Add the assistant to a Joomla site through your template.",
    meta: {
      title: "AI chatbot for Joomla: add it to your site in minutes",
      description: "How to add the {name} AI chatbot to a Joomla website: paste one line of code into your template or a custom code module, and it answers visitors from your content.",
    },
    h1: "An AI chatbot for your Joomla website",
    sub: "Joomla sites often hold years of useful information. The assistant reads it and answers visitors' questions in seconds, in their own language.",
    intro: [
      "Many Joomla sites belong to organisations with a lot of content: services, opening times, fees, policies, downloadable documents. Visitors rarely find the one line they need. {name} reads your pages and files and answers them directly.",
      "The widget is a single script tag, so it works with any Joomla version and template. You add it once and it appears on every page.",
    ],
    steps: [
      { title: "Create your assistant", text: "Sign up and enter your website address. Upload important PDFs, such as a fee schedule or a brochure, so the assistant can answer from them too." },
      { title: "Allow your domain", text: "Add your site's domain under Allowed websites on the Widget page." },
      { title: "Copy the embed code", text: "Copy the one-line script tag." },
      { title: "Add it to your template", text: "In the Joomla administrator, open System > Site Templates, choose your template (ideally a child template, so updates do not overwrite your change) and edit index.php. Paste the code just before the closing body tag and save. A custom-code or header-and-footer extension works too if you prefer not to edit files." },
      { title: "Check it", text: "Open the site in a private window, click the chat button and ask a question a visitor would ask." },
    ],
    points: [
      { title: "Works with any template", text: "The chat runs in its own frame, so your template's styles cannot break it and it cannot break them." },
      { title: "Answers from your documents", text: "PDF, Word and text files can be added alongside your pages, so answers buried in downloads become easy to find." },
      { title: "A person when needed", text: "Visitors can ask for a human at any time. The chat is flagged in your inbox and your team is emailed." },
    ],
    faq: [
      { q: "Is there a Joomla extension for {name}?", a: "Not a dedicated one, and you do not need it. One line of code in your template, or in a general custom-code extension, is enough." },
      { q: "Will a template update remove the code?", a: "It can if you edit the main template directly. Use a child template or a custom-code extension and the code survives updates." },
      { q: "Does it work on multilingual Joomla sites?", a: "Yes. The assistant replies in the language each visitor writes in, whatever languages your site is published in." },
    ],
  },

  drupal: {
    name: "Drupal",
    short: "Add the assistant to a Drupal theme or with a footer-scripts module.",
    meta: {
      title: "AI chatbot for Drupal: add an AI assistant to your site",
      description: "How to add the {name} AI chatbot to a Drupal website with one line of code in your theme or a scripts module. It answers visitors from your own content.",
    },
    h1: "An AI chatbot for your Drupal website",
    sub: "Drupal sites tend to be large and well structured. The assistant turns that content into instant answers for visitors who do not want to search.",
    intro: [
      "Universities, associations, clinics and companies use Drupal for sites with hundreds of pages. That depth is valuable, but visitors with a simple question often give up before they find the answer. {name} reads your pages and answers in plain language.",
      "You add the widget once, either in your theme's template or with a module that injects scripts into the footer, and it loads on every page.",
    ],
    steps: [
      { title: "Create your assistant", text: "Sign up and add your website address. Focus on the sections visitors ask about most; you can add files and notes for anything else." },
      { title: "Allow your domain", text: "Add your site's domain under Allowed websites on the Widget page." },
      { title: "Copy the embed code", text: "Copy the one-line script tag." },
      { title: "Add it to Drupal", text: "Either paste the code just before the closing body tag in your theme's html.html.twig template (in a sub-theme, so core theme updates do not remove it), or install a module that adds scripts to the page footer and paste it there. Clear Drupal's cache afterwards." },
      { title: "Check it", text: "Open a page in a private window and ask a question a visitor would ask." },
    ],
    points: [
      { title: "No custom module to maintain", text: "There is nothing to keep compatible with each Drupal release: the script loads the current widget by itself." },
      { title: "Keeps its distance from your theme", text: "The chat runs in a separate frame and the loader is under one kilobyte." },
      { title: "Shows you what people ask", text: "Your dashboard lists the most asked questions and the ones the assistant could not answer, which is useful input for your content team." },
    ],
    faq: [
      { q: "Which Drupal versions does it work with?", a: "Any version that lets you add a script tag to your pages. The widget does not depend on Drupal itself." },
      { q: "Do I need to clear the cache after adding it?", a: "Yes. Drupal caches rendered pages, so clear the cache once and the widget appears for every visitor." },
      { q: "Can it answer from pages behind a login?", a: "No. It reads public pages. For private information, upload a file or write a note, and only add what you are happy for any visitor to be told." },
    ],
  },

  framer: {
    name: "Framer",
    short: "Paste one line into Framer's custom code settings.",
    meta: {
      title: "AI chatbot for Framer sites: add it in two minutes",
      description: "How to add the {name} AI chatbot to a Framer website: paste one line into Site Settings > Custom Code and it answers visitors from your own content.",
    },
    h1: "An AI chatbot for your Framer website",
    sub: "Framer makes beautiful sites quickly. The assistant makes sure visitors who arrive with a question get an answer just as quickly.",
    intro: [
      "Framer sites are often the front door of a new business, an agency or a product launch, and visitors arrive with practical questions: what does it cost, how does it work, can I book a call. {name} answers from your pages and notes and collects contact details from people who are ready to talk.",
      "Framer has a built-in place for site-wide code, so you add the widget once and publish.",
    ],
    steps: [
      { title: "Create your assistant", text: "Sign up, enter your site's address, and add notes for anything that is not on the pages yet, such as pricing details or your service area." },
      { title: "Allow your domain", text: "Add your custom domain under Allowed websites on the Widget page. If you also share the framer.website address, add that too." },
      { title: "Copy the embed code", text: "Copy the one-line script tag." },
      { title: "Paste it into Framer", text: "In your Framer project open Site Settings, then the Custom Code section, and paste the code into the field for the end of the body tag. Publish the site." },
      { title: "Check it", text: "Open the published site, not the editor preview, and ask the assistant a question." },
    ],
    points: [
      { title: "Matches your design", text: "Choose your brand colour, logo, position and greeting so the widget fits the site you designed." },
      { title: "Turns visitors into leads", text: "When someone wants a quote or a call, it takes their name and number and emails you." },
      { title: "Light and fast", text: "The script loads asynchronously and the chat runs in its own frame, so your animations stay smooth." },
    ],
    faq: [
      { q: "Does it work on Framer's free plan?", a: "Custom code is a feature of Framer's site plans. If your plan includes custom code, the widget works." },
      { q: "Why don't I see the chat in the Framer editor?", a: "Custom code runs on the published site. Publish and open the live address to see it." },
      { q: "Can I change the widget's look later?", a: "Yes. Colour, logo, greeting and position are set in your {name} account and update on your site without republishing." },
    ],
  },

  bigcommerce: {
    name: "BigCommerce",
    short: "Add the assistant through BigCommerce's Script Manager.",
    meta: {
      title: "AI chatbot for BigCommerce stores: answer shoppers 24/7",
      description: "How to add the {name} AI chatbot to BigCommerce with the Script Manager. It answers questions on products, delivery and returns from your store content.",
    },
    h1: "An AI chatbot for your BigCommerce store",
    sub: "BigCommerce's Script Manager lets you add the assistant without touching your theme files. Shoppers get answers before they leave.",
    intro: [
      "A shopper with an unanswered question about delivery, sizing or returns is a shopper who leaves. {name} answers those questions instantly, using your store's pages and the policies you give it, in the shopper's own language.",
      "BigCommerce has a Script Manager made for exactly this, so there is no theme editing and the code survives theme changes.",
    ],
    steps: [
      { title: "Create your assistant", text: "Sign up, enter your store's address, and upload your shipping, returns and warranty policies if they are not on the site." },
      { title: "Allow your domain", text: "Add your store domain under Allowed websites on the Widget page." },
      { title: "Copy the embed code", text: "Copy the one-line script tag." },
      { title: "Add it in Script Manager", text: "In the BigCommerce control panel go to Storefront > Script Manager and create a script. Choose the footer as the location, all pages, and the script type that lets you paste a script tag, then paste the code and save." },
      { title: "Check it", text: "Open your storefront in a private window and ask about delivery or returns." },
    ],
    points: [
      { title: "No theme edits", text: "Script Manager keeps the code separate from your theme, so switching or updating themes does not remove it." },
      { title: "Product cards", text: "Add products with photos and prices in your account and the assistant shows the relevant ones as cards." },
      { title: "Sale-day ready", text: "When traffic spikes, repeated questions are answered automatically instead of piling up." },
    ],
    faq: [
      { q: "Will it work on checkout pages?", a: "Script Manager lets you choose which pages a script runs on. Store pages are where most questions are asked; whether to include checkout is up to you." },
      { q: "Does it sync with my BigCommerce catalogue?", a: "Not automatically. It reads your public store pages, and you can add product cards in your {name} account." },
      { q: "Can it process returns or refunds?", a: "No. It explains your returns policy and, when a customer needs help with a specific order, flags the chat for your team." },
    ],
  },

  ghost: {
    name: "Ghost",
    short: "Add the assistant with Ghost's Code Injection.",
    meta: {
      title: "AI chatbot for Ghost: answer readers and members automatically",
      description: "How to add the {name} AI chatbot to a Ghost site with Code Injection. It answers questions about your publication, memberships and services from your content.",
    },
    h1: "An AI chatbot for your Ghost site",
    sub: "Readers ask about membership, newsletters and your services. The assistant answers from your own posts and pages, any time of day.",
    intro: [
      "Ghost powers publications, newsletters and creator businesses. Alongside your articles, readers have practical questions: what membership includes, how to change a subscription, whether you offer consulting or sponsorships. {name} answers them from your pages and the notes you add.",
      "Ghost has a site-wide Code Injection setting, so the widget is a single paste.",
    ],
    steps: [
      { title: "Create your assistant", text: "Sign up and enter your site's address. Add a note covering your membership tiers and how to contact you for anything else." },
      { title: "Allow your domain", text: "Add your site's domain under Allowed websites on the Widget page." },
      { title: "Copy the embed code", text: "Copy the one-line script tag." },
      { title: "Paste it into Code Injection", text: "In Ghost Admin open Settings, find Code Injection, and paste the code into the Site footer field. Save." },
      { title: "Check it", text: "Open your site in a private window and ask what a paid membership includes." },
    ],
    points: [
      { title: "Answers from your writing", text: "The assistant uses your public posts and pages, so it can point readers to what you have already published." },
      { title: "Sponsorship and service leads", text: "When someone asks about advertising, consulting or partnerships, it takes their details for you." },
      { title: "Readers in any language", text: "International readers get replies in the language they write in." },
    ],
    faq: [
      { q: "Does it read members-only posts?", a: "No. It reads public pages only. Add notes for anything you want it to be able to explain." },
      { q: "Can it manage subscriptions?", a: "No. It explains how membership works and where to manage it, based on the information you give it." },
      { q: "Does it slow down my site?", a: "The loader is under one kilobyte and loads asynchronously; the chat itself runs in a separate frame." },
    ],
  },

  hubspot: {
    name: "HubSpot CMS",
    short: "Add the assistant to HubSpot pages with site footer HTML.",
    meta: {
      title: "AI chatbot for HubSpot CMS websites: add it with one line",
      description: "How to add the {name} AI chatbot to a HubSpot-hosted website using the site footer HTML setting. It answers visitors from your own content.",
    },
    h1: "An AI chatbot for your HubSpot website",
    sub: "If your website is hosted on HubSpot, you can add the assistant to every page from your website settings.",
    intro: [
      "Websites built on HubSpot's content hub are usually there to generate enquiries. {name} helps by answering visitors' questions straight away and asking for contact details when they are interested.",
      "HubSpot lets you add HTML to the footer of all your pages from your website settings, which is where the widget goes.",
    ],
    steps: [
      { title: "Create your assistant", text: "Sign up and enter your website address so the assistant can read your pages." },
      { title: "Allow your domain", text: "Add each domain your HubSpot pages are published on under Allowed websites on the Widget page." },
      { title: "Copy the embed code", text: "Copy the one-line script tag." },
      { title: "Paste it into HubSpot", text: "In HubSpot open Settings, go to the website pages settings, choose the domain, and paste the code into the site footer HTML field. Save, and it applies to the pages on that domain." },
      { title: "Check it", text: "Open a live page in a private window and ask a question." },
    ],
    points: [
      { title: "Questions answered before the form", text: "Visitors often have one question before they will fill in a form. The assistant answers it on the spot." },
      { title: "Leads you can export", text: "Contact details collected in the chat are saved in your leads list and can be downloaded as a CSV file." },
      { title: "Human takeover", text: "Your team can jump into any conversation from the {name} inbox." },
    ],
    faq: [
      { q: "Does it send leads to HubSpot CRM automatically?", a: "Not yet. Leads are saved in {name} and can be exported as a CSV file, which you can import into HubSpot." },
      { q: "Can I use it alongside HubSpot's own chat?", a: "You can, but two chat buttons confuse visitors. Most businesses choose one." },
      { q: "Does it work on HubSpot landing pages?", a: "Yes, as long as the code is included in the footer HTML for the domain those pages use." },
    ],
  },

  weebly: {
    name: "Weebly",
    short: "Paste one line into Weebly's footer code setting.",
    meta: {
      title: "AI chatbot for Weebly websites: add it in a few minutes",
      description: "How to add the {name} AI chatbot to a Weebly site: paste one line into the footer code in your SEO settings, and it answers visitors from your content.",
    },
    h1: "An AI chatbot for your Weebly website",
    sub: "Weebly sites are simple to run. The assistant keeps them that way, answering visitors' questions while you get on with your work.",
    intro: [
      "Small businesses chose Weebly because it is easy, and many have run the same site for years. Visitors still ask the same questions by phone and email. {name} reads your site and answers them in the chat instead.",
      "Weebly has a footer code field in its settings, so adding the widget is a single paste.",
    ],
    steps: [
      { title: "Create your assistant", text: "Sign up and enter your website address. Add a short note with anything visitors often ask that is not on the site." },
      { title: "Allow your domain", text: "Add your site's domain under Allowed websites on the Widget page." },
      { title: "Copy the embed code", text: "Copy the one-line script tag." },
      { title: "Paste it into Weebly", text: "In the Weebly editor open Settings, then SEO, and paste the code into the Footer Code box. Save and publish the site." },
      { title: "Check it", text: "Open the published site in a private window and ask the assistant a question." },
    ],
    points: [
      { title: "No technical skills needed", text: "If you can copy and paste, you can install it." },
      { title: "Fewer calls and emails", text: "Routine questions are answered in the chat, at any hour." },
      { title: "Details for follow-up", text: "Visitors who want a quote or a call leave their name and number in the chat." },
    ],
    faq: [
      { q: "Does it work with Square Online?", a: "If your Square Online plan lets you add code to your site's footer, yes. The widget only needs one script tag on your pages." },
      { q: "Why doesn't the chat show in the editor?", a: "Footer code runs on the published site. Publish, then open the live address." },
      { q: "Can I hide it on some pages?", a: "The footer code applies to the whole site. If you need it on certain pages only, add it to those pages' own header code instead, where your plan allows." },
    ],
  },

  "google-tag-manager": {
    name: "Google Tag Manager",
    short: "Add the assistant to any site that already uses Google Tag Manager.",
    meta: {
      title: "Add an AI chatbot with Google Tag Manager",
      description: "Install the {name} AI chatbot through Google Tag Manager with a Custom HTML tag on all pages. No changes to your website's code.",
    },
    h1: "Add the AI chatbot with Google Tag Manager",
    sub: "If your site already loads Google Tag Manager, you can add the assistant from there, without touching the website itself.",
    intro: [
      "Google Tag Manager is the easiest route when you, or your marketing team, can publish tags but cannot edit the site's code. The {name} widget is a single script tag, which is exactly what a Custom HTML tag is for.",
      "Once it is published, the assistant appears on every page where your container loads.",
    ],
    steps: [
      { title: "Create your assistant", text: "Sign up and add your website address so the assistant can read your pages." },
      { title: "Allow your domain", text: "Add your site's domain under Allowed websites on the Widget page." },
      { title: "Copy the embed code", text: "Copy the one-line script tag." },
      { title: "Create a Custom HTML tag", text: "In your Tag Manager container create a new tag, choose Custom HTML, paste the code, and set the trigger to All Pages. Use Preview to check it fires, then Submit and publish the container." },
      { title: "Check it", text: "Open your site in a private window. The chat button appears once the container has loaded." },
    ],
    points: [
      { title: "No developer needed", text: "Whoever manages your tags can install, pause or remove the widget." },
      { title: "Choose where it shows", text: "Use a different trigger to show the assistant only on chosen pages, such as your pricing or contact page." },
      { title: "Same security", text: "The widget still only loads on the domains you allowed in your {name} account." },
    ],
    faq: [
      { q: "Will a cookie consent banner block it?", a: "That depends on how your consent settings are configured in Tag Manager. If the tag is held back until consent, the chat appears after the visitor accepts." },
      { q: "Is it slower than pasting the code into the site?", a: "It appears slightly later, after Tag Manager loads, but it does not slow down your page." },
      { q: "Can I show it only on some pages?", a: "Yes. Use a page-path trigger instead of All Pages." },
    ],
  },

  html: {
    name: "Any HTML website",
    short: "Hand-coded, custom or framework sites: paste one script tag.",
    meta: {
      title: "Add an AI chatbot to any HTML or custom website",
      description: "How to add the {name} AI chatbot to a hand-coded or custom-built website: one script tag before the closing body tag. Works with React, Next.js and plain HTML.",
    },
    h1: "Add the AI chatbot to any website",
    sub: "Plain HTML, a static site generator, React, Next.js or a site your developer built. If you can add a script tag, you can add the assistant.",
    intro: [
      "The {name} widget does not depend on any website builder. It is one script tag that loads a small file, which adds a chat button and opens the conversation in its own frame. That is why it works the same way on a hand-written HTML page and on a large custom application.",
      "Paste it once in your shared layout or footer template and it appears on every page.",
    ],
    steps: [
      { title: "Create your assistant", text: "Sign up and enter your website address, then add files, FAQs or notes for anything not on your pages." },
      { title: "Allow your domain", text: "Add each domain the site runs on under Allowed websites, including a staging domain if you want to test there first." },
      { title: "Copy the embed code", text: "Copy the one-line script tag." },
      { title: "Add it to your layout", text: "Paste the tag just before the closing body tag in the template every page shares. In React or Next.js, add it to the root layout as a script that loads after the page; the async attribute keeps it from blocking rendering." },
      { title: "Check it", text: "Deploy, open the site in a private window and ask a question." },
    ],
    points: [
      { title: "Isolated from your code", text: "The chat runs in a separate frame, so your CSS and scripts cannot clash with it." },
      { title: "Tiny loader", text: "The script your pages load is under one kilobyte and does not block the page." },
      { title: "Domain allow-list", text: "Copying your embed code to another site does nothing: the widget only loads on domains you approved." },
    ],
    faq: [
      { q: "Does it work with single-page apps?", a: "Yes. Add the script once in the root of the app; the chat button stays in place as visitors move between views." },
      { q: "Can I test it locally?", a: "Add localhost to your allowed websites and serve the page from a local server. Opening the file directly does not work, because a file has no domain to check." },
      { q: "Is there an API instead of the widget?", a: "The website widget is the supported way to add the assistant today." },
    ],
  },
};
