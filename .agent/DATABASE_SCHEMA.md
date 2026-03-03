# Database Schema

## Overview

LiquidMktplace uses Supabase (PostgreSQL). The schema is designed around parametric animations delivered as SaaS embeds — no file downloads, access controlled via tokens tied to subscriptions.

---

## Tables

### 1. profiles
Extends Supabase Auth users.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('none', 'active', 'canceled', 'past_due')) DEFAULT 'none',
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly', NULL)),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
```

---

### 2. animation_types
Top-level categories of animation technology.

```sql
CREATE TABLE animation_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,        -- 'liquid', 'particles', '3d-object', 'svg', 'typography', 'scroll'
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO animation_types (name, slug, description, icon, display_order) VALUES
  ('Liquid & Fluid', 'liquid', 'GLSL shader-based fluid simulations', 'Droplets', 1),
  ('Particles', 'particles', 'Point systems, dust, fire, constellation', 'Sparkles', 2),
  ('3D Objects', '3d-object', 'Animated GLB/GLTF meshes', 'Box', 3),
  ('SVG & 2D', 'svg', 'Canvas and SVG-based animations', 'PenTool', 4),
  ('Typography', 'typography', 'Animated text effects', 'Type', 5),
  ('Scroll & Transitions', 'scroll', 'Scroll-driven and page transition effects', 'Layers', 6);

ALTER TABLE animation_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Animation types are publicly readable"
  ON animation_types FOR SELECT USING (true);
```

---

### 3. animations
Core animation catalog — each row is a parametric animation system.

```sql
CREATE TABLE animations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  animation_type_id UUID REFERENCES animation_types(id) ON DELETE SET NULL,

  -- Parametric system definition
  params_schema JSONB NOT NULL DEFAULT '[]'::JSONB,
  -- Structure: [{ "key": "speed", "type": "float", "min": 0.1, "max": 5, "default": 1, "label": "Speed" }, ...]

  presets JSONB DEFAULT '[]'::JSONB,
  -- Structure: [{ "name": "Lava", "params": { "speed": 1.2, "turbulence": 0.8 } }, ...]

  -- Runtime references (served from CDN, never exposed directly)
  runtime_bundle_url TEXT,    -- CDN path to the animation JS bundle
  shader_id TEXT,             -- Internal reference, not exposed to clients

  -- Visual assets
  preview_video_url TEXT,     -- Autoplay preview video (muted, loop)
  preview_image_url TEXT,     -- Static fallback thumbnail
  screenshots JSONB DEFAULT '[]'::JSONB,

  -- Metadata
  tags TEXT[],
  complexity TEXT CHECK (complexity IN ('simple', 'moderate', 'complex')),
  performance_tier TEXT CHECK (performance_tier IN ('lightweight', 'standard', 'heavy')) DEFAULT 'standard',
  -- lightweight = mobile-safe, heavy = desktop GPU required

  -- Stats
  embed_count INTEGER DEFAULT 0,   -- How many active embeds exist
  view_count INTEGER DEFAULT 0,

  -- Status
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_animations_type ON animations(animation_type_id);
CREATE INDEX idx_animations_published ON animations(is_published);
CREATE INDEX idx_animations_featured ON animations(is_featured);
CREATE INDEX idx_animations_slug ON animations(slug);

ALTER TABLE animations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published animations are publicly readable"
  ON animations FOR SELECT USING (is_published = true);
```

**params_schema example:**
```json
[
  { "key": "speed", "type": "float", "min": 0.1, "max": 5, "default": 1, "label": "Speed" },
  { "key": "turbulence", "type": "float", "min": 0, "max": 1, "default": 0.5, "label": "Turbulence" },
  { "key": "colorA", "type": "color", "default": "#ff4400", "label": "Primary Color" },
  { "key": "colorB", "type": "color", "default": "#0044ff", "label": "Secondary Color" },
  { "key": "noiseScale", "type": "float", "min": 0.1, "max": 10, "default": 2, "label": "Noise Scale" },
  { "key": "glow", "type": "boolean", "default": true, "label": "Enable Glow" }
]
```

---

### 4. user_animations
Animations a user has access to (via subscription or future one-time access).

```sql
CREATE TABLE user_animations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  animation_id UUID REFERENCES animations(id) ON DELETE CASCADE,
  access_type TEXT CHECK (access_type IN ('subscription')) DEFAULT 'subscription',
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, animation_id)
);

CREATE INDEX idx_user_animations_user ON user_animations(user_id);

ALTER TABLE user_animations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own animation access"
  ON user_animations FOR SELECT USING (auth.uid() = user_id);
