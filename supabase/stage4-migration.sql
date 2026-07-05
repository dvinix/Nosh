-- ============================================================
-- Stage 4 Migration
-- ============================================================

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view their own chat messages" ON public.chat_messages
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own messages
CREATE POLICY "Users can insert their own chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (handled automatically by Supabase)
