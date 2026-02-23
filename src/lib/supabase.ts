import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eayypjagehstednbxafo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVheXlwamFnZWhzdGVkbmJ4YWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MDE3MTUsImV4cCI6MjA4NzM3NzcxNX0.nEI0aoeN3rV4fqNjP9LrjxTQfNCXxF1ushGuqcGkWIs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  company: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  notes: string;
  links: RequestLink[];
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type RequestLink = {
  id: string;
  name: string;
  url: string;
  comments: string;
  created_at: string;
};

export type RequestComment = {
  id: string;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
};

export type Request = {
  id: string;
  request_number: string;
  title: string;
  request_type: 'Animation' | 'Video Editing' | '3D Design' | 'Web Design' | 'Design for Print' | 'Presentation' | 'Market Research' | 'Photography' | 'Videography' | 'Social Media' | 'Digital Marketing' | 'Media Management' | 'Company Events' | 'Brand Design' | 'Brand Management' | 'Pre-Production' | 'Budgeting & Strategy' | 'Team & Logistics' | 'Client Interaction' | 'Directing' | 'Sound Design' | 'Sound Engineering' | 'Project Management' | 'Accounting' | 'Other';
  status: 'submitted' | 'draft' | 'in progress' | 'awaiting feedback' | 'pending approval' | 'completed' | 'canceled';
  due_date: string;
  assigned_to: string;
  details: string;
  client_id: string | null;
  links: RequestLink[];
  comments: RequestComment[];
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type CostTracker = {
  id: string;
  request_id: string;
  user_id: string;
  user_name: string;
  date: string;
  time_spent: number;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type ActivityLog = {
  id: string;
  request_id: string;
  user_id: string;
  action_type: 'created' | 'status_change' | 'due_date_change' | 'details_change';
  old_value?: string;
  new_value?: string;
  created_at: string;
  user?: Profile;
};

export type SMCalendarNote = {
  id: string;
  note_number: string;
  title: string;
  content: string;
  date: string;
  emoji: string;
  color: string;
  request_id?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
};
