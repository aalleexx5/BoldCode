import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAlgl_5ww2V01BR_aQqPSzjprqVxzzP3WY",
  authDomain: "job-tracker-6df94.firebaseapp.com",
  projectId: "job-tracker-6df94",
  storageBucket: "job-tracker-6df94.firebasestorage.app",
  messagingSenderId: "221811935787",
  appId: "1:221811935787:web:65e5e589c050bd72cef86e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

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
  notes: string;
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
  request_type: 'animation' | 'web design' | 'edit' | 'social media' | 'presentation' | 'text copy';
  status: 'submitted' | 'draft' | 'in progress' | 'awaiting feedback' | 'pending approval' | 'completed' | 'canceled';
  due_date: string;
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
