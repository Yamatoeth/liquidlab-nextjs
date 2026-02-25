-- Initial schema for LiquidMktplace (partial, from DATABASE_SCHEMA.md)
-- Run these in Supabase SQL editor or via psql against the project DB.

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) profiles (extend auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('none', 'active', 'canceled', 'past_due')) DEFAULT 'none',
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2) categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_public_read ON categories FOR SELECT USING (true);

-- 3) tags + snippet_tags
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS snippet_tags (
  snippet_id UUID,
  tag_id UUID,
  PRIMARY KEY (snippet_id, tag_id)
);
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY tags_public_read ON tags FOR SELECT USING (true);
ALTER TABLE snippet_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY snippet_tags_public_read ON snippet_tags FOR SELECT USING (true);

-- 4) snippets
CREATE TABLE IF NOT EXISTS snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  liquid_code TEXT NOT NULL,
  css_code TEXT,
  javascript_code TEXT,
  preview_image_url TEXT,
  demo_video_url TEXT,
  screenshots JSONB DEFAULT '[]'::JSONB,
  compatible_themes TEXT[],
  shopify_version TEXT DEFAULT '2.0',
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  installation_time TEXT,
  installation_steps JSONB,
  configuration_options JSONB,
  downloads_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_snippets_category ON snippets(category_id);
CREATE INDEX IF NOT EXISTS idx_snippets_published ON snippets(is_published);
CREATE INDEX IF NOT EXISTS idx_snippets_featured ON snippets(is_featured);
CREATE INDEX IF NOT EXISTS idx_snippets_slug ON snippets(slug);
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;
CREATE POLICY snippets_published_read ON snippets FOR SELECT USING (is_published = true);

-- 5) purchases
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  snippet_id UUID REFERENCES snippets(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT CHECK (status IN ('pending', 'completed', 'refunded', 'failed')) DEFAULT 'completed',
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, snippet_id)
);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_snippet ON purchases(snippet_id);
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY purchases_own_select ON purchases FOR SELECT USING (auth.uid() = user_id);
-- Allow users to create purchases for themselves (with server-side validation recommended)
CREATE POLICY purchases_insert_own ON purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Allow users to update their own purchases (e.g., status updates from webhook should be server-side)
CREATE POLICY purchases_update_own ON purchases FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Prevent users from deleting purchases by default; server should handle refunds

-- 6) user_snippet_access
CREATE TABLE IF NOT EXISTS user_snippet_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  snippet_id UUID REFERENCES snippets(id) ON DELETE CASCADE,
  access_type TEXT CHECK (access_type IN ('purchase', 'subscription')),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, snippet_id)
);
CREATE INDEX IF NOT EXISTS idx_access_user ON user_snippet_access(user_id);
CREATE INDEX IF NOT EXISTS idx_access_snippet ON user_snippet_access(snippet_id);
ALTER TABLE user_snippet_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY access_own_select ON user_snippet_access FOR SELECT USING (auth.uid() = user_id);
-- Allow users to be granted access only by server processes (e.g., webhooks), but allow users to view their access.
-- If allowing users to self-grant access via purchases, enable INSERT with check below.
CREATE POLICY access_insert_by_user ON user_snippet_access FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Allow users to remove their own access (optional)
CREATE POLICY access_delete_own ON user_snippet_access FOR DELETE USING (auth.uid() = user_id);

-- 7) favorites
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  snippet_id UUID REFERENCES snippets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, snippet_id)
);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY favorites_view_own ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY favorites_insert_own ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY favorites_delete_own ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Recommendation: keep `favorites` RLS strict so users only mutate their own rows.
-- For server-side processes (webhooks, admin tools) use the Supabase service_role key
-- which bypasses RLS. Example server-side insertion uses the service role client:
-- const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
-- supabaseAdmin.from('favorites').insert([{ user_id, snippet_id }])


-- Basic helpers: create a role-check function (optional)
-- You can extend profiles with an `is_admin` boolean and update the function accordingly.
-- Example function to check admin via profiles.is_admin column (create column separately if used):
-- CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
-- BEGIN
--   RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (profiles->>'is_admin')::boolean = true);
-- END;
-- $$ LANGUAGE plpgsql STABLE;

-- 8) views and functions (examples)
CREATE OR REPLACE VIEW user_library_view AS
SELECT 
  usa.user_id,
  s.id as snippet_id,
  s.title,
  s.slug,
  s.description,
  s.category_id,
  c.name as category_name,
  s.preview_image_url,
  usa.access_type,
  usa.granted_at
FROM user_snippet_access usa
JOIN snippets s ON usa.snippet_id = s.id
LEFT JOIN categories c ON s.category_id = c.id
WHERE s.is_published = true;

-- timestamp trigger helper
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_snippets_updated_at
  BEFORE UPDATE ON snippets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9) subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  price_id TEXT,
  plan TEXT,
  status TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscription_id ON subscriptions(stripe_subscription_id);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_select_own ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY subscriptions_insert_own ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY subscriptions_update_own ON subscriptions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
