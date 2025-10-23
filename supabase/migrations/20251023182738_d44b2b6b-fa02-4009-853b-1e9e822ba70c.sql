-- Create contacts table for storing contact form submissions
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert contact messages (public form)
CREATE POLICY "Anyone can submit contact messages" 
ON public.contacts 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_contacts_created_at ON public.contacts(created_at DESC);

-- Add a comment
COMMENT ON TABLE public.contacts IS 'Stores contact form submissions from the website';