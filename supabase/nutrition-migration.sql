-- ============================================================
-- Nutrition Dashboard Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add nutrition columns to the dishes table
ALTER TABLE public.dishes
  ADD COLUMN IF NOT EXISTS calories     INTEGER,
  ADD COLUMN IF NOT EXISTS protein_g    NUMERIC(6,1),
  ADD COLUMN IF NOT EXISTS carbs_g      NUMERIC(6,1),
  ADD COLUMN IF NOT EXISTS fat_g        NUMERIC(6,1);

-- 2. Populate realistic nutrition estimates for all seeded dishes
-- Ember & Oak (00000001)
UPDATE public.dishes SET calories = 68,  protein_g = 3.0,  carbs_g = 10.0, fat_g = 2.5  WHERE name = 'Wood-Fired Bread'       AND restaurant_id = '00000001-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 95,  protein_g = 3.5,  carbs_g = 10.0, fat_g = 5.0  WHERE name = 'Charred Vegetables'    AND restaurant_id = '00000001-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 420, protein_g = 38.0, carbs_g = 8.0,  fat_g = 26.0 WHERE name = 'Smoked Salmon'         AND restaurant_id = '00000001-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 820, protein_g = 68.0, carbs_g = 3.0,  fat_g = 58.0 WHERE name = 'Prime Steak'           AND restaurant_id = '00000001-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 340, protein_g = 5.0,  carbs_g = 44.0, fat_g = 18.0 WHERE name = 'Chocolate Torte'       AND restaurant_id = '00000001-0000-0000-0000-000000000000';

-- Sage & Honey (00000002)
UPDATE public.dishes SET calories = 380, protein_g = 14.0, carbs_g = 42.0, fat_g = 18.0 WHERE name = 'Mediterranean Sampler' AND restaurant_id = '00000002-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 560, protein_g = 42.0, carbs_g = 6.0,  fat_g = 38.0 WHERE name = 'Grilled Lamb Chops'    AND restaurant_id = '00000002-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 220, protein_g = 12.0, carbs_g = 14.0, fat_g = 13.0 WHERE name = 'Greek Salad'           AND restaurant_id = '00000002-0000-0000-0000-000000000000';

-- The Root Kitchen (00000003)
UPDATE public.dishes SET calories = 140, protein_g = 4.0,  carbs_g = 12.0, fat_g = 9.0  WHERE name = 'Organic Greens'           AND restaurant_id = '00000003-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 195, protein_g = 7.0,  carbs_g = 16.0, fat_g = 12.0 WHERE name = 'Roasted Beetroot Salad'   AND restaurant_id = '00000003-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 380, protein_g = 36.0, carbs_g = 5.0,  fat_g = 24.0 WHERE name = 'Grilled Salmon'           AND restaurant_id = '00000003-0000-0000-0000-000000000000';

-- Copper & Coal (00000004)
UPDATE public.dishes SET calories = 750, protein_g = 52.0, carbs_g = 12.0, fat_g = 55.0 WHERE name = 'Smoked Ribs'          AND restaurant_id = '00000004-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 520, protein_g = 34.0, carbs_g = 38.0, fat_g = 25.0 WHERE name = 'Pulled Pork Sandwich'  AND restaurant_id = '00000004-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 880, protein_g = 62.0, carbs_g = 45.0, fat_g = 48.0 WHERE name = 'Brisket Platter'       AND restaurant_id = '00000004-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 640, protein_g = 44.0, carbs_g = 22.0, fat_g = 42.0 WHERE name = 'BBQ Burnt Ends'        AND restaurant_id = '00000004-0000-0000-0000-000000000000';

-- Basil & Brown (00000005)
UPDATE public.dishes SET calories = 580, protein_g = 22.0, carbs_g = 62.0, fat_g = 26.0 WHERE name = 'Spaghetti Carbonara' AND restaurant_id = '00000005-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 440, protein_g = 14.0, carbs_g = 58.0, fat_g = 18.0 WHERE name = 'Risotto Mushroom'    AND restaurant_id = '00000005-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 610, protein_g = 28.0, carbs_g = 55.0, fat_g = 30.0 WHERE name = 'Lasagna'             AND restaurant_id = '00000005-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 310, protein_g = 5.0,  carbs_g = 30.0, fat_g = 20.0 WHERE name = 'Tiramisu'            AND restaurant_id = '00000005-0000-0000-0000-000000000000';

-- Saffron Spice (00000006)
UPDATE public.dishes SET calories = 480, protein_g = 32.0, carbs_g = 22.0, fat_g = 28.0 WHERE name = 'Butter Chicken'  AND restaurant_id = '00000006-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 320, protein_g = 18.0, carbs_g = 18.0, fat_g = 20.0 WHERE name = 'Palak Paneer'    AND restaurant_id = '00000006-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 540, protein_g = 28.0, carbs_g = 62.0, fat_g = 18.0 WHERE name = 'Chicken Biryani' AND restaurant_id = '00000006-0000-0000-0000-000000000000';

