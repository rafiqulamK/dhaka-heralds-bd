import Navbar from '@/components/Navbar';
import CategoryTabs from '@/components/CategoryTabs';
import Footer from '@/components/Footer';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Globe, Mail, MapPin, Users } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import logo from '@/assets/dhaka-heralds-logo.jpg';

export default function AboutPage() {
  const { get, loading } = useSiteSettings();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryTabs />
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-12">
        <div className="text-center mb-10">
          <img src={get('logo_url') || logo} alt={get('site_name', 'Dhaka Heralds')} className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/30 mx-auto mb-4" />
          <h1 className="text-3xl font-bold gradient-text">About {get('site_name', 'Dhaka Heralds')}</h1>
          <p className="text-muted-foreground mt-2">{get('footer_tagline', 'Illuminating Truth. One Story at a Time.')}</p>
        </div>

        {loading ? (
          <div className="h-60 bg-muted animate-pulse rounded-2xl" />
        ) : (
          <article className="prose prose-sm dark:prose-invert max-w-none bg-card rounded-2xl border border-border p-6 md:p-10">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {get('about_content', '# About Dhaka Heralds\n\nDhaka Heralds is an independent international news portal.')}
            </ReactMarkdown>
          </article>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-bold text-foreground flex items-center gap-2 mb-3"><Mail size={18} className="text-primary" /> Contact</h3>
            <p className="text-sm text-muted-foreground">
              <a href={`mailto:${get('footer_email', 'info@dhakaheralds.com')}`} className="text-primary hover:underline">{get('footer_email', 'info@dhakaheralds.com')}</a>
            </p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-bold text-foreground flex items-center gap-2 mb-3"><Globe size={18} className="text-primary" /> Website</h3>
            <p className="text-sm text-muted-foreground">
              <a href="https://dhakaheralds.com" className="text-primary hover:underline">www.dhakaheralds.com</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
