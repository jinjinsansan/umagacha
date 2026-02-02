-- ============================================
-- UMA ROYALE Supabase Migration SQL
-- ============================================
-- このSQLを順番にSupabase SQL Editorで実行してください
-- 各セクションごとに実行し、エラーがないか確認してください

-- ============================================
-- STEP 1: ticket_types テーブル作成と初期データ
-- ============================================

CREATE TABLE IF NOT EXISTS ticket_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  color VARCHAR(20),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO ticket_types (name, code, color, sort_order) 
VALUES
  ('フリーチケット', 'free', 'green', 1),
  ('ベーシックチケット', 'basic', 'yellow', 2),
  ('エピックチケット', 'epic', 'orange', 3),
  ('プレミアムチケット', 'premium', 'red', 4),
  ('EXチケット', 'ex', 'purple', 5)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- STEP 2: gachas テーブル作成と初期データ
-- ============================================

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

  INSERT INTO gachas (name, ticket_type_id, color, min_rarity, max_rarity, sort_order, is_active)
  VALUES
    ('フリー', free_id, 'green', 1, 3, 1, true),
    ('ベーシック', basic_id, 'yellow', 1, 6, 2, true),
    ('エピック', epic_id, 'orange', 3, 8, 3, true),
    ('プレミアム', premium_id, 'red', 5, 10, 4, true),
    ('EX', ex_id, 'purple', 7, 12, 5, true)
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- STEP 3: horses テーブル作成とサンプルデータ
-- ============================================

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

