import { QuestionDefinition } from './types';

export const CHAPTERS = [
  { id: 1, title: 'The Big Idea', subtitle: 'Your vision, who it’s for & what people see' },
  { id: 2, title: 'How It Works', subtitle: 'The customer journey, devices & managing things' },
  { id: 3, title: 'The Look & Vibe', subtitle: 'Light, dark, brand colors & visual style' },
  { id: 4, title: 'Launch & Access', subtitle: 'Sign-in, alerts, payments & launch timing' },
] as const;

export const CORE_QUESTIONS: QuestionDefinition[] = [
  // Chapter 1: The Big Idea
  {
    id: 'app_archetype',
    chapter: 1,
    chapterTitle: 'The Big Idea',
    number: 1,
    title: 'Tell me about the app you have in mind! What do you want it to do?',
    guidance: 'Share the heart of your project in your own words, or tap an idea below that matches what you want to create.',
    chips: [
      'Booking & Appointments (Salons, clinics, coaching, photo studios, private sessions)',
      'Menu, Shop & Ordering (Cafes, bakeries, boutique goods, merchandise)',
      'Daily Tracker & Habits (Workouts, routines, personal finance, private notes)',
      'Community & Member Hub (Events, club directory, exclusive content, groups)',
      'Client Quotes & Inquiries (Project intake, lead inquiries, client estimates)'
    ]
  },
  {
    id: 'content_and_records',
    chapter: 1,
    chapterTitle: 'The Big Idea',
    number: 2,
    title: 'What are the main things people will see and browse when they open the app?',
    guidance: 'Think about what you want on display — like photos, item listings, schedules, or if it’s a quick tool with no saved catalog.',
    chips: [
      'A clean showcase tool / calculator (No saved catalog needed)',
      'Services, time slots & pricing (Duration, available hours, booking slots)',
      'Product items & photos (Descriptions, flavors or sizes, stock levels)',
      'Customer inquiries & requests (Client contact info, custom notes, attachments)',
      'Personal daily logs & entries (Timestamps, categories, personal progress)'
    ]
  },
  {
    id: 'intake_and_submission',
    chapter: 1,
    chapterTitle: 'The Big Idea',
    number: 3,
    title: 'When someone takes action or places a request, what details do you need from them?',
    guidance: 'Think about what information makes an order or booking complete before you can confirm it.',
    chips: [
      'Basic contact & time only (Name, phone/email, chosen date & time slot)',
      'A short custom form (Answers to specific questions, preferences, special notes)',
      'Photo or document uploads (Reference pictures, receipts, ID photos)',
      'Instant 1-tap action (No long forms — just tap to confirm or log)'
    ]
  },

  // Chapter 2: How It Works
  {
    id: 'core_user_journey',
    chapter: 2,
    chapterTitle: 'How It Works',
    number: 4,
    title: 'Walk me through the journey: what does someone do from the moment they open the app to the finish?',
    guidance: 'Picture a customer using it on their phone — what steps do they take to get what they came for?',
    chips: [
      'Browse options → Pick a date & time → Enter details → Instant confirmation',
      'Browse items → Add to bag → Enter delivery/pickup info → Send order',
      'Open app → Tap (+) to log an entry → Instantly see personal stats update',
      'Explore directory/events → View details → Connect or RSVP'
    ]
  },
  {
    id: 'target_platform',
    chapter: 2,
    chapterTitle: 'How It Works',
    number: 5,
    title: 'Where do you picture people using this app the most?',
    guidance: 'Tell us where your customers or team will open it so our team shapes the perfect layout.',
    chips: [
      'On their phones (Seamless on iPhones & Androids right from a link)',
      'Phone apps installed on the home screen',
      'Everywhere (Phones, tablets, and desktop computers)',
      'Countertop tablet or desktop first (Optimized for store counters, iPad kiosks, or office desks)'
    ]
  },
  {
    id: 'admin_and_backoffice',
    chapter: 2,
    chapterTitle: 'How It Works',
    number: 6,
    title: 'How would you and your team like to manage things behind the scenes?',
    guidance: 'Tell us how you want to review incoming requests, update prices or items, and manage your day-to-day.',
    chips: [
      'A dedicated web dashboard on my computer (View calendar, manage bookings, download reports)',
      'A private owner mode on my phone (Update prices, photos, and items on the fly)',
      'Send everything directly to my WhatsApp, Email, or Google Calendar',
      'Just for me (Personal tool, no separate management screen needed)'
    ]
  },

  // Chapter 3: The Look & Vibe
  {
    id: 'theme_mode',
    chapter: 3,
    chapterTitle: 'The Look & Vibe',
    number: 7,
    title: 'How should the app feel on your eyes — bright and fresh, or sleek and dark?',
    guidance: 'Think about the ambiance of your brand and what fits your customers best.',
    chips: [
      'Bright & airy Light Mode (Clean, crisp, inviting white and soft tones)',
      'Sleek & modern Dark Mode (Deep rich blacks, charcoal panels, glowing accents)',
      'Smart Auto-Switch (Automatically follows the user’s phone settings)'
    ]
  },
  {
    id: 'color_scheme_and_vibe',
    chapter: 3,
    chapterTitle: 'The Look & Vibe',
    number: 8,
    title: 'What colors or visual personality fit your brand?',
    guidance: 'Use the interactive color wheel below to pick up to 3 colors, or choose a signature style you love.',
    chips: [
      'Warm & Earthy (Soft creams, terracotta, bakery & lifestyle aesthetic)',
      'Obsidian & Gold (Deep luxury black with rich metallic gold accents)',
      'Cyber & Electric (Neon violet and bold high-energy glow)',
      'Clean Minimalist Slate (Crisp modern tech look with subtle cool blues)',
      '✨ Curate for me (Let Every Nation GG designers craft the perfect palette)'
    ]
  },

  // Chapter 4: Launch & Access
  {
    id: 'access_and_auth',
    chapter: 4,
    chapterTitle: 'Launch & Access',
    number: 9,
    title: 'Do people need an account to use the app, or can they jump right in?',
    guidance: 'Think about how easy you want it to be for first-time visitors versus returning members.',
    chips: [
      'Open to anyone freely (Instant guest access, no passwords needed)',
      'Fast 1-tap sign-in with Google or Apple ID',
      'Email & phone sign-in (Saves order history and member profile)',
      'Private & invite-only (Restricted to approved members or VIP passcodes)',
      'Different roles (Separate access for Customers, Staff, and Owner)'
    ]
  },
  {
    id: 'integrations_and_hardware',
    chapter: 4,
    chapterTitle: 'Launch & Access',
    number: 10,
    title: 'Does the app need to connect with any special tools, maps, or phone features?',
    guidance: 'Mention any everyday apps or phone features you’d love it to work with.',
    chips: [
      'Maps & Location (Show store location, delivery distance, or Google Maps)',
      'Camera & Photo upload (Upload reference photos, receipts, or QR check-in)',
      'Spreadsheet sync (Automatically sync with Google Sheets or CSV)',
      'Chat & messaging (WhatsApp, Viber, or SMS alerts)',
      'Keep it self-contained (No external connections needed)'
    ]
  },
  {
    id: 'notifications_and_alerts',
    chapter: 4,
    chapterTitle: 'Launch & Access',
    number: 11,
    title: 'What reminders or alerts would keep everything running smoothly?',
    guidance: 'Pick what keeps you and your customers on the same page.',
    chips: [
      'Instant confirmation (Receipt sent immediately via Email or SMS)',
      'Scheduled reminder (Friendly alert sent 24 hours & 1 hour before an appointment/pickup)',
      'Instant ping to owner (Instant ping via WhatsApp, Telegram, or Email on new submission)',
      'Order status updates (Notify customer when order is accepted, baking, or ready)',
      'No alerts needed (Quiet mode)'
    ]
  },
  {
    id: 'payments_and_monetization',
    chapter: 4,
    chapterTitle: 'Launch & Access',
    number: 12,
    title: 'How will you handle payments, or is the app 100% free?',
    guidance: 'Let us know how money changes hands in your workflow.',
    chips: [
      '100% Free (No payments or checkout needed)',
      'GCash, Maya & Bank Transfer (Customer uploads a screenshot of their payment slip)',
      'Credit & Debit cards online (Card checkout via Stripe or PayMongo)',
      'Pay in person / Cash on Delivery',
      'Recurring membership or subscription pass'
    ]
  },
  {
    id: 'visual_peg_and_timeline',
    chapter: 4,
    chapterTitle: 'Launch & Access',
    number: 13,
    title: 'Any favorite websites or apps you love the look of, and when would you love to launch?',
    guidance: 'Share links to designs you admire (websites, Instagram, or Dribbble), or pick a benchmark style along with your target launch window.',
    chips: [
      'Clean, boutique & warm • Quick launch in 2–4 weeks',
      'Sleek, premium & polished • Launch in 1–2 months',
      'Modern & minimalist like Apple or Notion • Launch in 1–2 months',
      '✨ Curate the design style & timeline milestones for me'
    ]
  }
];
