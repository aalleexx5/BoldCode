/*
  # Create Storage for Request Images

  1. Storage Setup
    - Create `request-images` storage bucket for uploaded images
    - Set up public access for viewing images
    - Configure upload size limits

  2. Security
    - Enable RLS on storage.objects
    - Allow authenticated users to upload images
    - Allow public read access to images
    - Restrict uploads to image files only
*/

-- Create storage bucket for request images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'request-images',
  'request-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload request images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'request-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update own request images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'request-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete own request images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'request-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access to all images
CREATE POLICY "Public can view request images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'request-images');
