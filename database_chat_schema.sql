-- ==============================================================================
-- REAL-TIME CHAT SCHEMA
-- ==============================================================================

-- 1. Create chat_channels table
CREATE TABLE IF NOT EXISTS public.chat_channels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('direct', 'team')),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create chat_participants table
CREATE TABLE IF NOT EXISTS public.chat_participants (
  channel_id uuid REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (channel_id, user_id)
);

-- 3. Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id uuid REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. Policies for chat_channels
-- Users can see channels they are a part of
CREATE POLICY "Users can view channels they participate in" 
  ON public.chat_channels FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants 
      WHERE channel_id = chat_channels.id AND user_id = auth.uid()
    )
  );

-- Users can insert direct channels
CREATE POLICY "Users can create direct channels" 
  ON public.chat_channels FOR INSERT 
  WITH CHECK (type = 'direct' AND auth.uid() IS NOT NULL);

-- 5. Policies for chat_participants
-- Users can see participants of channels they are in
CREATE POLICY "Users can view participants of their channels" 
  ON public.chat_participants FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants cp 
      WHERE cp.channel_id = chat_participants.channel_id AND cp.user_id = auth.uid()
    )
  );

-- Users can add themselves and others to a new direct channel
CREATE POLICY "Users can add participants" 
  ON public.chat_participants FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- 6. Policies for chat_messages
-- Users can see messages in their channels
CREATE POLICY "Users can view messages in their channels" 
  ON public.chat_messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants 
      WHERE channel_id = chat_messages.channel_id AND user_id = auth.uid()
    )
  );

-- Users can insert messages in their channels
CREATE POLICY "Users can insert messages in their channels" 
  ON public.chat_messages FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND 
    EXISTS (
      SELECT 1 FROM public.chat_participants 
      WHERE channel_id = chat_messages.channel_id AND user_id = auth.uid()
    )
  );

-- ==============================================================================
-- ENABLE SUPABASE REALTIME
-- ==============================================================================
-- Enable realtime for chat_messages table
alter publication supabase_realtime add table public.chat_messages;
  -- remove the supabase_realtime publication if it exists to recreate safely
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.chat_messages;

