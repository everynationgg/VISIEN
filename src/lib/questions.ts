import { QuestionDefinition } from './types';

export const CHAPTERS = [
  { id: 1, title: 'The Vision', subtitle: 'Understanding your idea & problem' },
  { id: 2, title: 'The Experience', subtitle: 'Aesthetics, look & core actions' },
  { id: 3, title: 'The Blueprint', subtitle: 'Workflows, V1 scope & infrastructure' },
] as const;

export const CORE_QUESTIONS: QuestionDefinition[] = [
  // Chapter 1: The Vision
  {
    id: 'app_concept',
    chapter: 1,
    chapterTitle: 'The Vision',
    number: 1,
    title: 'Tell me about the app you have in mind.',
    guidance: "Imagine you're explaining the app to someone who has never heard the idea before. What is it, and what would you like it to do?",
    chips: [
      'Customer-facing booking app',
      'Community & membership portal',
      'E-commerce / shop experience',
      'Internal team tool',
      'Content & educational platform'
    ]
  },
  {
    id: 'problem',
    chapter: 1,
    chapterTitle: 'The Vision',
    number: 2,
    title: 'What problem do you want the app to solve?',
    guidance: 'Think about something currently inconvenient, slow, confusing, expensive, repetitive, or missing.',
    chips: [
      'Orders/bookings are too chaotic',
      'Hard to keep users engaged',
      'Manual repetitive paperwork',
      'Information is scattered everywhere',
      'No convenient mobile access'
    ]
  },
  {
    id: 'users',
    chapter: 1,
    chapterTitle: 'The Vision',
    number: 3,
    title: 'Who do you imagine using this app?',
    guidance: 'Think about customers, employees, students, members, visitors, yourself, etc.',
    chips: [
      'Paying customers & clients',
      'Internal team / staff members',
      'Younger mobile-first audience',
      'Community members',
      'Business owners & managers'
    ]
  },
  {
    id: 'context_of_use',
    chapter: 1,
    chapterTitle: 'The Vision',
    number: 4,
    title: 'When do you imagine someone opening the app?',
    guidance: 'Think about the moment—what is happening immediately before they open it, and what are they trying to accomplish?',
    chips: [
      'On-the-go during their daily routine',
      'Right when they need to make a quick purchase',
      'At work when updating project progress',
      'During leisure or community browsing'
    ]
  },

  // Chapter 2: The Experience
  {
    id: 'first_screen',
    chapter: 2,
    chapterTitle: 'The Experience',
    number: 5,
    title: 'When they open the app, what would you want them to see first?',
    guidance: 'Imagine the first 5 seconds—what information, action, or experience should immediately be in front of them?',
    chips: [
      'Clean search & featured items',
      'A warm personalized greeting & status',
      'One prominent action button to begin',
      'Feed of latest updates & activity'
    ]
  },
  {
    id: 'core_action',
    chapter: 2,
    chapterTitle: 'The Experience',
    number: 6,
    title: 'What is the most important thing you want someone to be able to do?',
    guidance: 'If the app could do only one thing really well, what would it be?',
    chips: [
      'Browse & order in under 30 seconds',
      'Book an appointment effortlessly',
      'Connect & chat with staff or members',
      'Track progress & receive updates'
    ]
  },
  {
    id: 'result_next_step',
    chapter: 2,
    chapterTitle: 'The Experience',
    number: 7,
    title: 'After they do that, what should happen?',
    guidance: 'Think about the next step—confirmation, result, continuation, contact, payment, etc.',
    chips: [
      'Instant visual receipt / confirmation',
      'Push notification & status tracker',
      'Prompt to share or return soon',
      'Handoff to an administrator'
    ]
  },
  {
    id: 'emotional_ux_feel',
    chapter: 2,
    chapterTitle: 'The Experience',
    number: 8,
    title: 'How do you want the app to feel when someone uses it?',
    guidance: 'Choose what matches your vision or describe it in your own words.',
    chips: [
      'Light & simple',
      'Fast & energetic',
      'Premium & sophisticated',
      'Playful & welcoming',
      'Calm & trustworthy',
      'Powerful & professional'
    ]
  },
  {
    id: 'visual_direction',
    chapter: 2,
    chapterTitle: 'The Experience',
    number: 9,
    title: 'What do you imagine the app looking like?',
    guidance: 'Think about colors, shapes, typography, imagery, animations, layout, atmosphere, and apps you love.',
    chips: [
      'Warm minimal & airy cream/white',
      'Bold vibrant colors with subtle glow',
      'Sleek modern cards with micro-animations',
      'High-contrast clean typography'
    ]
  },
  {
    id: 'anti_patterns',
    chapter: 2,
    chapterTitle: 'The Experience',
    number: 10,
    title: 'What do you definitely NOT want it to look or feel like?',
    guidance: 'What would turn you or your users off?',
    chips: [
      'Too corporate & sterile',
      'Cluttered & confusing',
      'Childish',
      'Dark & intimidating',
      'Flashy / gimmicky',
      'Outdated & slow'
    ]
  },

  // Chapter 3: The Blueprint
  {
    id: 'business_relationship',
    chapter: 3,
    chapterTitle: 'The Blueprint',
    number: 11,
    title: 'How would this app fit into your business or organization?',
    guidance: 'Think about what changes for you, your employees, your customers, or your operations.',
    chips: [
      'Saves hours of manual coordination daily',
      'Opens a direct new revenue stream',
      'Elevates our brand reputation',
      'Centralizes customer relationships'
    ]
  },
  {
    id: 'current_process',
    chapter: 3,
    chapterTitle: 'The Blueprint',
    number: 12,
    title: 'How do you handle this today?',
    guidance: 'How do you currently run things without this app?',
    chips: [
      'Messenger / WhatsApp DMs',
      'Spreadsheets & manual notes',
      'Phone calls',
      'Paper forms',
      'Another generic app that is frustrating'
    ]
  },
  {
    id: 'v1_requirements',
    chapter: 3,
    chapterTitle: 'The Blueprint',
    number: 13,
    title: 'What absolutely needs to be in the first version?',
    guidance: 'Think about the essential features that would make the first version genuinely useful without bloating the scope.',
    chips: [
      'User auth & basic profile',
      'Core ordering / booking flow',
      'Simple admin view for me to manage it',
      'Automated email/chat notifications'
    ]
  },
  {
    id: 'future_vision',
    chapter: 3,
    chapterTitle: 'The Blueprint',
    number: 14,
    title: 'If the app succeeds, what would you eventually want it to become?',
    guidance: 'Think beyond the first version and imagine where you would like the idea to go.',
    chips: [
      'Full multi-location scale',
      'AI assistant built into the app',
      'Public app store launch with subscriptions',
      'Complete ecosystem with client portal'
    ]
  },
  {
    id: 'infrastructure_preference',
    chapter: 3,
    chapterTitle: 'The Blueprint',
    number: 15,
    title: 'How would you prefer your app’s technical infrastructure to be managed?',
    guidance: 'This is for planning only—you are not purchasing anything right now. We simply want to understand how you would like hosting, databases, and services handled.',
    chips: [
      'Every Nation GG will manage them for me',
      'I will provide my own accounts & ownership',
      'A combination of both',
      "I'm not sure yet — I'd like ENGG to recommend"
    ]
  }
];
