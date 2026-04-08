## Plan: Dynamic Admin Panel & Content Management

### 1. Database: `site_settings` table
- Key-value store for all dynamic content (logo URL, hero text, CTA text, footer text, theme colors, about/contact/legal page content)
- Public read, admin-only write

### 2. Admin Panel — Site Settings Page (`/admin/settings`)
- **Branding**: Logo URL, site name, tagline
- **Hero Section**: Hero title, subtitle, CTA text & link
- **Footer**: Footer description, contact email, copyright text
- **Theme Colors**: Primary color picker, accent color, gradient colors
- **Page Content**: About page, Contact page, Privacy Policy, Terms of Service (rich text areas)

### 3. Admin Panel — Bulk Article Management
- Checkbox on each article row + "Select All" checkbox
- Bulk actions toolbar: Delete selected, Unpublish selected, Publish selected, Feature/Unfeature
- Quick status filter (All/Published/Draft)

### 4. Frontend Updates
- Navbar, Footer, Hero section read settings from `site_settings`
- About, Contact, Privacy, Terms pages render dynamic content
- Theme colors applied from admin settings via CSS variables

### 5. New Pages
- `/contact` — Contact page
- `/privacy` — Privacy Policy page  
- `/terms` — Terms of Service page
