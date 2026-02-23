import Navbar from '@/components/Navbar';
import CategoryTabs from '@/components/CategoryTabs';
import Footer from '@/components/Footer';
import { Globe, Mail, MapPin, Users } from 'lucide-react';
import logo from '@/assets/dhaka-heralds-logo.jpg';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryTabs />
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-12">
        <div className="text-center mb-10">
          <img src={logo} alt="Dhaka Heralds" className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/30 mx-auto mb-4" />
          <h1 className="text-3xl font-bold gold-text">About Dhaka Heralds</h1>
          <p className="text-muted-foreground mt-2">Illuminating Truth. One Story at a Time.</p>
        </div>

        <div className="space-y-8">
          <section className="bg-card rounded-xl gold-border p-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-3">
              <Globe size={20} className="text-primary" /> Our Mission
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Dhaka Heralds is an independent international news and documentary portal dedicated to delivering accurate, unbiased journalism covering Bangladesh and the world. We believe in the power of truth and the responsibility of the press to inform, educate, and inspire.
            </p>
          </section>

          <section className="bg-card rounded-xl gold-border p-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-3">
              <Users size={20} className="text-primary" /> Our Team
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Our team comprises experienced journalists, documentary filmmakers, data analysts, and AI specialists working together to bring you comprehensive news coverage. We leverage cutting-edge AI technology alongside traditional journalism to deliver verified, fact-checked reporting.
            </p>
          </section>

          <section className="bg-card rounded-xl gold-border p-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-3">
              <Mail size={20} className="text-primary" /> Contact Us
            </h2>
            <div className="space-y-3 text-foreground/80">
              <p className="flex items-center gap-2"><Mail size={16} className="text-muted-foreground" /> <a href="mailto:info@dhakaheralds.com" className="text-primary hover:underline">info@dhakaheralds.com</a></p>
              <p className="flex items-center gap-2"><MapPin size={16} className="text-muted-foreground" /> Dhaka, Bangladesh</p>
              <p className="flex items-center gap-2"><Globe size={16} className="text-muted-foreground" /> <a href="https://dhakaheralds.com" className="text-primary hover:underline">www.dhakaheralds.com</a></p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