```

---

### 5. embed_instances
Each configured embed a user has set up. One user can have multiple embeds of the same animation with different parameters.

```sql
CREATE TABLE embed_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  animation_id UUID REFERENCES animations(id) ON DELETE CASCADE,

  -- User-defined config
  name TEXT NOT NULL DEFAULT 'My Animation',   -- User labels their embed
  params JSONB NOT NULL DEFAULT '{}'::JSONB,    -- Current parameter values
  preset_name TEXT,                             -- Last applied preset (optional)

  -- Token for embed authentication
  token TEXT UNIQUE NOT NULL,                   -- e.g. tok_live_xxxxx
  token_active BOOLEAN DEFAULT true,

  -- Usage tracking
  last_loaded_at TIMESTAMP WITH TIME ZONE,
  load_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_embeds_user ON embed_instances(user_id);
CREATE INDEX idx_embeds_token ON embed_instances(token);
CREATE INDEX idx_embeds_animation ON embed_instances(animation_id);

ALTER TABLE embed_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own embeds"
  ON embed_instances FOR ALL USING (auth.uid() = user_id);
```

---

### 6. favorites
User bookmarks for animations they like.

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  animation_id UUID REFERENCES animations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, animation_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL USING (auth.uid() = user_id);
```

---

### 7. embed_events (analytics)
Lightweight event log for embed usage.

```sql
CREATE TABLE embed_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  embed_instance_id UUID REFERENCES embed_instances(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('load', 'error', 'param_update')),
  metadata JSONB DEFAULT '{}'::JSONB,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_embed ON embed_events(embed_instance_id);
CREATE INDEX idx_events_occurred ON embed_events(occurred_at);

-- No RLS needed — written server-side only via service role
```

---

## Views

### user_dashboard_view
Full picture of a user's animations and embeds.

```sql
CREATE VIEW user_dashboard_view AS
SELECT
  ua.user_id,
  a.id AS animation_id,
  a.title,
  a.slug,
  a.short_description,
  at.name AS animation_type,
  a.preview_image_url,
  a.preview_video_url,
  ua.access_type,
  ua.granted_at,
  COUNT(ei.id) AS embed_count
FROM user_animations ua
JOIN animations a ON ua.animation_id = a.id
LEFT JOIN animation_types at ON a.animation_type_id = at.id
LEFT JOIN embed_instances ei ON ei.animation_id = a.id AND ei.user_id = ua.user_id
WHERE a.is_published = true
GROUP BY ua.user_id, a.id, a.title, a.slug, a.short_description,
         at.name, a.preview_image_url, a.preview_video_url, ua.access_type, ua.granted_at;
```

---

## Functions

### Grant access to all animations on subscription

```sql
CREATE OR REPLACE FUNCTION grant_all_animation_access(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO user_animations (user_id, animation_id, access_type)
  SELECT p_user_id, id, 'subscription'
  FROM animations
  WHERE is_published = true
  ON CONFLICT (user_id, animation_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Revoke subscription access

```sql
CREATE OR REPLACE FUNCTION revoke_subscription_access(p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Remove access records
  DELETE FROM user_animations
  WHERE user_id = p_user_id AND access_type = 'subscription';

  -- Deactivate all embed tokens
  UPDATE embed_instances
  SET token_active = false
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Validate embed token

```sql
CREATE OR REPLACE FUNCTION validate_embed_token(p_token TEXT)
RETURNS TABLE (
  embed_id UUID,
  animation_id UUID,
  user_id UUID,
  params JSONB,
  runtime_bundle_url TEXT,
  is_valid BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ei.id,
    ei.animation_id,
    ei.user_id,
    ei.params,
    a.runtime_bundle_url,
    (ei.token_active AND p.subscription_status = 'active') AS is_valid
  FROM embed_instances ei
  JOIN animations a ON ei.animation_id = a.id
  JOIN profiles p ON ei.user_id = p.id
  WHERE ei.token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Generate embed token

```sql
CREATE OR REPLACE FUNCTION generate_embed_token()
RETURNS TEXT AS $$
BEGIN
  RETURN 'tok_live_' || encode(gen_random_bytes(24), 'base64');
END;
$$ LANGUAGE plpgsql;
```

---

## Triggers

```sql
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_animations_updated_at
  BEFORE UPDATE ON animations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_embeds_updated_at
  BEFORE UPDATE ON embed_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate token on embed creation
CREATE OR REPLACE FUNCTION set_embed_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.token IS NULL OR NEW.token = '' THEN
    NEW.token = generate_embed_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER embed_token_generate
  BEFORE INSERT ON embed_instances
  FOR EACH ROW EXECUTE FUNCTION set_embed_token();
```

---

## Migration Order

1. `profiles`
2. `animation_types` + seed data
3. `animations`
4. `user_animations`
5. `embed_instances`
6. `favorites`
7. `embed_events`
8. Views
9. Functions
10. Triggers