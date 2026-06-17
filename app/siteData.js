export const siteNav = [
  { label: "E-Liquids", href: "/e-liquids" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Hardware", href: "/hardware" },
  { label: "Coils", href: "/coils" },
  { label: "CBD", href: "/cbd" },
  { label: "Deals", href: "/deals" },
  { label: "Store Finder", href: "/store-finder" },
];

export const footerLinks = [
  { label: "About Us", href: "/about" },
  { label: "Delivery", href: "/delivery" },
  { label: "Returns", href: "/returns" },
  { label: "Loyalty Points", href: "/loyalty" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Safety", href: "/safety" },
];

export const supportLinks = [
  "Live chat weekdays 8am-4pm",
  "Phone support: 01733887900",
  "Email: orders@phoenixeliquid.co.uk",
  "Store complaints: petertuck@phoenixeliquid.co.uk",
];

export const pages = {
  "e-liquids": {
    eyebrow: "E-Liquids",
    title: "UK-made e-liquids for every flavour, strength, and vaping style.",
    description:
      "Browse TPD 10ml bottles, shortfills, nic salts, and nicotine shots with clear guidance for fruit, ice, dessert, tobacco, drinks, sweets, and flavourless profiles.",
    cta: "Start With The Finder",
    ctaHref: "/faq",
    stats: [
      ["102", "10ml products"],
      ["118", "shortfill products"],
      ["61", "nic salt products"],
      ["20mg", "UK legal nicotine maximum"],
    ],
    sections: [
      {
        title: "Choose By Format",
        cards: [
          {
            title: "TPD 10ml",
            text: "Freebase nicotine bottles for familiar throat hit and simple everyday use.",
            meta: "0mg to 20mg options",
          },
          {
            title: "Shortfills",
            text: "50ml and 100ml bottles with room for VG or PG nicotine shots.",
            meta: "Ideal for bigger clouds",
          },
          {
            title: "Nic Salts",
            text: "Smoother high-strength nicotine for pod systems and MTL devices.",
            meta: "Great for switchers",
          },
          {
            title: "Nicotine Shots",
            text: "VG and PG shots to tune shortfills toward DTL or MTL vaping.",
            meta: "Mix to your style",
          },
        ],
      },
      {
        title: "Popular Flavour Paths",
        list: [
          "Fruit: Strawberry Ice, Blue Razz Cherry, Cherry Cola, and bright all-day blends.",
          "Menthol and ice: cooling profiles across fruit and specialist Brain Freeze ranges.",
          "Desserts: custards, pastries, creams, Bake My Day, and smooth bakery blends.",
          "Tobacco: classic profiles for customers transitioning away from cigarettes.",
        ],
      },
    ],
  },
  "new-arrivals": {
    eyebrow: "New Arrivals",
    title: "New flavours and fan favourites with written launch visibility.",
    description:
      "The audit found new flavour banners were visual-only. This page gives product launches urgency, text context, and fast routes into the right category.",
    cta: "View Current Deals",
    ctaHref: "/deals",
    stats: [
      ["58", "Cedar Reserve products"],
      ["24", "Brain Freeze products"],
      ["23", "Bar Wars products"],
      ["21", "FiftyFifty Smooth products"],
    ],
    sections: [
      {
        title: "Featured Drops",
        cards: [
          {
            title: "Cedar Reserve",
            text: "The largest house range, ideal for headline flavour launches and limited-batch callouts.",
            meta: "House favourite",
          },
          {
            title: "Brain Freeze",
            text: "Cooling fruit and menthol blends for customers searching for ice-heavy profiles.",
            meta: "Menthol specialist",
          },
          {
            title: "Bar Wars",
            text: "TPD-compliant 10ml flavours with prominent bundle merchandising.",
            meta: "4 for £11",
          },
          {
            title: "FiftyFifty Smooth",
            text: "Smooth nic salt style positioning for pod users and new vapers.",
            meta: "4 for £11",
          },
        ],
      },
    ],
  },
  hardware: {
    eyebrow: "Hardware",
    title: "Authentic vape hardware from starter kits to advanced sub-ohm setups.",
    description:
      "Guide customers by experience level, battery preference, and vaping style instead of forcing them through dense product filters.",
    cta: "Compare Coils",
    ctaHref: "/coils",
    stats: [
      ["43", "starter kits"],
      ["37", "pod kits"],
      ["20", "sub-ohm kits"],
      ["56", "internal battery devices"],
    ],
    sections: [
      {
        title: "Shop By Experience",
        cards: [
          {
            title: "Starter Kits",
            text: "Complete beginner-friendly kits for simple setup and reliable MTL use.",
            meta: "Best for new vapers",
          },
          {
            title: "Pod Kits",
            text: "Compact rechargeable systems suited to nic salts and daily carry.",
            meta: "Smooth and portable",
          },
          {
            title: "Sub Ohm Kits",
            text: "Higher-powered kits for DTL airflow, shortfills, and larger vapour production.",
            meta: "Advanced flavour",
          },
          {
            title: "Mods Only",
            text: "Standalone devices for customers who already know their tanks and batteries.",
            meta: "Experienced users",
          },
        ],
      },
      {
        title: "Key Brands",
        list: [
          "Vaporesso, Aspire, Geekvape, Voopoo, Smok, OXVA, Uwell, Innokin, Lost Vape, FreeMax, HorizonTech, BP Mods, and Vaperz Cloud.",
          "Battery support includes internal cells plus removable 18650 and 21700 options.",
        ],
      },
    ],
  },
  coils: {
    eyebrow: "Coils & Pods",
    title: "Replacement coils, pods, cotton, and wire matched to MTL and DTL vaping.",
    description:
      "Make compatibility and resistance easier to understand, from ultra-low sub-ohm builds to tight mouth-to-lung draws.",
    cta: "Need Help Choosing?",
    ctaHref: "/faq",
    stats: [
      ["44", "replacement coil products"],
      ["20", "replacement pod products"],
      ["0.14Ω", "ultra-low sub-ohm"],
      ["2.0Ω", "tight MTL range"],
    ],
    sections: [
      {
        title: "Resistance Guide",
        cards: [
          {
            title: "0.14Ω - 0.2Ω",
            text: "Ultra-low resistance for cloud production and direct-to-lung setups.",
            meta: "DTL",
          },
          {
            title: "0.3Ω - 0.6Ω",
            text: "Balanced flavour and vapour for many modern tanks and kits.",
            meta: "Balanced",
          },
          {
            title: "0.8Ω - 1.2Ω",
            text: "Smooth draw for pod kits, nic salts, and mouth-to-lung vaping.",
            meta: "MTL",
          },
          {
            title: "1.4Ω - 2.0Ω",
            text: "Tighter MTL draw and CBD-friendly vaping styles.",
            meta: "High resistance",
          },
        ],
      },
    ],
  },
  cbd: {
    eyebrow: "CBD",
    title: "CBD tinctures, edibles, dry herb, and vape devices in clear strength bands.",
    description:
      "Give CBD shoppers a calm, education-led category page covering strength, format, and stocked brands.",
    cta: "Ask Support",
    ctaHref: "/contact",
    stats: [
      ["150mg", "entry strength"],
      ["3000mg", "top strength"],
      ["8", "tincture products"],
      ["4", "CBD brands"],
    ],
    sections: [
      {
        title: "CBD Formats",
        cards: [
          {
            title: "Tinctures",
            text: "Oral CBD drops across multiple strengths for measured daily use.",
            meta: "8 products",
          },
          {
            title: "Edibles",
            text: "Ingestible CBD options for customers who prefer non-vape formats.",
            meta: "2 products",
          },
          {
            title: "Dry Herb",
            text: "Specialist dry herb option for experienced CBD users.",
            meta: "1 product",
          },
          {
            title: "CBD Vape",
            text: "Hurb Breeze CBD prefilled pod kit and vape hardware paths.",
            meta: "2 devices",
          },
        ],
      },
      {
        title: "Stocked CBD Brands",
        list: ["Hemp Life, Just CBD, Professor Herb, and Hurb Breeze."],
      },
    ],
  },
  deals: {
    eyebrow: "Deals",
    title: "Bundle pricing, new flavour launches, and delivery savings in one place.",
    description:
      "The audit recommended dedicated offer visibility. This page gathers bundle deals, new arrivals, coming-soon products, and free shipping messaging.",
    cta: "Shop New Arrivals",
    ctaHref: "/new-arrivals",
    stats: [
      ["4 for £11", "Bar Wars offer"],
      ["4 for £11", "FiftyFifty Smooth offer"],
      ["£30", "free Tracked 24 threshold"],
      ["100", "new account bonus points"],
    ],
    sections: [
      {
        title: "Current Offer Blocks",
        cards: [
          {
            title: "10ml Multipacks",
            text: "Promote value-led TPD-compliant multipacks with simple pricing.",
            meta: "Bundle deal",
          },
          {
            title: "New Flavours",
            text: "Use launch copy such as Just Launched and Limited Batch to create urgency.",
            meta: "New arrival",
          },
          {
            title: "Fan Favourites",
            text: "Surface high-repeat ranges and coming-soon products near the top of the page.",
            meta: "Repeat purchase",
          },
          {
            title: "Delivery Value",
            text: "Remind customers that Royal Mail Tracked 24 becomes free over £30.",
            meta: "Free over £30",
          },
        ],
      },
    ],
  },
  "store-finder": {
    eyebrow: "Store Finder",
    title: "Find Phoenix Vapers support online, by phone, or in store.",
    description:
      "The report noted that the site mentions a large retail footprint but does not make the store story visible enough. This page gives the frontend a dedicated store finder experience.",
    cta: "Contact The Team",
    ctaHref: "/contact",
    stats: [
      ["Peterborough", "head office"],
      ["8am-4pm", "weekday support"],
      ["01733", "local support line"],
      ["UK", "retail footprint"],
    ],
    sections: [
      {
        title: "Head Office",
        list: [
          "1 The Manor Grove Centre, Vicarage Farm Road, Boongate, Peterborough, PE1 5UH, United Kingdom.",
          "Head office phone: 01733 352553. Press 1 for website orders.",
          "For in-store complaints, email petertuck@phoenixeliquid.co.uk with the date of visit and store location.",
        ],
      },
      {
        title: "Store Finder Features",
        cards: [
          {
            title: "Search by postcode",
            text: "A production version can connect to store data and show nearest branches.",
            meta: "Functional design",
          },
          {
            title: "Store services",
            text: "Show advice, returns support, stock availability, and beginner guidance.",
            meta: "Retail support",
          },
          {
            title: "Map-ready layout",
            text: "The page is structured to accept an embedded map or store locator API.",
            meta: "Next step",
          },
        ],
      },
    ],
  },
  about: {
    eyebrow: "About Phoenix Vapers",
    title: "A UK vaping retailer built around quality, advice, and chemistry-led trust.",
    description:
      "Phoenix Vapers Limited was founded to bring electronic cigarettes to high street consumers in an open and informative environment.",
    cta: "Read Safety Standards",
    ctaHref: "/safety",
    stats: [
      ["20 years", "chemistry leadership experience"],
      ["UK", "manufacturing focus"],
      ["Stores", "retail advice network"],
      ["2026", "current audit scope"],
    ],
    sections: [
      {
        title: "What Phoenix Stands For",
        list: [
          "Quality assurance through UK-manufactured, chemist-verified e-liquids.",
          "Customer service from trained staff across stores, phone, email, and live chat.",
          "Technical credibility from leadership with chemistry and commercial experience.",
        ],
      },
    ],
  },
  delivery: {
    eyebrow: "Delivery",
    title: "Royal Mail tracked delivery with clear cutoffs and free shipping over £30.",
    description:
      "Orders placed before 2pm Monday to Friday dispatch the same day, excluding bank holidays.",
    cta: "See Returns",
    ctaHref: "/returns",
    stats: [
      ["£3.99", "Tracked 24"],
      ["£2.99", "Tracked 48"],
      ["£30", "free shipping threshold"],
      ["2pm", "same-day dispatch cutoff"],
    ],
    sections: [
      {
        title: "Delivery Notes",
        list: [
          "Royal Mail Tracked 24 aims for next working day delivery for most UK postcodes, but is not guaranteed.",
          "Royal Mail Tracked 48 aims for 2-3 working days and achieves the 2-day aim for most UK postcodes.",
          "Parcels may be too large for standard letterboxes, so customers should make sure someone can receive delivery.",
          "International shipping policy should be stated clearly before launch because the audit found it missing.",
        ],
      },
    ],
  },
  returns: {
    eyebrow: "Returns",
    title: "Fault-based returns and warranty support explained before purchase.",
    description:
      "Phoenix Vapers accepts returns for faulty products only. Products are tested before replacements are issued.",
    cta: "Contact Support",
    ctaHref: "/contact",
    stats: [
      ["14 days", "standard faulty-product warranty"],
      ["7 days", "atomiser coil warranty"],
      ["60 days", "battery warranty"],
      ["3 days", "typical testing window"],
    ],
    sections: [
      {
        title: "Returns Process",
        list: [
          "Email orders@phoenixeliquid.co.uk with the fault description and order number.",
          "Phoenix replies with the returns address.",
          "Returned items are tested within three working days.",
          "Confirmed faulty goods are replaced, or substituted with equal-or-greater value if needed.",
        ],
      },
      {
        title: "Important Limits",
        list: [
          "Returns are not accepted simply because a customer dislikes a flavour or product preference.",
          "Tampered, poorly maintained, or inadequately cleaned items may be refused under warranty.",
        ],
      },
    ],
  },
  loyalty: {
    eyebrow: "Loyalty Points",
    title: "Earn points from every Phoenix Vapers order and redeem without waiting.",
    description:
      "The loyalty page now has a clearer visual explainer for earning, redeeming, and understanding how points affect free shipping.",
    cta: "View Deals",
    ctaHref: "/deals",
    stats: [
      ["1 point", "earned per £1 spent"],
      ["100 points", "equals £1 discount"],
      ["100 points", "new account bonus"],
      ["No cap", "on earning or redemption"],
    ],
    sections: [
      {
        title: "Example Calculator",
        cards: [
          {
            title: "Spend £25",
            text: "Earn 25 points, equal to £0.25 future saving.",
            meta: "Every order counts",
          },
          {
            title: "Spend £50",
            text: "Earn 50 points, equal to £0.50 future saving.",
            meta: "No minimum wait",
          },
          {
            title: "Spend £100",
            text: "Earn 100 points, equal to £1 off a future order.",
            meta: "No earning cap",
          },
        ],
      },
      {
        title: "Important Detail",
        list: [
          "Points discounts are applied before the £30 free shipping threshold is calculated.",
          "Future enhancements could include tiers, referral rewards, birthday rewards, and double-points events.",
        ],
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Fast answers for new vapers, repeat customers, and support teams.",
    description:
      "The audit found missing beginner education, so this page covers nicotine strength, nic salts, shortfills, coils, delivery, and returns.",
    cta: "Contact Support",
    ctaHref: "/contact",
    faqs: [
      {
        question: "What nicotine strength should I choose?",
        answer:
          "New switchers often start by matching their previous smoking habit. Lower strengths suit light use, while 10mg to 20mg nic salts can help customers who need smoother higher-strength nicotine in pod kits.",
      },
      {
        question: "What is the difference between freebase and nic salts?",
        answer:
          "Freebase nicotine gives a more familiar throat hit. Nic salts feel smoother at higher strengths and are usually best in pod kits or MTL devices.",
      },
      {
        question: "How do shortfills work?",
        answer:
          "Shortfills are larger 0mg bottles with space left for a nicotine shot. VG shots push the mix toward higher vapour production, while PG shots create a stronger throat hit.",
      },
      {
        question: "How do I know which coil to buy?",
        answer:
          "Match the coil to your exact device or tank first, then choose resistance by style: lower ohms for DTL vapour, higher ohms for MTL and nic salts.",
      },
      {
        question: "When will my order dispatch?",
        answer:
          "Orders placed before 2pm Monday to Friday dispatch the same day, excluding bank holidays. Later orders process the next working day.",
      },
      {
        question: "Can I return a flavour I do not like?",
        answer:
          "No. Phoenix Vapers operates a fault-based returns policy and does not accept returns based on flavour preference.",
      },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Get help with orders, faults, stores, and beginner product guidance.",
    description:
      "Use the contact page as a simple support hub for online orders, live chat, phone, email, and in-store escalation.",
    cta: "Find A Store",
    ctaHref: "/store-finder",
    stats: [
      ["8am-4pm", "weekday live chat"],
      ["01733887900", "customer service"],
      ["01733 352553", "head office"],
      ["Email", "orders@phoenixeliquid.co.uk"],
    ],
    sections: [
      {
        title: "Support Channels",
        cards: [
          {
            title: "Online Orders",
            text: "Email orders@phoenixeliquid.co.uk with your order number and issue.",
            meta: "Fastest route",
          },
          {
            title: "Phone Support",
            text: "Call 01733887900 during weekday business hours for customer service.",
            meta: "8am-4pm",
          },
          {
            title: "Live Chat",
            text: "Use live chat during business hours or leave an offline message.",
            meta: "Weekdays",
          },
          {
            title: "Store Complaints",
            text: "Email petertuck@phoenixeliquid.co.uk with date of visit and store location.",
            meta: "In-store help",
          },
        ],
      },
    ],
    form: true,
  },
  safety: {
    eyebrow: "Safety & Compliance",
    title: "Visible compliance for a regulated 18+ nicotine retail experience.",
    description:
      "Safety, compliance, and trust marks should be prominent throughout the frontend, not hidden only in the footer.",
    cta: "Read FAQ",
    ctaHref: "/faq",
    stats: [
      ["18+", "age restricted"],
      ["20mg/ml", "UK TPD maximum"],
      ["ISO", "9001:2015 quality mark"],
      ["SSL", "secure checkout"],
    ],
    sections: [
      {
        title: "Quality Standards",
        list: [
          "All e-liquids are manufactured in the UK.",
          "Every batch is analysed before sale.",
          "Phoenix sells authentic products only, with no replica or counterfeit hardware.",
          "EL-Science supports Product Risk Assessments for Phoenix e-liquid products.",
        ],
      },
      {
        title: "Nicotine Safety",
        list: [
          "Products are strictly for customers aged 18 and over.",
          "Nicotine is addictive and should be kept away from children.",
          "E-liquid must not be ingested directly and prolonged skin contact should be avoided.",
          "Non-smokers are encouraged not to purchase nicotine-containing products.",
        ],
      },
    ],
  },
};

export const pageSlugs = Object.keys(pages);