INSERT INTO horses (name, name_en, rarity, description, card_image_url, is_active)
VALUES
  ('ディープインパクト', 'Deep Impact', 12, '衝撃の無敗三冠馬。飛ぶように走るその姿は、まさに神の領域。', '/assets/dance-in-the-dark.png', true),
  ('ナリタブライアン', 'Narita Brian', 11, '影の帝王と呼ばれた三冠馬。圧倒的な強さで競馬界を席巻。', '/assets/dance-in-the-dark.png', true),
  ('シンボリルドルフ', 'Symboli Rudolf', 10, '皇帝と呼ばれた七冠馬。日本競馬の礎を築いた。', '/assets/dance-in-the-dark.png', true),
  ('ダンスインザダーク', 'Dance In The Dark', 9, '闇の中で踊る者。菊花賞を制した天才は、目の病に倒れ志半ばで引退。', '/assets/dance-in-the-dark.png', true),
  ('エルコンドルパサー', 'El Condor Pasa', 8, '南米の翼。ジャパンカップを制し、凱旋門賞2着の快挙。', '/assets/dance-in-the-dark.png', true),
  ('サクラバクシンオー', 'Sakura Bakushin O', 7, '爆走のスプリンター。短距離戦線を席巻した稲妻。', '/assets/dance-in-the-dark.png', true),
  ('ナイスネイチャ', 'Nice Nature', 6, '永遠の2着馬。常に上位に食い込み続けた鉄人。', '/assets/dance-in-the-dark.png', true),
  ('ツインターボ', 'Twin Turbo', 5, '逃げ馬の鑑。超逃げで観客を魅了した異端児。', '/assets/dance-in-the-dark.png', true),
  ('メイショウドトウ', 'Meisho Doto', 4, '晩成の重賞馬。天皇賞春を制した粘り強い走り。', '/assets/dance-in-the-dark.png', true),
  ('ハルウララ', 'Haru Urara', 3, '113戦0勝の伝説。勝てなくても走り続けた姿が日本中を感動させた。', '/assets/dance-in-the-dark.png', true),
  ('地方馬A', 'Local Horse A', 2, '地方競馬の戦士。地道に走り続ける。', '/assets/dance-in-the-dark.png', true),
  ('新馬', 'Newcomer', 1, 'これから成長する若駒。未来への可能性を秘める。', '/assets/dance-in-the-dark.png', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 4: gacha_rates テーブル作成とサンプル提供割合
-- ============================================

CREATE TABLE IF NOT EXISTS gacha_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gacha_id UUID REFERENCES gachas(id) ON DELETE CASCADE NOT NULL,
  horse_id UUID REFERENCES horses(id) ON DELETE CASCADE NOT NULL,
  rate DECIMAL(5,2) NOT NULL CHECK (rate >= 0 AND rate <= 100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(gacha_id, horse_id)
);

-- フリーガチャ（★1-3）の提供割合を設定
DO $$
DECLARE
  free_gacha_id UUID;
  horse_record RECORD;
BEGIN
  SELECT id INTO free_gacha_id FROM gachas WHERE name = 'フリー' LIMIT 1;
  
  FOR horse_record IN (SELECT id, name, rarity FROM horses WHERE rarity <= 3 AND is_active = true)
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

-- ベーシックガチャ（★1-6）の提供割合を設定
DO $$
DECLARE
  basic_gacha_id UUID;
  horse_record RECORD;
BEGIN
  SELECT id INTO basic_gacha_id FROM gachas WHERE name = 'ベーシック' LIMIT 1;
  
  FOR horse_record IN (SELECT id, name, rarity FROM horses WHERE rarity >= 1 AND rarity <= 6 AND is_active = true)
  LOOP
    INSERT INTO gacha_rates (gacha_id, horse_id, rate)
    VALUES (basic_gacha_id, horse_record.id, 
      CASE 
        WHEN horse_record.rarity = 6 THEN 2.0
        WHEN horse_record.rarity = 5 THEN 8.0
        WHEN horse_record.rarity = 4 THEN 18.0
        WHEN horse_record.rarity = 3 THEN 22.0
        WHEN horse_record.rarity = 2 THEN 25.0
        ELSE 25.0
      END
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- エピックガチャ（★3-8）の提供割合を設定
DO $$
DECLARE
  epic_gacha_id UUID;
  horse_record RECORD;
BEGIN
  SELECT id INTO epic_gacha_id FROM gachas WHERE name = 'エピック' LIMIT 1;
  
  FOR horse_record IN (SELECT id, name, rarity FROM horses WHERE rarity >= 3 AND rarity <= 8 AND is_active = true)
  LOOP
    INSERT INTO gacha_rates (gacha_id, horse_id, rate)
    VALUES (epic_gacha_id, horse_record.id, 
      CASE 
        WHEN horse_record.rarity = 8 THEN 1.0
        WHEN horse_record.rarity = 7 THEN 4.0
        WHEN horse_record.rarity = 6 THEN 10.0
        WHEN horse_record.rarity = 5 THEN 20.0
        WHEN horse_record.rarity = 4 THEN 30.0
        ELSE 35.0
      END
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- プレミアムガチャ（★5-10）の提供割合を設定
DO $$
DECLARE
  premium_gacha_id UUID;
  horse_record RECORD;
BEGIN
  SELECT id INTO premium_gacha_id FROM gachas WHERE name = 'プレミアム' LIMIT 1;
  
  FOR horse_record IN (SELECT id, name, rarity FROM horses WHERE rarity >= 5 AND rarity <= 10 AND is_active = true)
  LOOP
    INSERT INTO gacha_rates (gacha_id, horse_id, rate)
    VALUES (premium_gacha_id, horse_record.id, 
      CASE 
        WHEN horse_record.rarity = 10 THEN 0.7
        WHEN horse_record.rarity = 9 THEN 3.0
        WHEN horse_record.rarity = 8 THEN 6.3
        WHEN horse_record.rarity = 7 THEN 15.0
        WHEN horse_record.rarity = 6 THEN 25.0
        ELSE 50.0
      END
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- EXガチャ（★7-12）の提供割合を設定
DO $$
DECLARE
  ex_gacha_id UUID;
  horse_record RECORD;
BEGIN
  SELECT id INTO ex_gacha_id FROM gachas WHERE name = 'EX' LIMIT 1;
  
  FOR horse_record IN (SELECT id, name, rarity FROM horses WHERE rarity >= 7 AND is_active = true)
  LOOP
    INSERT INTO gacha_rates (gacha_id, horse_id, rate)
    VALUES (ex_gacha_id, horse_record.id, 
      CASE 
        WHEN horse_record.rarity = 12 THEN 0.1
        WHEN horse_record.rarity = 11 THEN 0.5
        WHEN horse_record.rarity = 10 THEN 1.4
        WHEN horse_record.rarity = 9 THEN 3.0
        WHEN horse_record.rarity = 8 THEN 10.0
        ELSE 85.0
      END
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- ============================================
-- STEP 5: gacha_animations テーブル作成
-- ============================================

CREATE TABLE IF NOT EXISTS gacha_animations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  min_rarity INT NOT NULL,
  max_rarity INT NOT NULL,
  duration_seconds INT,
  asset_url TEXT,
  type VARCHAR(20) DEFAULT 'css',
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO gacha_animations (key, name, min_rarity, max_rarity, duration_seconds, type, is_active, sort_order)
VALUES
  ('stables', '厩舎トレーニング', 1, 3, 4, 'css', true, 1),
  ('g1', 'G1レーススタート', 1, 6, 5, 'css', true, 2),
  ('birth', '名馬の誕生', 7, 9, 6, 'css', true, 3),
  ('arima', '有馬記念フィナーレ', 10, 12, 8, 'css', true, 4)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- STEP 6: Row Level Security (RLS) 設定
-- ============================================

ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE gachas ENABLE ROW LEVEL SECURITY;
ALTER TABLE horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_animations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view ticket_types" ON ticket_types;
DROP POLICY IF EXISTS "Anyone can view active gachas" ON gachas;
DROP POLICY IF EXISTS "Anyone can view active horses" ON horses;
DROP POLICY IF EXISTS "Anyone can view gacha_rates" ON gacha_rates;
DROP POLICY IF EXISTS "Anyone can view gacha_animations" ON gacha_animations;

CREATE POLICY "Anyone can view ticket_types" ON ticket_types
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view active gachas" ON gachas
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active horses" ON horses
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view gacha_rates" ON gacha_rates
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view gacha_animations" ON gacha_animations
  FOR SELECT USING (is_active = true);

-- ============================================
-- STEP 7: 検証クエリ（実行して結果を確認）
-- ============================================

-- チケット種別一覧（5件表示されるはず）
SELECT id, name, code, color, sort_order FROM ticket_types ORDER BY sort_order;

-- ガチャ一覧（5件表示され、ticket_typeと紐づいているはず）
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

-- 馬一覧（12件表示されるはず）
SELECT id, name, name_en, rarity, is_active 
FROM horses 
WHERE is_active = true 
ORDER BY rarity DESC;

-- フリーガチャの提供割合（★1-3の馬が表示されるはず）
SELECT 
  gr.rate,
  h.name,
  h.rarity
FROM gacha_rates gr
INNER JOIN horses h ON gr.horse_id = h.id
INNER JOIN gachas g ON gr.gacha_id = g.id
WHERE g.name = 'フリー'
ORDER BY h.rarity DESC;

-- 全ガチャの提供割合合計（各ガチャで約100%になるはず）
SELECT 
  g.name as gacha_name,
  COUNT(*) as horse_count,
  SUM(gr.rate) as total_rate
FROM gacha_rates gr
INNER JOIN gachas g ON gr.gacha_id = g.id
GROUP BY g.name
ORDER BY g.sort_order;
