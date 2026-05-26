-- OpenHeads Database Schema for Supabase
-- Run this in the Supabase SQL Editor

-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  is_guest BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  stats JSONB DEFAULT '{"total_games": 0, "total_correct": 0, "total_skipped": 0, "best_score": 0, "total_played_cards": 0}'
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read any profile"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Enable pg_trgm for full text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- PACKS
-- ============================================
CREATE TABLE packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  language TEXT DEFAULT 'en',
  tags TEXT[] DEFAULT '{}',
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  favorites_count INTEGER DEFAULT 0,
  plays_count INTEGER DEFAULT 0,
  cards_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_packs_visibility ON packs(visibility);
CREATE INDEX idx_packs_author ON packs(author_id);
CREATE INDEX idx_packs_category ON packs(category);
CREATE INDEX idx_packs_plays ON packs(plays_count DESC);
CREATE INDEX idx_packs_created ON packs(created_at DESC);
CREATE INDEX idx_packs_title_search ON packs USING gin(title gin_trgm_ops);

ALTER TABLE packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read public packs"
  ON packs FOR SELECT
  USING (visibility = 'public' OR visibility = 'unlisted' OR author_id = auth.uid());

CREATE POLICY "Users can create packs"
  ON packs FOR INSERT
  WITH CHECK (auth.uid() = author_id OR author_id IN (SELECT id FROM users WHERE is_guest = true));

CREATE POLICY "Authors can update own packs"
  ON packs FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own packs"
  ON packs FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- CARDS
-- ============================================
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID REFERENCES packs(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  image_url TEXT,
  gif_url TEXT,
  aliases TEXT[] DEFAULT '{}',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cards_pack ON cards(pack_id);
CREATE INDEX idx_cards_order ON cards(pack_id, "order");

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cards readable with pack"
  ON cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM packs WHERE packs.id = cards.pack_id
      AND (packs.visibility IN ('public', 'unlisted') OR packs.author_id = auth.uid())
    )
  );

CREATE POLICY "Authors can manage cards"
  ON cards FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM packs WHERE packs.id = cards.pack_id AND packs.author_id = auth.uid())
  );

CREATE POLICY "Authors can update cards"
  ON cards FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM packs WHERE packs.id = cards.pack_id AND packs.author_id = auth.uid())
  );

CREATE POLICY "Authors can delete cards"
  ON cards FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM packs WHERE packs.id = cards.pack_id AND packs.author_id = auth.uid())
  );

-- ============================================
-- FAVORITES
-- ============================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  pack_id UUID REFERENCES packs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, pack_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_pack ON favorites(pack_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- GAME SESSIONS
-- ============================================
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID REFERENCES packs(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  total_cards INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 60,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sessions_user ON game_sessions(user_id);
CREATE INDEX idx_sessions_pack ON game_sessions(pack_id);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions"
  ON game_sessions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create sessions"
  ON game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============================================
-- ROUNDS
-- ============================================
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  result TEXT CHECK (result IN ('correct', 'skipped', 'timeout')),
  duration_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rounds_session ON rounds(session_id);

ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rounds readable with session"
  ON rounds FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM game_sessions WHERE game_sessions.id = rounds.session_id)
  );

CREATE POLICY "Users can create rounds"
  ON rounds FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM game_sessions WHERE game_sessions.id = rounds.session_id)
  );

-- ============================================
-- REPORTS
-- ============================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID REFERENCES packs(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reports_status ON reports(status);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can read reports"
  ON reports FOR SELECT
  USING (auth.uid() IN (SELECT id FROM users WHERE email IN (SELECT unnest(current_setting('app.admin_emails')::text[]))));

-- ============================================
-- ROOMS (multiplayer)
-- ============================================
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  host_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pack_id UUID REFERENCES packs(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'ended')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_status ON rooms(status);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read rooms"
  ON rooms FOR SELECT
  USING (true);

CREATE POLICY "Users can create rooms"
  ON rooms FOR INSERT
  WITH CHECK (auth.uid() = host_id);

-- ============================================
-- ROOM PLAYERS
-- ============================================
CREATE TABLE room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  is_host BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_players_room ON room_players(room_id);

ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read players"
  ON room_players FOR SELECT
  USING (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-increment favorites count
CREATE OR REPLACE FUNCTION increment_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE packs SET favorites_count = favorites_count + 1 WHERE id = NEW.pack_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE packs SET favorites_count = GREATEST(0, favorites_count - 1) WHERE id = OLD.pack_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_favorite_added
  AFTER INSERT ON favorites
  FOR EACH ROW EXECUTE FUNCTION increment_favorites_count();

CREATE TRIGGER on_favorite_removed
  AFTER DELETE ON favorites
  FOR EACH ROW EXECUTE FUNCTION decrement_favorites_count();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_pack_updated
  BEFORE UPDATE ON packs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Increment pack plays
CREATE OR REPLACE FUNCTION increment_pack_plays(pack_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE packs SET plays_count = plays_count + 1 WHERE id = pack_id;
END;
$$ LANGUAGE plpgsql;

-- Create user on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


