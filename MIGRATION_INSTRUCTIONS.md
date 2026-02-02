# Supabase Migration Instructions

## Problem
The `/gacha/free` route is causing a server error because the `gachas` and `ticket_types` tables in your Supabase database are either missing data or not properly configured.

## Required Tables and Data

### 1. Verify `ticket_types` table exists and has data

Run this SQL in your Supabase SQL Editor:

```sql
-- Check if table exists and has data
SELECT * FROM ticket_types;
```

If empty or missing, run:

```sql
-- Create ticket_types table (if not exists)
CREATE TABLE IF NOT EXISTS ticket_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  color VARCHAR(20),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert initial ticket types
INSERT INTO ticket_types (name, code, color, sort_order) 
VALUES
  ('フリーチケット', 'free', 'green', 1),
  ('ベーシックチケット', 'basic', 'yellow', 2),
  ('エピックチケット', 'epic', 'orange', 3),
  ('プレミアムチケット', 'premium', 'red', 4),
  ('EXチケット', 'ex', 'purple', 5)
ON CONFLICT (code) DO NOTHING;
```

### 2. Verify `gachas` table exists and links to `ticket_types`

Run this SQL:

```sql
-- Check if gachas table exists
SELECT 
  g.id, 
  g.name, 
  g.ticket_type_id,
  tt.code as ticket_code,
  tt.name as ticket_name,
  g.min_rarity, 
  g.max_rarity,
  g.is_active
FROM gachas g
LEFT JOIN ticket_types tt ON g.ticket_type_id = tt.id;
```

If empty or the schema is wrong, run:

```sql
-- Create gachas table with proper foreign key
CREATE TABLE IF NOT EXISTS gachas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  ticket_type_id UUID REFERENCES ticket_types(id) NOT NULL,
  color VARCHAR(20),
  min_rarity INT NOT NULL CHECK (min_rarity >= 1 AND min_rarity <= 12),
  max_rarity INT NOT NULL CHECK (max_rarity >= 1 AND max_rarity <= 12),
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Get ticket type IDs
DO $$
DECLARE
  free_id UUID;
  basic_id UUID;
  epic_id UUID;
  premium_id UUID;
  ex_id UUID;
BEGIN
  SELECT id INTO free_id FROM ticket_types WHERE code = 'free';
  SELECT id INTO basic_id FROM ticket_types WHERE code = 'basic';
  SELECT id INTO epic_id FROM ticket_types WHERE code = 'epic';
  SELECT id INTO premium_id FROM ticket_types WHERE code = 'premium';
  SELECT id INTO ex_id FROM ticket_types WHERE code = 'ex';

  -- Insert gacha definitions
  INSERT INTO gachas (name, ticket_type_id, color, min_rarity, max_rarity, sort_order, is_active)
  VALUES
    ('フリー', free_id, 'green', 1, 3, 1, true),
    ('ベーシック', basic_id, 'yellow', 1, 6, 2, true),
    ('エピック', epic_id, 'orange', 3, 8, 3, true),
    ('プレミアム', premium_id, 'red', 5, 10, 4, true),
    ('EX', ex_id, 'purple', 7, 12, 5, true)
  ON CONFLICT DO NOTHING;
END $$;
```

### 3. Create sample horses (optional but recommended)

