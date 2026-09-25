import { QuestionDefinition } from './types';

export const CHAPTERS = [
  { id: 1, title: 'Concept & Reality', subtitle: 'The idea, problem & core user flow' },
  { id: 2, title: 'Experience & Specs', subtitle: 'Target platforms, payments & aesthetic vibe' },
  { id: 3, title: 'Launch Blueprint', subtitle: 'V1 essentials, timeline & infrastructure' },
] as const;

export const CORE_QUESTIONS: QuestionDefinition[] = [
  // Chapter 1: Concept & Reality
  {
    id: 'concept_and_audience',
    chapter: 1,
    chapterTitle: 'Concept & Reality',
    number: 1,
    title: 'Tell me about the app you have in mind and who it is for.',
    guidance: 'In your own words, what is the core idea of the app, and who do you picture actually opening and using it?',
    chips: [
      'Customer booking & ordering app',
      'Community & membership portal',
      'E-commerce / shop experience',
      'Internal operations & team tool',
      'Content & service platform'
    ]
  },
  {
    id: 'problem_and_workflow',
    chapter: 1,
    chapterTitle: 'Concept & Reality',
    number: 2,
    title: 'How are you or your users handling this today, and what is the biggest headache?',
    guidance: 'Think about your current routine without this app—are you using spreadsheets, WhatsApp/Messenger, paper, or phone calls? Where do things get messy, slow, or frustrating?',
    chips: [
      'Orders & DMs get lost in Messenger / WhatsApp',
      'Messy spreadsheets & manual inventory',
      'Customers have no easy way to track progress',
      'Manual paper forms & repetitive coordination',
      'Existing generic tools are too bloated or clunky'
    ]
  },
  {
    id: 'core_user_journey',
    chapter: 1,
    chapterTitle: 'Concept & Reality',
    number: 3,
    title: 'Walk me through the main user journey—from opening the app to getting the result.',
    guidance: 'If someone opens the app right now, what is the single most important action they take, and what should happen right after they complete it?',
    chips: [
      'Browse catalog → customize order → instant confirmation & tracking',
      'Select service & date → book slot → calendar sync & reminder',
      'Submit request / inquiry → admin notified → live status updates',
      'Log in → view personal dashboard → access resources'
    ]
  },

  // Chapter 2: Experience & Specs
  {
    id: 'target_platform',
    chapter: 2,
    chapterTitle: 'Experience & Specs',
    number: 4,
    title: 'Where should this app live?',
    guidance: 'Think about how your audience will access it. Do they need an App Store download, a quick link in their mobile browser, or a desktop/tablet interface?',
    chips: [
      'Mobile App (iOS & Android App Stores)',
      'Responsive Web App (Runs in any browser without download)',
      'Both Web & Mobile App',
      'Tablet / iPad in workshop or store counter',
      'Desktop / Laptop dashboard for staff'
    ]
  },
  {
    id: 'payments_and_integrations',
    chapter: 2,
    chapterTitle: 'Experience & Specs',
    number: 5,
    title: 'Does this app need to accept payments or connect with existing tools?',
    guidance: 'Does money change hands inside the app? Does it need to connect to shipping couriers, inventory, Google Sheets, or social media?',
    chips: [
      'GCash, Maya & Online Card payments',
      'Cash on Delivery / Bank transfer slip upload',
      'Courier & shipping tracking (e.g. Lalamove, J&T)',
      'Sync with Google Sheets or existing database',
      'No payments needed (free or internal tool)'
    ]
  },
  {
    id: 'look_feel_inspiration',
    chapter: 2,
    chapterTitle: 'Experience & Specs',
    number: 6,
    title: 'How should the app look and feel? Any aesthetic styles or apps you love?',
    guidance: 'Think about colors, vibe (clean, bold, dark, playful, luxurious), and any apps you like—or styles you definitely want to avoid.',
    chips: [
      'Warm minimal, clean & airy',
      'Sleek dark mode with modern glowing accents',
      'Bold, fast & energetic',
      'Premium, high-end & trustworthy',
      'Avoid: Cluttered, sterile corporate, or outdated look'
    ]
  },

  // Chapter 3: Launch Blueprint
  {
    id: 'v1_launch_essentials',
    chapter: 3,
    chapterTitle: 'Launch Blueprint',
    number: 7,
    title: 'What absolutely has to be in Version 1 for the launch to be a success?',
    guidance: 'Focus on the bare essentials that make the app genuinely useful on Day 1 without overcomplicating things.',
    chips: [
      'Customer ordering & automated confirmation',
      'Admin dashboard to manage orders & status',
      'User login & saved order history',
      'Automated SMS / email / chat notifications',
      'Simple product or service catalog'
    ]
  },
  {
    id: 'timeline_and_horizon',
    chapter: 3,
    chapterTitle: 'Launch Blueprint',
    number: 8,
    title: 'When are you hoping to launch, and if this succeeds, what is your long-term vision?',
    guidance: 'Do you have an upcoming target date or season in mind? And down the road, where could this app grow?',
    chips: [
      'As soon as possible (within 4–6 weeks)',
      'Targeting next 2–3 months',
      'Flexible timeline — focus on getting it right',
      'Future: Scale to multi-branch & public subscriptions',
      'Future: Built-in AI assistant & automated dispatch'
    ]
  },
  {
    id: 'infrastructure_preference',
    chapter: 3,
    chapterTitle: 'Launch Blueprint',
    number: 9,
    title: "How would you prefer your app's technical infrastructure and maintenance to be managed?",
    guidance: "This is for planning only—you aren't purchasing anything now. We just want to know how you prefer hosting, databases, and accounts to be handled.",
    chips: [
      'Every Nation GG manages hosting, databases & updates',
      'I prefer my own developer accounts (Apple, Google, AWS/Supabase)',
      'Hybrid: ENGG builds it, then guides our team on handover',
      "I'm not sure yet — recommend the best path for our stage"
    ]
  }
];
