
-- Create site_settings table
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Site settings are publicly readable"
  ON public.site_settings FOR SELECT
  USING (true);

-- Admin write
CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert defaults
INSERT INTO public.site_settings (key, value, category) VALUES
  ('site_name', 'Dhaka Heralds', 'branding'),
  ('site_tagline', 'International News & Documentary Portal', 'branding'),
  ('logo_url', '', 'branding'),
  ('hero_title', 'Welcome to Dhaka Heralds', 'hero'),
  ('hero_subtitle', 'Your trusted source for international news and documentaries', 'hero'),
  ('cta_text', 'Read Latest News', 'hero'),
  ('cta_link', '/category/world', 'hero'),
  ('footer_description', 'Bringing truth to light since day one. Independent journalism and documentary filmmaking covering Bangladesh and beyond.', 'footer'),
  ('footer_email', 'info@dhakaheralds.com', 'footer'),
  ('footer_copyright', '© 2026 Dhaka Heralds. All rights reserved.', 'footer'),
  ('footer_tagline', 'Illuminating Truth. One Story at a Time.', 'footer'),
  ('primary_color', '348 80% 48%', 'theme'),
  ('accent_color', '262 83% 58%', 'theme'),
  ('about_content', '# About Dhaka Heralds\n\nDhaka Heralds is an independent international news portal dedicated to delivering accurate, unbiased journalism covering Bangladesh and the world.', 'pages'),
  ('contact_content', '# Contact Us\n\nReach out to us at info@dhakaheralds.com for inquiries, partnerships, and collaboration opportunities.', 'pages'),
  ('privacy_content', '# Privacy Policy\n\nYour privacy is important to us. This policy outlines how we collect, use, and protect your information.', 'pages'),
  ('terms_content', '# Terms of Service\n\nBy using Dhaka Heralds, you agree to the following terms and conditions.', 'pages')
ON CONFLICT (key) DO NOTHING;
