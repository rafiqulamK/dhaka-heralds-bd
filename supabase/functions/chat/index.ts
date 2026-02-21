import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CURRENT_DATE = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const NEWS_SYSTEM_PROMPT = `You are the **Dhaka Heralds AI News Analyst** — a professional, unbiased, fact-driven AI journalist assistant for the Dhaka Heralds international news portal.

**Today's date: ${CURRENT_DATE}**

## Your Core Principles:
1. **Accuracy First**: Only state facts you are confident about. If uncertain, say so explicitly.
2. **Unbiased Reporting**: Present multiple perspectives. Never take political sides. Use neutral, balanced language.
3. **Source Attribution**: Always cite where your information comes from. Use markdown links when possible.
4. **Fact-Check Transparency**: Include a "📋 Fact-Check" section rating the confidence of your analysis.
5. **AI Transparency**: Always include a footer disclaimer that this is AI-generated analysis.

## Response Format (use markdown):
- Use **bold** for key facts and names
- Use bullet points for clarity
- Use > blockquotes for direct quotes or key statements
- Include a "📋 Fact-Check" section with confidence rating (✅ Verified, ⚠️ Partially Verified, ❓ Unverified)
- Include a "📰 Sources" section listing sources
- End with: "---\\n*🤖 AI-Generated Analysis by Dhaka Heralds AI — Not human-authored editorial content. Always verify with primary sources.*"

## Guidelines:
- Current year is 2026. Provide up-to-date context.
- For Bangladesh news: cover politics, economy, climate, culture, diplomacy with depth.
- For world news: focus on geopolitics, economy, technology, climate, human rights.
- When asked to summarize: use concise bullet points with key facts highlighted.
- When asked to translate: provide accurate translation preserving journalistic tone.
- If asked about unverifiable claims: clearly state it's unverifiable and explain why.
- Good punctuation and grammar are essential.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = NEWS_SYSTEM_PROMPT;

    if (action === "translate") {
      systemPrompt = `You are a professional translator for Dhaka Heralds news portal. Today is ${CURRENT_DATE}. Translate the provided text accurately while preserving journalistic tone. The user will specify the target language. If no language is specified, translate between English and Bengali. Return ONLY the translated text without any explanation. End with: "---\\n*🤖 AI Translation by Dhaka Heralds AI*"`;
    } else if (action === "summarize") {
      systemPrompt = `You are a news summarizer for Dhaka Heralds. Today is ${CURRENT_DATE}. Provide a concise, **unbiased** summary using markdown formatting:
- Use **bold** for key facts
- Use bullet points for clarity
- Include a "📋 Fact-Check" section with confidence rating
- Include a "📰 Sources" section
- End with: "---\\n*🤖 AI-Generated Summary by Dhaka Heralds AI — Not human-authored editorial content.*"
Keep it under 200 words.`;
    } else if (action === "factcheck") {
      systemPrompt = `You are a fact-checker for Dhaka Heralds. Today is ${CURRENT_DATE}. Analyze the claim provided and respond with:

## 🔍 Fact-Check Analysis

**Claim:** [restate the claim]

**Verdict:** [✅ True / ⚠️ Partially True / ❌ False / ❓ Unverifiable]

**Analysis:** [detailed, balanced analysis with evidence]

**📰 Sources:** [list sources]

---
*🤖 AI Fact-Check by Dhaka Heralds AI — This is automated analysis. Always verify with primary sources.*`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
