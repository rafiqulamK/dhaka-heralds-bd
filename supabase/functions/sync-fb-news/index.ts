import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const FB_PAGE_URL = 'https://www.facebook.com/share/1Br2hGnoxK';

const CATEGORY_MAP: Record<string, string> = {
  'bangladesh': '19704a9a-1be1-42c5-acef-32c99d9b434b',
  'business': 'e46c9518-48ce-4ae8-b445-d8c20c73e104',
  'culture': '09715b22-3854-43b7-83f3-68fe59731721',
  'politics': '75187706-de73-4fb6-972f-f396438ad1cf',
  'sports': '2cbab991-2640-4923-873e-23542fb65bc2',
  'world': '08d837ac-318f-4569-a636-9534f22fd1cd',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 80) + '-' + Date.now().toString(36);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Step 1: Scraping Facebook page via Firecrawl...');

    // Scrape the FB page for posts
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: FB_PAGE_URL,
        formats: ['markdown', 'links'],
        waitFor: 3000,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok) {
      console.error('Firecrawl scrape error:', scrapeData);
      // Fallback: search for news from the page
    }

    // Also search for recent posts from the page
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'site:facebook.com Dhaka Heralds latest news Bangladesh',
        limit: 15,
        tbs: 'qdr:d',
        scrapeOptions: { formats: ['markdown'] },
      }),
    });

    const searchData = await searchResponse.json();

    // Combine scraped content
    const scrapedContent = scrapeData?.data?.markdown || scrapeData?.markdown || '';
    const searchResults = searchData?.data || [];

    const combinedContent = [
      scrapedContent ? `## Facebook Page Content:\n${scrapedContent.slice(0, 3000)}` : '',
      ...searchResults.map((item: any, i: number) =>
        `## [Result ${i + 1}] ${item.title || 'Untitled'}\nURL: ${item.url}\n${item.description || ''}\n${(item.markdown || '').slice(0, 800)}`
      ),
    ].filter(Boolean).join('\n\n---\n\n');

    if (!combinedContent.trim()) {
      console.log('No content found from Facebook page');
      return new Response(
        JSON.stringify({ success: true, message: 'No new content found', articles_added: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Step 2: Analyzing content with AI...');

    // Use AI to extract and categorize posts
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a news content analyzer for Dhaka Heralds newspaper. Today is ${new Date().toISOString().split('T')[0]}.

Analyze the scraped Facebook page content and extract individual news posts/articles. For each distinct news item, return a JSON object.

Available categories: ${Object.keys(CATEGORY_MAP).join(', ')}

Return a JSON array where each item has:
{
  "title": "News headline (create a professional headline if not clear)",
  "excerpt": "2-3 sentence summary of the news",
  "content": "Full article content in markdown format, expanded professionally from the FB post. At least 3-4 paragraphs.",
  "category": "one of: ${Object.keys(CATEGORY_MAP).join(', ')}",
  "tags": ["tag1", "tag2", "tag3"],
  "image_url": "image URL if found in content, otherwise null",
  "is_video": false,
  "video_url": "video URL if found, otherwise null"
}

Rules:
- Extract ONLY genuine news items, skip ads/promos/shares
- Deduplicate similar stories
- Assign the most appropriate category based on content analysis
- Create professional, engaging headlines
- Expand short FB posts into proper news articles
- Return ONLY valid JSON array, no markdown wrapping`
          },
          { role: 'user', content: combinedContent }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI analysis failed:', aiResponse.status);
      return new Response(
        JSON.stringify({ success: false, error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '[]';

    let articles: any[];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      articles = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      console.error('Failed to parse AI response');
      articles = [];
    }

    if (articles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No articles extracted', articles_added: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Step 3: Inserting ${articles.length} articles...`);

    let inserted = 0;
    let skipped = 0;

    for (const article of articles) {
      const slug = slugify(article.title || 'untitled');
      const categoryId = CATEGORY_MAP[article.category?.toLowerCase()] || CATEGORY_MAP['world'];

      // Check for duplicate by similar title
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .ilike('title', `%${(article.title || '').slice(0, 40)}%`)
        .limit(1);

      if (existing && existing.length > 0) {
        skipped++;
        continue;
      }

      const { error: insertError } = await supabase.from('articles').insert({
        title: article.title,
        slug,
        excerpt: article.excerpt || null,
        content: article.content || article.excerpt || '',
        category_id: categoryId,
        cover_image_url: article.image_url || null,
        tags: article.tags || [],
        status: 'published',
        featured: false,
        published_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error('Insert error:', insertError.message);
      } else {
        inserted++;
      }

      // If it's a video post, also add to videos table
      if (article.is_video && article.video_url) {
        await supabase.from('videos').insert({
          title: article.title,
          slug: 'vid-' + slug,
          description: article.excerpt || '',
          category_id: categoryId,
          thumbnail_url: article.image_url || null,
          video_url: article.video_url,
          external_url: article.video_url,
          video_type: 'external',
          tags: article.tags || [],
          status: 'published',
          published_at: new Date().toISOString(),
        });
      }
    }

    console.log(`Done! Inserted: ${inserted}, Skipped (duplicates): ${skipped}`);

    return new Response(
      JSON.stringify({
        success: true,
        articles_added: inserted,
        duplicates_skipped: skipped,
        total_extracted: articles.length,
        source: 'facebook',
        synced_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('FB sync error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