```sql
-- Create horses table
CREATE TABLE IF NOT EXISTS horses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  rarity INT NOT NULL CHECK (rarity >= 1 AND rarity <= 12),
  description TEXT,
  card_image_url TEXT,
  silhouette_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Insert sample horses
INSERT INTO horses (name, name_en, rarity, description, card_image_url, is_active)
VALUES
  ('ディープインパクト', 'Deep Impact', 12, '衝撃の無敗三冠馬', '/assets/dance-in-the-dark.png', true),
  ('ナリタブライアン', 'Narita Brian', 11, '影の帝王と呼ばれた三冠馬', '/assets/dance-in-the-dark.png', true),
  ('ダンスインザダーク', 'Dance In The Dark', 9, '闇の中で踊る者', '/assets/dance-in-the-dark.png', true),
  ('エルコンドルパサー', 'El Condor Pasa', 8, '南米の翼', '/assets/dance-in-the-dark.png', true),
  ('サクラバクシンオー', 'Sakura Bakushin O', 7, '爆走のスプリンター', '/assets/dance-in-the-dark.png', true),
  ('ナイスネイチャ', 'Nice Nature', 6, '永遠の2着馬', '/assets/dance-in-the-dark.png', true),
  ('ツインターボ', 'Twin Turbo', 5, '逃げ馬の鑑', '/assets/dance-in-the-dark.png', true),
  ('メイショウドトウ', 'Meisho Doto', 4, '晩成の重賞馬', '/assets/dance-in-the-dark.png', true),
  ('ハルウララ', 'Haru Urara', 3, '113戦0勝の伝説', '/assets/dance-in-the-dark.png', true),
  ('地方馬A', 'Local Horse A', 2, '地方競馬の戦士', '/assets/dance-in-the-dark.png', true)
ON CONFLICT DO NOTHING;
```

### 4. Create gacha_rates table and sample data

```sql
-- Create gacha_rates table
CREATE TABLE IF NOT EXISTS gacha_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gacha_id UUID REFERENCES gachas(id) ON DELETE CASCADE NOT NULL,
  horse_id UUID REFERENCES horses(id) ON DELETE CASCADE NOT NULL,
  rate DECIMAL(5,2) NOT NULL CHECK (rate >= 0 AND rate <= 100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(gacha_id, horse_id)
);

-- Add sample rates for free gacha
DO $$
DECLARE
  free_gacha_id UUID;
  horse_record RECORD;
BEGIN
  SELECT id INTO free_gacha_id FROM gachas WHERE name = 'フリー' LIMIT 1;
  
  FOR horse_record IN (SELECT id, rarity FROM horses WHERE rarity <= 3 AND is_active = true)
  LOOP
    INSERT INTO gacha_rates (gacha_id, horse_id, rate)
    VALUES (free_gacha_id, horse_record.id, 
      CASE 
        WHEN horse_record.rarity = 3 THEN 5.0
        WHEN horse_record.rarity = 2 THEN 20.0
        ELSE 75.0
      END
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
```

### 5. Enable RLS and create policies

```sql
-- Enable Row Level Security
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE gachas ENABLE ROW LEVEL SECURITY;
ALTER TABLE horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_rates ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can view ticket_types" ON ticket_types
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view active gachas" ON gachas
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active horses" ON horses
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view gacha_rates" ON gacha_rates
  FOR SELECT USING (true);
```

### 6. Verify everything works

```sql
-- This should return 5 gachas with their ticket info
SELECT 
  g.id,
  g.name,
  g.min_rarity,
  g.max_rarity,
  g.is_active,
  tt.code as ticket_code,
  tt.name as ticket_name
FROM gachas g
INNER JOIN ticket_types tt ON g.ticket_type_id = tt.id
WHERE g.is_active = true
ORDER BY g.sort_order;

-- This should return at least 10 horses
SELECT id, name, rarity FROM horses WHERE is_active = true ORDER BY rarity DESC;

-- This should return rates for free gacha
SELECT 
  gr.rate,
  h.name,
  h.rarity
FROM gacha_rates gr
INNER JOIN horses h ON gr.horse_id = h.id
INNER JOIN gachas g ON gr.gacha_id = g.id
WHERE g.name = 'フリー';
```

## After Running SQL

1. Wait 1-2 minutes for Supabase to process
2. Redeploy your Vercel application or wait for auto-deploy
3. Visit https://umaroyale.com/gacha/free
4. The page should now load without errors

## Troubleshooting

If you still see errors:
1. Check Vercel logs for the exact error
2. Verify all SQL ran successfully in Supabase
3. Check that RLS policies are active
4. Ensure your Supabase environment variables are correct in Vercel
