create table public.mints (
  id uuid default gen_random_uuid() primary key,
  name text,
  description text,
  image_url text,
  creator text,
  royalty_percent numeric,
  signature text,
  created_at timestamptz default now()
);
