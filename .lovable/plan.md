
# Dhaka Heralds — Toutiao-Inspired Upgrade & Bug Fixes

This plan covers fixing existing issues, adding Toutiao-inspired engagement features, and enhancing the overall news portal to a professional standard.

---

## Phase 1: Bug Fixes & Stability

### 1.1 Fix Breaking News Ticker Animation
The CSS `ticker` animation translates from 100% to -100%, which causes a jump when looping. Fix it to create a seamless continuous scroll using duplicated content and proper keyframes.

### 1.2 Fix Demo Article Routing
Demo articles on the homepage use hardcoded slugs (e.g., `bangladesh-at-55`) that don't exist in the database, so clicking them leads to "Article not found." Update the `ArticlePage` to detect demo slugs and render demo content inline instead of querying the database.

### 1.3 Fix `prose-invert` for Light/Dark Mode
The `ArticlePage` always uses `prose-invert` which is wrong for light mode. Change to `prose dark:prose-invert` so article content is readable in both modes.

---

## Phase 2: Toutiao-Inspired UI/UX Enhancements

### 2.1 Article Page — Engagement Sidebar (Toutiao-style)
Add a sticky floating sidebar on article pages with:
- **Like** button with count
- **Comment** count indicator
- **Bookmark** button
- **Share** button (native share API)
- All using local state (no database changes needed initially)

### 2.2 Article Page — Related Articles Section
Add a "Related Stories" section at the bottom of each article page, fetching articles from the same category.

### 2.3 Homepage — "Hot List" Sidebar
On desktop, convert the "Latest Updates" compact list into a numbered "Hot List" (like Toutiao's trending list) with ranking numbers and heat indicators.

### 2.4 Category Tabs Navigation
Add a horizontally scrollable category pills/tabs bar below the main navbar (Toutiao/Google News style) for quick category filtering on the homepage.

---

## Phase 3: New Pages & Features

### 3.1 Fact-Check Page (`/fact-check`)
A dedicated page where users can:
- Submit a claim for AI-powered verification
- See a history of recent fact-checks (stored locally)
- Each result shows: Verdict badge, analysis, sources, AI disclaimer

### 3.2 About Page (`/about`)
A simple static page with Dhaka Heralds mission, team info, and contact details.

---

## Phase 4: Edge Function & AI Improvements

### 4.1 Firecrawl News Edge Function
Fix the current `firecrawl-news` function to handle edge cases better:
- Add fallback when Firecrawl returns empty results
- Improve the AI prompt to return more consistent JSON
- Add error retry logic

### 4.2 Chat Edge Function
- Improve the system prompt to explicitly state the current year is 2026
- Better handling of rate limits and errors

---

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/pages/FactCheckPage.tsx` | Dedicated fact-check submission page |
| `src/pages/AboutPage.tsx` | About/Contact page |
| `src/components/CategoryTabs.tsx` | Horizontal scrollable category tabs |
| `src/components/EngagementSidebar.tsx` | Sticky article engagement sidebar |
| `src/components/HotList.tsx` | Numbered trending list component |

### Files to Modify
| File | Changes |
|------|---------|
| `src/index.css` | Fix ticker animation, add hot-list styles |
| `src/pages/Index.tsx` | Add CategoryTabs, HotList, improve hero layout |
| `src/pages/ArticlePage.tsx` | Add EngagementSidebar, related articles, fix prose-invert |
| `src/components/Navbar.tsx` | Add CategoryTabs below navbar |
| `src/App.tsx` | Add routes for `/fact-check` and `/about` |
| `supabase/functions/firecrawl-news/index.ts` | Add error handling improvements |
| `supabase/functions/chat/index.ts` | Improve prompts and error handling |
| `src/components/ArticleCard.tsx` | Add ranking number variant for HotList |
| `src/components/Footer.tsx` | Add About and Fact-Check links |

### No Database Changes Required
All new features use existing tables or local state. No migrations needed.

---

## Execution Order
1. Phase 1 (bug fixes) -- immediate
2. Phase 2 (UI enhancements) -- parallel with Phase 1
3. Phase 3 (new pages) -- after Phase 2
4. Phase 4 (edge function fixes) -- parallel with Phase 3
