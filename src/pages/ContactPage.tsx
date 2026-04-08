import Navbar from '@/components/Navbar';
import CategoryTabs from '@/components/CategoryTabs';
import Footer from '@/components/Footer';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ContactPage() {
  const { get, loading } = useSiteSettings();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryTabs />
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-12">
        {loading ? (
          <div className="h-40 bg-muted animate-pulse rounded-2xl" />
        ) : (
          <article className="prose prose-sm dark:prose-invert max-w-none bg-card rounded-2xl border border-border p-6 md:p-10">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {get('contact_content', '# Contact Us\n\nReach out at info@dhakaheralds.com')}
            </ReactMarkdown>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}
