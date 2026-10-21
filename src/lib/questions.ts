import { QuestionDefinition } from './types';

export const CHAPTERS = [
  { id: 1, title: 'Concept & Data Model', subtitle: 'App archetype, items & intake fields' },
  { id: 2, title: 'User Flow & Back-Office', subtitle: 'Step-by-step journey & admin controls' },
  { id: 3, title: 'Visuals & Palette', subtitle: 'Dark/light mode, color wheel & theme' },
  { id: 4, title: 'Access & Launch', subtitle: 'Auth, alerts, payments & design peg' },
] as const;

export const CORE_QUESTIONS: QuestionDefinition[] = [
  // Chapter 1: Concept & Data Model
  {
    id: 'app_archetype',
    chapter: 1,
    chapterTitle: 'Concept & Data Model',
    number: 1,
    title: 'What type of application are we building?',
    guidance: 'Tell me about the core purpose of your app! Tap the archetype that best matches your vision, or describe your unique idea in your own words.',
    chips: [
      'Service Booking & Appointments (Salons, consulting, clinics, coaching, creative studios)',
      'Catalog & Ordering (Food menu, boutique, digital products, merchandise)',
      'Personal Utility & Tracker (Workouts, habits, finance, private vault)',
      'Community & Member Hub (Directory, events, courses, private resources)',
      'Lead Capture & Client Intake (Inquiries, quotes, client questionnaires)'
    ]
  },
  {
    id: 'content_and_records',
    chapter: 1,
    chapterTitle: 'Concept & Data Model',
    number: 2,
    title: 'What specific records, services, or items are being created and displayed?',
    guidance: 'This helps our developers design your database tables and data models right from day one.',
    chips: [
      'Services & Time Slots (Duration, pricing, staff assignment, available hours)',
      'Product Items & Variants (Photos, descriptions, categories, stock levels)',
      'Daily Personal Logs & Metrics (Timestamps, categories, ratings, notes)',
      'Client Profiles & Inquiries (Contact info, custom answers, attached files, status flags)',
      'Fresh blank slate — I will create custom entries directly inside the app'
    ]
  },
  {
    id: 'intake_and_submission',
    chapter: 1,
    chapterTitle: 'Concept & Data Model',
    number: 3,
    title: 'What information or details must users submit when taking action?',
    guidance: 'Think about what you need to collect from users before an appointment, order, or record is confirmed.',
    chips: [
      'Basic Contact & Time Only (Name, phone/email, chosen date & time slot)',
      'Custom Intake Questionnaire (Multiple-choice questions, custom text fields, intake notes)',
      'Media & Document Uploads (Photos, ID verification, reference images, PDF files)',
      'Instant 1-Tap Quick Entry (No complex forms — quick tap to log, save, or complete)'
    ]
  },

  // Chapter 2: User Flow & Back-Office
  {
    id: 'core_user_journey',
    chapter: 2,
    chapterTitle: 'User Flow & Back-Office',
    number: 4,
    title: 'What is the primary user journey from first tap to finish?',
    guidance: 'Walk me through the main path — from opening the app to completing the core action.',
    chips: [
      'Browse services → Pick date/time slot → Fill intake details → Instant confirmation',
      'Browse catalog → Add to cart → Checkout / Order slip generated',
      'Open app → Tap (+) button → Quick log entry → Personal charts update',
      'Explore community/directory → View detail profile → Connect, chat, or RSVP'
    ]
  },
  {
    id: 'admin_and_backoffice',
    chapter: 2,
    chapterTitle: 'User Flow & Back-Office',
    number: 5,
    title: 'How will the creator or business owner manage this behind the scenes?',
    guidance: 'Tell us how you or your team will oversee records, accept submissions, or update content.',
    chips: [
      'Dedicated Mobile/Desktop Admin Portal (View calendar, accept/reschedule bookings, export CSV)',
      'Content & Catalog Manager (Add/edit services, update prices, manage availability directly in-app)',
      'Alerts Only — No Admin Panel Needed (Send details straight to Google Calendar & Email)',
      'Private to Me (Personal single-user tool — no admin or client separation needed)'
    ]
  },

  // Chapter 3: Visuals & Palette
  {
    id: 'theme_mode',
    chapter: 3,
    chapterTitle: 'Visuals & Palette',
    number: 6,
    title: 'How should the interface feel on your eyes — Dark Mode, Light Mode, or Adaptive?',
    guidance: 'Think about how you and your users will view this app throughout the day and night.',
    chips: [
      'Sleek Dark Mode (Immersive deep blacks, charcoal panels, glowing accents)',
      'Crisp Light Mode (Bright, clean, high-contrast, airy white/slate)',
      'Adaptive Auto-Switch (Automatically follows device system theme)'
    ]
  },
  {
    id: 'color_scheme_and_vibe',
    chapter: 3,
    chapterTitle: 'Visuals & Palette',
    number: 7,
    title: 'What colors or visual vibe feel right for this app?',
    guidance: 'Use the interactive color wheel below to select up to 3 palette colors (Primary Accent, Background, and Highlight), or choose a signature preset.',
    chips: [
      'Obsidian Gold (#0B0B0F & #D4AF37 with Apple/Linear crisp borders)',
      'Cyber Violet (#0A0A0E & #7C3AED with electric neon glow)',
      'Minimalist Slate (#0F172A & #3B82F6 Notion/Craft tech style)',
      'Warm Contemporary (#FAF8F5 & #EA580C Airbnb earthy style)',
      '✨ Curate for me (Let Every Nation GG designers craft the best luxury look)'
    ]
  },

  // Chapter 4: Access & Launch
  {
    id: 'access_and_auth',
    chapter: 4,
    chapterTitle: 'Access & Launch',
    number: 8,
    title: 'Who should have access to this app, and how should people get in?',
    guidance: 'Think about whether this is private for you and invited users, or open to the public — and how people verify their identity.',
    chips: [
      '1-Tap Social Login (Google & Apple ID — fastest frictionless access)',
      'Instant Guest Access (No sign-up or password required — jump straight in)',
      'Private Invite / Passcode (Locked to me and people with an access passcode)',
      'Standard Email & Password (Account profile with saved history)'
    ]
  },
  {
    id: 'notifications_and_alerts',
    chapter: 4,
    chapterTitle: 'Access & Launch',
    number: 9,
    title: 'When an action happens, what notifications or alerts should trigger?',
    guidance: 'Think about whether you need automated calendar bookings, instant push alerts, or zero interruptions.',
    chips: [
      'Calendar Sync + Instant Confirmation (Auto-adds to Google Calendar + Email/SMS)',
      'Daily Push Notification Reminders (Customizable morning/evening nudges)',
      'Instant WhatsApp / Telegram Alert (Sends inquiry details directly to my chat)',
      'Quiet Mode (Zero notifications — everything stays strictly inside the app)'
    ]
  },
  {
    id: 'payments_and_monetization',
    chapter: 4,
    chapterTitle: 'Access & Launch',
    number: 10,
    title: 'Does this app need to accept payments, or is it completely free?',
    guidance: 'Let us know if you plan to charge users, connect mobile payment gateways, or keep it 100% free.',
    chips: [
      '100% Free (No payments or checkout needed)',
      'Philippine Mobile Payments (GCash, Maya, Bank Transfer slip upload)',
      'Card / Online Payments (Stripe, Credit/Debit card)',
      'Pay in-person / Cash on Delivery',
      'Recurring membership / subscription paywall'
    ]
  },
  {
    id: 'visual_peg_and_timeline',
    chapter: 4,
    chapterTitle: 'Access & Launch',
    number: 11,
    title: 'What visual pegs or reference apps match your vision, and what is your target launch timeline?',
    guidance: 'Paste any link to a design peg you love (website, Dribbble, or Instagram), or tap a benchmark reference style below along with your target launch window.',
    chips: [
      'Peg: Like Apple & Linear • Lean MVP in 2–4 weeks',
      'Peg: Like Apple & Linear • Polished V1 in 1–2 months',
      'Peg: Like Notion & Craft • Lean MVP in 2–4 weeks',
      'Peg: Like Airbnb / Contemporary • Polished V1 in 1–2 months',
      'Peg: Like Spotify / Immersive • Polished V1 in 1–2 months',
      '✨ Curate design peg & milestones for me'
    ]
  }
];
