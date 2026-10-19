import { QuestionDefinition } from './types';

export const CHAPTERS = [
  { id: 1, title: 'Concept & Flow', subtitle: 'The idea, problem & primary action' },
  { id: 2, title: 'Visuals & Theme', subtitle: 'Colors, dark/light mode & inspiration' },
  { id: 3, title: 'Access & Content', subtitle: 'Sign-in method & starting data' },
  { id: 4, title: 'Alerts & Launch', subtitle: 'Notifications, payments & V1 scope' },
] as const;

export const CORE_QUESTIONS: QuestionDefinition[] = [
  // Chapter 1: Concept & Flow
  {
    id: 'concept_and_audience',
    chapter: 1,
    chapterTitle: 'Concept & Flow',
    number: 1,
    title: 'What kind of project or app is this, and who is it for?',
    guidance: 'Tell me about what you want to make! It could be a personal tool just for you, an app for your friends or community, a new creative idea, or a business.',
    chips: [
      'Personal tool just for me / private use',
      'For my friends, community, or team',
      'A new startup / app idea I want to launch',
      'For my existing business or service',
      "I have an idea but need help brainstorming"
    ]
  },
  {
    id: 'problem_and_workflow',
    chapter: 1,
    chapterTitle: 'Concept & Flow',
    number: 2,
    title: "What's the main headache or dream experience this app creates for you?",
    guidance: 'Think about your current routine without this app — where do things get messy, repetitive, lost, or where does current software fall short?',
    chips: [
      'Current apps are too bloated, complex, or full of ads',
      'Too many things scattered across notes, chats & spreadsheets',
      'I want a dedicated, beautiful space tailored to my routine',
      'Manual repetitive tasks that take up too much time',
      'Nothing on the market currently does what I have in mind'
    ]
  },
  {
    id: 'core_user_journey',
    chapter: 1,
    chapterTitle: 'Concept & Flow',
    number: 3,
    title: 'When you open the app, what is the single most important thing you do?',
    guidance: 'Walk me through the main path — from tapping the app icon on your phone to getting the result or experience you want.',
    chips: [
      'Quick 1-tap entry / log something immediately',
      'View a personal dashboard / stats, records & progress',
      'Browse options / content and select or book',
      'Connect, chat, or collaborate with other people'
    ]
  },

  // Chapter 2: Visuals & Theme
  {
    id: 'theme_mode',
    chapter: 2,
    chapterTitle: 'Visuals & Theme',
    number: 4,
    title: 'How should the app feel on your eyes — Dark Mode, Light Mode, or Adaptive?',
    guidance: 'Think about how you and your users will view this app throughout the day and night.',
    chips: [
      'Sleek Dark Mode (Immersive, glowing accents, easy on the eyes)',
      'Clean Light Mode (Bright, airy, high clarity & crisp contrast)',
      'Auto-switch (Automatically follows device system theme)'
    ]
  },
  {
    id: 'color_scheme_and_vibe',
    chapter: 2,
    chapterTitle: 'Visuals & Theme',
    number: 5,
    title: 'What colors or visual vibe feel right for this app?',
    guidance: 'You can share a mood, general colors you love, or exact hex codes if you already have a brand palette.',
    chips: [
      'Deep Luxury (Obsidian black, charcoal & gold/violet glow)',
      'Minimalist Tech (Pure white, slate grey & electric blue)',
      'Warm Earthy (Beige, cream, terracotta & olive green)',
      'Pastel & Soft (Lavender, mint, peach & rounded cards)',
      'Bold & Vibrant (High contrast with neon energetic accents)',
      'I have specific colors / hex codes in mind'
    ]
  },
  {
    id: 'design_inspiration',
    chapter: 2,
    chapterTitle: 'Visuals & Theme',
    number: 6,
    title: 'Are there any apps or websites whose design, smoothness, or feel you love?',
    guidance: 'Mention any apps you enjoy using (e.g. Apple, Notion, Linear, Spotify, Airbnb) or design styles you want to avoid.',
    chips: [
      'Like Apple / Linear (Ultra-clean, crisp borders, subtle animations)',
      'Like Notion / Craft (Document-style, clean typography, fast)',
      'Like Spotify / Arc (Immersive, playful, dark, dynamic cards)',
      'Like Airbnb (Friendly, spacious, visual cards)',
      'Avoid: Cluttered, sterile corporate, or outdated look'
    ]
  },

  // Chapter 3: Access & Content
  {
    id: 'access_and_auth',
    chapter: 3,
    chapterTitle: 'Access & Content',
    number: 7,
    title: 'Who should have access to this app, and how should people get in?',
    guidance: 'Think about whether this is private for you and invited people, or open to the public — and whether you want accounts or instant access.',
    chips: [
      'Private to me / my circle (Passcode or invite-only)',
      'Instant Access (No account needed — jump straight in)',
      '1-Tap Social Login (Google & Apple ID)',
      'Standard Email & Password login',
      'Public / anyone can create an account'
    ]
  },
  {
    id: 'starting_content_and_data',
    chapter: 3,
    chapterTitle: 'Access & Content',
    number: 8,
    title: 'Are you starting with a fresh clean slate, or do you have existing notes, lists, or files to bring in?',
    guidance: 'This helps our developers know if you need an import tool or if you will create entries directly inside the app.',
    chips: [
      'Fresh blank slate — I will create entries inside the app',
      'I have notes / lists in Apple Notes, Notion, or text files',
      'I have a spreadsheet (Google Sheet, Excel, or CSV)',
      'I have images, audio, or media files ready to upload'
    ]
  },

  // Chapter 4: Alerts & Launch
  {
    id: 'notifications_and_alerts',
    chapter: 4,
    chapterTitle: 'Alerts & Launch',
    number: 9,
    title: 'Should the app send reminders or alerts to your phone, or stay quiet until opened?',
    guidance: 'Think about whether you need daily nudges, instant status updates, or zero interruptions.',
    chips: [
      'Daily push notification reminders (customizable time)',
      'Instant alerts when something changes or updates',
      'Email summaries / confirmations',
      'Quiet mode — no notifications, only when I open the app'
    ]
  },
  {
    id: 'payments_and_monetization',
    chapter: 4,
    chapterTitle: 'Alerts & Launch',
    number: 10,
    title: 'Does this app need to accept money or payments, or is it completely free?',
    guidance: 'Let us know if you plan to charge users, accept tips, connect mobile payment gateways, or keep it 100% free.',
    chips: [
      '100% Free (No payments or checkout needed)',
      'Local Mobile Payments (GCash, Maya, Bank Transfer)',
      'Card / Online Payments (Stripe, Credit/Debit card)',
      'One-time purchase / Pay to unlock a feature',
      'Recurring membership / subscription'
    ]
  },
  {
    id: 'timeline_and_budget',
    chapter: 4,
    chapterTitle: 'Alerts & Launch',
    number: 11,
    title: 'What is your single must-have feature for Day 1, and what timeline or budget do you have in mind?',
    guidance: 'Focus on what would make you happy for Version 1, and your target launch timeframe so Every Nation GG can tailor the best build milestones.',
    chips: [
      'Lean & Fast: Core MVP launched in 2–4 weeks',
      'Polished V1: Launch in 1–2 months with full aesthetic polish',
      'Personal budget / flexible milestones',
      'Commercial tier / built for scaling',
      'Enterprise / Custom quote based on full scope'
    ]
  }
];
