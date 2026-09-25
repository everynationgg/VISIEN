export type SessionStatus = 'not_started' | 'in_progress' | 'completed' | 'expired';

export interface Session {
  id: string;
  token: string;
  client_name: string | null;
  company: string | null;
  email: string | null;
  status: SessionStatus;
  current_question_index: number;
  current_chapter: 1 | 2 | 3;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  expires_at: string | null;
}

export type MessageRole = 'enos' | 'client' | 'system';

export interface Message {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  question_id?: string;
  is_follow_up?: boolean;
  created_at: string;
}

export interface AppBrief {
  id: string;
  session_id: string;
  client_name: string;
  company?: string;
  project_title: string;
  vision_summary: string;
  problem_statement: string;
  target_users: string;
  moment_of_use?: string;
  first_screen_experience?: string;
  core_action: string;
  expected_outcome?: string;
  target_platform?: string;
  payments_integrations?: string;
  target_timeline?: string;
  emotional_ux_feel: string[];
  visual_direction: string;
  anti_patterns: string[];
  business_impact?: string;
  current_workflow: string;
  v1_essential_features: string[];
  future_horizon?: string;
  infrastructure_preference: string;
  additional_notes?: string;
  raw_transcript_url?: string;
  raw_json?: any;
  created_at: string;
}

export interface QuestionDefinition {
  id: string;
  chapter: 1 | 2 | 3;
  chapterTitle: string;
  number: number;
  title: string;
  guidance: string;
  chips?: string[];
}
