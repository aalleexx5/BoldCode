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
  user_id: string;
  user_name: string;
  action: string;
  entity_type: 'request' | 'client' | 'cost_tracker' | 'comment' | 'link';
  entity_id: string;
  details: string;
  created_at: string;
};
