import { QuestionDefinition } from './types';

export const CHAPTERS = [
  { id: 1, title: 'Concept & Reality', subtitle: 'The idea, problem & core user flow' },
  { id: 2, title: 'Experience & Vibe', subtitle: 'Platforms, payments & aesthetic feel' },
  { id: 3, title: 'Launch & Investment', subtitle: 'V1 essentials, timeline & budget' },
] as const;

export const CORE_QUESTIONS: QuestionDefinition[] = [
  // Chapter 1: Concept & Reality
  {
    id: 'concept_and_audience',
    chapter: 1,
    chapterTitle: 'Concept & Reality',
    number: 1,
    title: 'What kind of business or project is this app for?',
    guidance: 'Tell me in a sentence or two. If you already have a clear app idea, share it! If you just know your business type or goal, we can brainstorm together.',
    chips: [
      'For my business (clinic, store, service)',
      'A new startup / app idea',
      'Internal tool to streamline my team',
      'Community or membership platform',
      "I'm not sure — help me brainstorm"
    ]
  },
  {
    id: 'problem_and_workflow',
    chapter: 1,
    chapterTitle: 'Concept & Reality',
    number: 2,
    title: "What's the biggest headache or bottleneck you want this app to solve?",
    guidance: 'Think about your current routine without this app — where do things get messy, slow, lost, or frustrating?',
    chips: [
      'Orders & inquiries get lost in DMs / chat',
      'Messy spreadsheets & manual inventory',
      'Customers have no easy self-service way',
      'Repetitive manual coordination & paperwork',
      'Existing generic tools are too bloated or clunky'
    ]
  },
  {
    id: 'core_user_journey',
    chapter: 1,
    chapterTitle: 'Concept & Reality',
    number: 3,
    title: 'When someone opens the app, what is the single most important thing they do?',
    guidance: 'Walk me through the main path — from opening the app to getting the result or service. (Think about whether users need accounts or can browse as guests).',
    chips: [
      'Browse catalog → guest or account checkout → live order tracking',
      'Select service & date → book slot → automated reminders',
      'Submit inquiry / request → receive live team updates',
      'Log in (Google / phone OTP) → access personal dashboard & records'
    ]
  },

  // Chapter 2: Experience & Vibe
  {
    id: 'platform_and_payments',
    chapter: 2,
    chapterTitle: 'Experience & Vibe',
    number: 4,
    title: 'Where should this app live, and does it need to accept payments?',
    guidance: 'Think about how your audience will access it (iOS/Android App Stores, Web browser) and which payment gateways (GCash, Maya, Stripe, Card, COD) you need.',
    chips: [
      'Mobile App (iOS/Android) + GCash / Maya / Card payments',
      'Responsive Web App (Browser) + Stripe / Card payments',
      'Both Web & Mobile App + Online Payments & COD',
      'Internal Tool / Free (No payments needed)',
      'Manual Payments (Bank transfer slip upload / COD)'
    ]
  },
  {
    id: 'look_feel_inspiration',
    chapter: 2,
    chapterTitle: 'Experience & Vibe',
    number: 5,
    title: 'How should the app look and feel? Any aesthetic styles or apps you love?',
    guidance: 'Think about colors, vibe (clean minimal, sleek dark mode, luxury), and any apps you like — or styles to avoid.',
    chips: [
      'Warm minimal, clean & airy',
      'Sleek dark mode with modern glowing accents',
      'Bold, fast & energetic',
      'Premium, high-end & trustworthy',
      'Avoid: Cluttered, sterile corporate, or outdated look'
    ]
  },

  // Chapter 3: Launch & Investment
  {
    id: 'v1_launch_essentials',
    chapter: 3,
    chapterTitle: 'Launch & Investment',
    number: 6,
    title: 'What absolutely has to be in Version 1 for launch — both for your users and your admin team?',
    guidance: 'Focus on the essentials: customer ordering/booking, notifications, and what tools your admin team needs behind the scenes on Day 1.',
    chips: [
      'Core customer ordering / booking + instant confirmation',
      'Admin dashboard to manage requests, inventory & live status',
      'User accounts & saved order/appointment history',
      'Automated SMS / email / chat notifications',
      'Lean MVP — launch as fast as possible'
    ]
  },
  {
    id: 'timeline_and_budget',
    chapter: 3,
    chapterTitle: 'Launch & Investment',
    number: 7,
    title: 'When are you hoping to launch, and what target budget range have you allocated?',
    guidance: 'This helps Every Nation GG tailor the exact technology architecture, timeline milestones, and build quote to maximize your ROI.',
    chips: [
      'Targeting 4–6 weeks • Lean MVP (₱50k – ₱120k / $1k – $2.5k)',
      'Targeting 2–3 months • Growth V1 (₱150k – ₱350k / $3k – $7k)',
      'Full Platform • Scale tier (₱400k – ₱800k+ / $8k – $15k+)',
      'Flexible timeline — recommend the best balance for our goals',
      'Enterprise / Custom quote based on full scope'
    ]
  }
];
