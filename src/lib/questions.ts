import { QuestionDefinition } from './types';

export const CHAPTERS = [
  { id: 1, title: 'Concept & Data Model', subtitle: 'App archetype, content & intake fields' },
  { id: 2, title: 'User Flow, Platform & Back-Office', subtitle: 'Step-by-step flow, devices & admin controls' },
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
    title: 'What core information, data, or content will the app display or manage?',
    guidance: 'Tell us what data lives in the app — or let us know if this is a utility/tool that does not need to store database records.',
    chips: [
      'No saved database records (Pure utility, calculator, or static showcase tool)',
      'Services & Time Slots (Duration, pricing, staff assignment, available hours)',
      'Product Items & Variants (Photos, descriptions, categories, stock levels)',
      'Client Inquiries & Intake Submissions (Contact info, custom answers, attached files)',
      'Daily Personal Logs & Metrics (Timestamps, categories, ratings, notes)'
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

  // Chapter 2: User Flow, Platform & Back-Office
  {
    id: 'core_user_journey',
    chapter: 2,
    chapterTitle: 'User Flow, Platform & Back-Office',
    number: 4,
    title: 'What is the primary user flow from first tap to finish?',
    guidance: 'Walk me through the main user flow — from opening the app to completing the core action.',
    chips: [
      'Browse services → Pick date/time slot → Fill intake details → Instant confirmation',
      'Browse catalog → Add to cart → Checkout / Order slip generated',
      'Open app → Tap (+) button → Quick entry flow → Personal charts update',
      'Explore community/directory → View detail profile → Connect, chat, or RSVP'
    ]
  },
  {
    id: 'target_platform',
    chapter: 2,
    chapterTitle: 'User Flow, Platform & Back-Office',
    number: 5,
    title: 'What devices and platforms should this app support at launch?',
    guidance: 'This helps developers choose between a responsive web app (PWA) or native mobile apps published to the Apple App Store and Google Play.',
    chips: [
      'Responsive Web App / PWA (Runs smoothly on any phone, tablet, and desktop browser)',
      'Native Mobile Apps (Published to Apple App Store & Google Play Store)',
      'Both Responsive Web + Native Mobile Apps (Unified cross-platform build)',
      'Tablet / Desktop First (Optimized for iPad kiosks, cashiers, or office workstations)'
    ]
  },
  {
    id: 'admin_and_backoffice',
    chapter: 2,
    chapterTitle: 'User Flow, Platform & Back-Office',
    number: 6,
    title: 'Do you need an admin dashboard or management panel to manage the app?',
    guidance: 'Tell us if you or your team need an admin interface to manage content, view submissions, and control settings, or if the app is self-contained.',
    chips: [
      'Yes — Dedicated Web Admin Dashboard (View calendar, accept/reschedule bookings, export CSV)',
      'Yes — In-App Admin Mode (Switch to admin mode directly on mobile to update listings & prices)',
      'No Admin Dashboard Needed (Send submissions directly to Email, WhatsApp, or Google Calendar)',
      'No — Single-user private tool (No admin or client separation needed)'
    ]
  },

  // Chapter 3: Visuals & Palette
  {
    id: 'theme_mode',
    chapter: 3,
    chapterTitle: 'Visuals & Palette',
    number: 7,
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
    number: 8,
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
    number: 9,
    title: 'Do users need to create an account or sign in to use the app, and who is allowed access?',
    guidance: 'Tell us whether the app should be open to the public without login, require an account (Google, Apple, Email), or be restricted to private invitees.',
    chips: [
      'Instant Guest Access (No sign-up or password required — open to anyone)',
      '1-Tap Social Sign-In (Google & Apple ID — fast, frictionless access)',
      'Standard Email & Password / OTP (User profile with saved history and preferences)',
      'Private & Invite-Only (Locked to specific team members or users with an access code)',
      'Multi-Role Access (Different access levels for Customers, Staff, and Admins)'
    ]
  },
  {
    id: 'integrations_and_hardware',
    chapter: 4,
    chapterTitle: 'Access & Launch',
    number: 10,
    title: 'Does the app need to connect with external tools, APIs, or device features?',
    guidance: 'Specify any third-party services (like Google Maps, WhatsApp, Google Sheets, or CRM) or device hardware (Camera/QR, GPS, Bluetooth printer) developers should integrate.',
    chips: [
      'Maps & Location (Google Maps, GPS routing, address autocomplete)',
      'Camera & QR Scanner (Barcode scanning, photo proof upload, QR check-in)',
      'Spreadsheet & File Sync (Sync data with Google Sheets, Airtable, or CSV export)',
      'Chat & Messaging API (WhatsApp, Telegram, or SMS gateway)',
      'No External Integrations (Self-contained app with no third-party APIs)'
    ]
  },
  {
    id: 'notifications_and_alerts',
    chapter: 4,
    chapterTitle: 'Access & Launch',
    number: 11,
    title: 'What specific notifications should trigger, and when should they send?',
    guidance: 'Select the triggers that fit your workflow — like instant booking confirmations, reminder alerts before scheduled events, owner submission alerts, or daily summaries.',
    chips: [
      'Instant Confirmation (Email/SMS receipt sent immediately after booking or order)',
      'Scheduled Reminders (Push notification or SMS sent 24h & 1h before an event/appointment)',
      'New Lead / Order Alert to Owner (Instant ping via WhatsApp, Telegram, or Email when someone submits)',
      'Status Update Alerts (Notify user when order/booking is accepted, ready, or completed)',
      'Daily Activity Digest (Morning or evening recap of new entries and tasks)',
      'No Notifications Needed (Completely quiet mode — no alerts sent)'
    ]
  },
  {
    id: 'payments_and_monetization',
    chapter: 4,
    chapterTitle: 'Access & Launch',
    number: 12,
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
    number: 13,
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