-- Jade Garden (00000007)
UPDATE public.dishes SET calories = 410, protein_g = 22.0, carbs_g = 52.0, fat_g = 12.0 WHERE name = 'Pad Thai'        AND restaurant_id = '00000007-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 550, protein_g = 28.0, carbs_g = 58.0, fat_g = 22.0 WHERE name = 'Tonkotsu Ramen'  AND restaurant_id = '00000007-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 360, protein_g = 28.0, carbs_g = 30.0, fat_g = 12.0 WHERE name = 'Sushi Platter'   AND restaurant_id = '00000007-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 480, protein_g = 26.0, carbs_g = 42.0, fat_g = 22.0 WHERE name = 'Orange Chicken'  AND restaurant_id = '00000007-0000-0000-0000-000000000000';

-- Golden Grain (00000008)
UPDATE public.dishes SET calories = 280, protein_g = 5.0,  carbs_g = 30.0, fat_g = 16.0 WHERE name = 'Buttery Croissant' AND restaurant_id = '00000008-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 220, protein_g = 5.0,  carbs_g = 22.0, fat_g = 13.0 WHERE name = 'Avocado Toast'     AND restaurant_id = '00000008-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 120, protein_g = 5.0,  carbs_g = 14.0, fat_g = 5.0  WHERE name = 'Cappuccino'        AND restaurant_id = '00000008-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 140, protein_g = 4.0,  carbs_g = 20.0, fat_g = 5.0  WHERE name = 'Matcha Latte'      AND restaurant_id = '00000008-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 380, protein_g = 4.0,  carbs_g = 42.0, fat_g = 22.0 WHERE name = 'Brownies'          AND restaurant_id = '00000008-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 260, protein_g = 4.0,  carbs_g = 36.0, fat_g = 12.0 WHERE name = 'Berry Tart'        AND restaurant_id = '00000008-0000-0000-0000-000000000000';

-- Crimson Spoon (00000009)
UPDATE public.dishes SET calories = 620, protein_g = 28.0, carbs_g = 44.0, fat_g = 38.0 WHERE name = 'Spanish Tapas Platter' AND restaurant_id = '00000009-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 290, protein_g = 4.0,  carbs_g = 38.0, fat_g = 14.0 WHERE name = 'Patatas Bravas'        AND restaurant_id = '00000009-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 340, protein_g = 12.0, carbs_g = 28.0, fat_g = 20.0 WHERE name = 'Spanish Ham Croquetas' AND restaurant_id = '00000009-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 220, protein_g = 22.0, carbs_g = 4.0,  fat_g = 13.0 WHERE name = 'Garlic Shrimp'         AND restaurant_id = '00000009-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 250, protein_g = 6.0,  carbs_g = 34.0, fat_g = 10.0 WHERE name = 'Spanish Flan'          AND restaurant_id = '00000009-0000-0000-0000-000000000000';

-- Pearl Grill (00000010)
UPDATE public.dishes SET calories = 490, protein_g = 48.0, carbs_g = 4.0,  fat_g = 32.0 WHERE name = 'Lobster Tail'     AND restaurant_id = '00000010-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 310, protein_g = 28.0, carbs_g = 8.0,  fat_g = 18.0 WHERE name = 'Fresh Clams'      AND restaurant_id = '00000010-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 560, protein_g = 52.0, carbs_g = 12.0, fat_g = 32.0 WHERE name = 'Seafood Platter'  AND restaurant_id = '00000010-0000-0000-0000-000000000000';
UPDATE public.dishes SET calories = 400, protein_g = 38.0, carbs_g = 4.0,  fat_g = 26.0 WHERE name = 'Grilled Salmon'   AND restaurant_id = '00000010-0000-0000-0000-000000000000';

-- 3. Create the nutrition_insights cache table
CREATE TABLE IF NOT EXISTS public.nutrition_insights (
  dish_id          UUID PRIMARY KEY REFERENCES public.dishes(id) ON DELETE CASCADE,
  insight          TEXT NOT NULL,
  generated_at     TIMESTAMPTZ DEFAULT NOW(),
  dish_macros_hash TEXT NOT NULL
);

-- 4. RLS: publicly readable (anyone viewing a dish can get the insight)
ALTER TABLE public.nutrition_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutrition insights are viewable by everyone"
  ON public.nutrition_insights FOR SELECT USING (true);

-- Server-side API route writes via service role key (bypasses RLS automatically)
