-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  username text unique,
  full_name text,
  avatar_url text,
  role text default 'user', -- 'admin', 'author', 'user'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create articles table
create table public.articles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  cover_image text,
  category text,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text, -- Denormalized for simplicity, optional
  published_at timestamp with time zone default timezone('utc'::text, now()),
  views integer default 0,
  likes integer default 0,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.articles enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Articles policies
create policy "Articles are viewable by everyone."
  on public.articles for select
  using ( true );

create policy "Authors and Admins can insert articles."
  on public.articles for insert
  with check ( 
    auth.uid() in (
      select id from public.profiles where role in ('admin', 'author')
    )
  );

create policy "Authors can update their own articles."
  on public.articles for update
  using ( 
    auth.uid() = author_id 
    or 
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

create policy "Authors can delete their own articles."
  on public.articles for delete
  using ( 
    auth.uid() = author_id 
    or 
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- Create comments table
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  article_id uuid references public.articles(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for comments
alter table public.comments enable row level security;

-- Comments policies
create policy "Comments are viewable by everyone."
  on public.comments for select
  using ( true );

create policy "Authenticated users can insert comments."
  on public.comments for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own comments."
  on public.comments for delete
  using ( auth.uid() = user_id or auth.uid() in (select id from public.profiles where role = 'admin') );


-- Function to handle new user signup automatically
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'user'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
