
CREATE TABLE public.advertisements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  link_url text,
  placement text NOT NULL DEFAULT 'sidebar',
  size text NOT NULL DEFAULT '300x250',
  is_active boolean NOT NULL DEFAULT true,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  click_count integer DEFAULT 0,
  impression_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ads are publicly readable" ON public.advertisements FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage ads" ON public.advertisements FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL,
  title text,
  content text,
  image_url text,
  video_embed_url text,
  category_id uuid REFERENCES public.categories(id),
  status text NOT NULL DEFAULT 'published',
  published_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Social posts are publicly readable" ON public.social_posts FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage social posts" ON public.social_posts FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'lovable',
  api_key text,
  model text DEFAULT 'google/gemini-3-flash-preview',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage AI settings" ON public.ai_settings FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));
