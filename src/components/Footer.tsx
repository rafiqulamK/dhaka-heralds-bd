import { Link } from 'react-router-dom';
import logo from '@/assets/dhaka-heralds-logo.jpg';

export default function Footer() {
  return (
    <footer className="bg-maroon-deep border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Dhaka Heralds" className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/50" />
              <div>
                <div className="text-2xl font-bold gold-text">Dhaka Heralds</div>
                <div className="text-xs text-muted-foreground tracking-widest uppercase">International News & Documentary Portal</div>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Bringing truth to light since day one. Independent journalism and documentary filmmaking covering Bangladesh and beyond.
            </p>
            <div className="mt-4 flex gap-3">
              {['Facebook', 'YouTube', 'Twitter', 'Instagram'].map(s => (
                <a key={s} href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors border border-border px-2 py-1 rounded">
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div>
            <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Sections</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {['Bangladesh', 'World', 'Politics', 'Business', 'Documentaries', 'Culture', 'Sports'].map(s => (
                <li key={s}>
                  <Link to={`/category/${s.toLowerCase()}`} className="hover:text-primary transition-colors">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {['About Us', 'Contact', 'Advertise', 'Privacy Policy', 'Terms of Service'].map(s => (
                <li key={s}><a href="#" className="hover:text-primary transition-colors">{s}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Dhaka Heralds. All rights reserved.</span>
          <span className="gold-text font-medium">Illuminating Truth. One Story at a Time.</span>
        </div>
      </div>
    </footer>
  );
}
