/*
  # Create Initial Schema for Client Management System

  ## Overview
  This migration creates the core database schema for a client management and request tracking system.

  ## New Tables

  ### 1. profiles
  User profile information linked to auth.users
  - id (uuid, primary key) - References auth.users
  - email (text) - User's email address
  - full_name (text) - User's full name
  - created_at (timestamptz) - Account creation timestamp
  - updated_at (timestamptz) - Last update timestamp

  ### 2. clients
  Client information and contact details
  - id (uuid, primary key) - Unique client identifier
  - name (text, required) - Client name
  - email (text) - Client email address
  - phone (text) - Client phone number
  - company (text) - Client company name
  - notes (text) - Additional notes about client
  - created_by (uuid, required) - References profiles(id)
  - created_at (timestamptz) - Record creation timestamp
  - updated_at (timestamptz) - Last update timestamp

  ### 3. requests
  Service requests and project tracking
  - id (uuid, primary key) - Unique request identifier
  - title (text, required) - Request title
  - description (text) - Detailed description (rich text)
  - client_id (uuid, required) - References clients(id)
  - status (text) - Request status: 'new', 'in-progress', 'completed', 'on-hold'
  - priority (text) - Priority level: 'low', 'medium', 'high', 'urgent'
  - assigned_to (uuid) - References profiles(id)
  - due_date (date) - Expected completion date
  - estimated_cost (numeric) - Estimated cost in dollars
  - actual_cost (numeric) - Actual cost in dollars
  - created_by (uuid, required) - References profiles(id)
  - created_at (timestamptz) - Record creation timestamp
  - updated_at (timestamptz) - Last update timestamp

  ### 4. comments
  Comments and updates on requests
  - id (uuid, primary key) - Unique comment identifier
  - request_id (uuid, required) - References requests(id)
  - user_id (uuid, required) - References profiles(id)
  - content (text, required) - Comment text
  - created_at (timestamptz) - Comment creation timestamp

  ### 5. links
  External links associated with requests
  - id (uuid, primary key) - Unique link identifier
  - request_id (uuid, required) - References requests(id)
  - url (text, required) - Link URL
  - title (text) - Link title/description
  - created_at (timestamptz) - Link creation timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Profiles: Users can view all profiles, but only update their own
  - Clients: Users can view and manage all clients
  - Requests: Users can view and manage all requests
  - Comments: Users can view all comments and create their own
  - Links: Users can view and manage links for requests they can access
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  company text,
  notes text,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  status text DEFAULT 'new' CHECK (status IN ('new', 'in-progress', 'completed', 'on-hold')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  due_date date,
  estimated_cost numeric(10, 2) DEFAULT 0,
  actual_cost numeric(10, 2) DEFAULT 0,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_requests_client_id ON requests(client_id);
CREATE INDEX IF NOT EXISTS idx_requests_assigned_to ON requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_comments_request_id ON comments(request_id);
CREATE INDEX IF NOT EXISTS idx_links_request_id ON links(request_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for clients
CREATE POLICY "Users can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update all clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete all clients"
  ON clients FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for requests
CREATE POLICY "Users can view all requests"
  ON requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert requests"
  ON requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update all requests"
  ON requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete all requests"
  ON requests FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for comments
CREATE POLICY "Users can view all comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for links
CREATE POLICY "Users can view all links"
  ON links FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert links"
  ON links FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update links"
  ON links FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete links"
  ON links FOR DELETE
  TO authenticated
  USING (true);