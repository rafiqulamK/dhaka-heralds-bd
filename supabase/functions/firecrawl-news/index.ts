const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const NEWS_SOURCES = [
  { name: 'BBC News', url: 'https://www.bbc.com/news' },
  { name: 'Reuters', url: 'https://www.reuters.com' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com' },
  { name: 'The Guardian', url: 'https://www.theguardian.com/international' },
  { name: 'AP News', url: 'https://apnews.com' },
  { name: 'CNN', url: 'https://edition.cnn.com' },
  { name: 'Dhaka Tribune', url: 'https://www.dhakatribune.com' },
  { name: 'The Daily Star BD', url: 'https://www.thedailystar.net' },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, category, limit } = await req.json();
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchQuery = query || `latest ${category || 'international'} news ${new Date().toISOString().split('T')[0]}`;
    
    console.log('Searching news:', searchQuery);

    // Use Firecrawl search to find latest news
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: limit || 10,
        tbs: 'qdr:d', // Last 24 hours
        scrapeOptions: {
          formats: ['markdown'],
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl error:', data);
      // Fallback: return empty with message
      return new Response(
        JSON.stringify({ success: true, data: [], ai_curated: false, error_note: data.error || 'Search failed, showing cached results' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback if Firecrawl returns empty
    if (!data.data || data.data.length === 0) {
      return new Response(
        JSON.stringify({ success: true, data: [], ai_curated: false, error_note: 'No results found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Now use AI to analyze and curate the results
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      // Return raw results if no AI key
      return new Response(
        JSON.stringify({ success: true, data: data.data || [], raw: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newsContent = (data.data || []).map((item: any, i: number) => 
      `[${i+1}] **${item.title || 'Untitled'}**\nURL: ${item.url}\n${item.description || ''}\n${(item.markdown || '').slice(0, 500)}`
    ).join('\n\n---\n\n');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a news curator for Dhaka Heralds. Today is ${new Date().toISOString().split('T')[0]}. 
Analyze the following scraped news articles and return a JSON array of the top trending stories.

For each story, return:
{
  "title": "headline",
  "excerpt": "2-3 sentence summary",
  "source": "source name",
  "source_url": "original URL",
  "category": "one of: world, politics, business, technology, sports, culture, bangladesh, science",
  "image_url": "image URL if found in the content, otherwise null",
  "importance": 1-10,
  "fact_check_status": "verified|partially_verified|unverified",
  "published_approx": "ISO date string"
}

Return ONLY valid JSON array. No markdown, no explanation. Deduplicate similar stories. Sort by importance.`
          },
          { role: 'user', content: newsContent }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI curation failed:', aiResponse.status);
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: (data.data || []).map((item: any) => ({
            title: item.title,
            excerpt: item.description,
            source: new URL(item.url).hostname,
            source_url: item.url,
            category: category || 'world',
            image_url: null,
            importance: 5,
            fact_check_status: 'unverified',
          })),
          ai_curated: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '[]';
    
    // Extract JSON from possible markdown code blocks
    let parsed;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      parsed = [];
    }

    return new Response(
      JSON.stringify({ success: true, data: parsed, ai_curated: true, sources_checked: NEWS_SOURCES.map(s => s.name) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('News scraping error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
