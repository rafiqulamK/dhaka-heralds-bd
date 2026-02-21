import { Link } from 'react-router-dom';
import logo from '@/assets/dhaka-heralds-logo.jpg';

const socialLinks = [
  { name: 'Facebook', url: 'https://www.facebook.com/DhakaHerald', icon: 'f' },
  { name: 'Instagram', url: 'https://www.instagram.com/DhakaHerald', icon: 'ig' },
  { name: 'X / Twitter', url: 'https://x.com/DhakaHeralds', icon: 'x' },
  { name: 'YouTube', url: 'https://youtube.com/@DhakaHeralds', icon: 'yt' },
];

function SocialIcon({ type, size = 18 }: { type: string; size?: number }) {
  const s = size;
  switch (type) {
    case 'f': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
    case 'ig': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>;
    case 'x': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
    case 'yt': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
    default: return null;
  }
}

export default function Footer() {
  return (
    <footer className="bg-primary dark:bg-[hsl(355,60%,6%)] border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Dhaka Heralds" className="h-14 w-14 rounded-full object-cover ring-2 ring-accent/50" />
              <div>
                <div className="text-2xl font-bold text-primary-foreground dark:gold-text">Dhaka Heralds</div>
                <div className="text-xs text-primary-foreground/70 dark:text-muted-foreground tracking-widest uppercase">International News & Documentary Portal</div>
              </div>
            </Link>
            <p className="text-primary-foreground/80 dark:text-muted-foreground text-sm leading-relaxed max-w-xs">
              Bringing truth to light since day one. Independent journalism and documentary filmmaking covering Bangladesh and beyond.
            </p>

            {/* Social icons */}
            <div className="mt-4 flex gap-3">
              {socialLinks.map(s => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-foreground/10 dark:bg-muted flex items-center justify-center text-primary-foreground dark:text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors" title={s.name}>
                  <SocialIcon type={s.icon} size={16} />
                </a>
              ))}
            </div>

            {/* Contact */}
            <div className="mt-4 text-sm text-primary-foreground/70 dark:text-muted-foreground space-y-1">
              <p>For collaboration or contact: <a href="mailto:info@dhakaheralds.com" className="text-accent hover:underline">info@dhakaheralds.com</a></p>
              <p><a href="https://dhakaheralds.com" className="text-accent hover:underline">www.dhakaheralds.com</a> · @DhakaHeralds</p>
            </div>
          </div>

          {/* Sections */}
          <div>
            <h4 className="text-sm font-bold text-accent mb-3 uppercase tracking-wider">Sections</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80 dark:text-muted-foreground">
              {['Bangladesh', 'World', 'Politics', 'Business', 'Documentaries', 'Culture', 'Sports'].map(s => (
                <li key={s}>
                  <Link to={`/category/${s.toLowerCase()}`} className="hover:text-accent transition-colors">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold text-accent mb-3 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80 dark:text-muted-foreground">
              {['About Us', 'Contact', 'Advertise', 'Privacy Policy', 'Terms of Service'].map(s => (
                <li key={s}><a href="#" className="hover:text-accent transition-colors">{s}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/20 dark:border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-primary-foreground/70 dark:text-muted-foreground">
          <span>© {new Date().getFullYear()} Dhaka Heralds. All rights reserved.</span>
          <span className="text-accent font-medium">Illuminating Truth. One Story at a Time.</span>
        </div>
      </div>
    </footer>
  );
}
