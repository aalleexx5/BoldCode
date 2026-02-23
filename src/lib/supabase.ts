import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
  name: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Request = {
  id: string;
  request_number: string;
  title: string;
  request_type: 'animation' | 'web design' | 'edit' | 'social media' | 'presentation' | 'text copy';
  status: 'submitted' | 'in progress' | 'canceled' | 'pending approval' | 'awaiting feedback' | 'completed';
  due_date: string;
  details: string;
  client_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type RequestLink = {
  id: string;
  request_id: string;
  name: string;
  url: string;
  comments: string;
  created_at: string;
};

export type RequestComment = {
  id: string;
  request_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user?: Profile;
};
