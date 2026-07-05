-- ============================================================
-- Stage 5 Migration
-- ============================================================

-- Create diet_plans table
CREATE TABLE IF NOT EXISTS public.diet_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_calories INTEGER NOT NULL,
    preference TEXT NOT NULL,
    plan_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for diet_plans
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own diet plans" ON public.diet_plans
    FOR ALL USING (auth.uid() = user_id);

-- Create monthly_personality_tags table
CREATE TABLE IF NOT EXISTS public.monthly_personality_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- format: 'YYYY-MM'
    tag TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, month)
);

-- Enable RLS for monthly_personality_tags
ALTER TABLE public.monthly_personality_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own personality tags" ON public.monthly_personality_tags
    FOR ALL USING (auth.uid() = user_id);
