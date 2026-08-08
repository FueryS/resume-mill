import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text, section, role } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text content is required for optimization.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY environment variable.');
      return NextResponse.json({ 
        error: 'Gemini API Key is not configured on the server. Please add GEMINI_API_KEY to your environment variables.' 
      }, { status: 500 });
    }

    // Formulate a strict prompt for Gemini based on the resume section type
    let prompt = `You are a professional resume writer and recruitment expert. 
Optimize the following text for the role of "${role || 'Professional'}" to make it Applicant Tracking System (ATS) friendly, professional, and impact-driven.

STRICT INSTRUCTIONS:
1. Use active, strong action verbs at the start of bullet points.
2. Incorporate key industry terms and skills relevant to the role.
3. Keep wording clear, elegant, and concise.
4. Maintain truthfulness—do not invent or hallucinate achievements, numbers, or technologies not present in the input.
5. NEVER prefix the response with section titles, headings, or labels (such as "SUMMARY:", "SUMMARY -", "PROFESSIONAL SUMMARY:", "RESPONSIBILITIES:", "PROJECT DESCRIPTION:", "DUTIES:", or "KEY ACHIEVEMENTS:"). The section title is ALREADY present on the resume canvas.
6. Do NOT wrap the text in quotes or markdown code blocks.
7. Return ONLY the exact rewritten text ready to be directly inserted into the resume input field.

Input Text to Rewrite:\n"${text}"`;

    if (section === 'summary') {
      prompt += `\n\nSpecific Guidance for Summary: Make it a compelling 2-3 sentence executive professional summary highlighting core strengths. Max 450 characters total. Do NOT write "SUMMARY:" or "SUMMARY STATEMENT:".`;
    } else if (section === 'experience' || section === 'projects') {
      prompt += `\n\nSpecific Guidance: Format as high-impact bullet points demonstrating actions and results. Use the X-Y-Z formula (Accomplished [X], as measured by [Y], by doing [Z]) if metrics are provided. Do NOT write "RESPONSIBILITIES:" or "DESCRIPTION:".`;
    }

    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const maxOutputTokens = (section === 'summary') ? 1024 : 2048;

    // Call Gemini API via native REST endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      let errorMsg = 'Failed to communicate with Gemini AI API.';
      try {
        const errorData = await response.json();
        console.error('Gemini API Error details:', errorData);
        if (errorData.error?.message) {
          errorMsg = `Gemini API Error: ${errorData.error.message}`;
        }
      } catch (e) {
        console.error('Failed to parse Gemini API error response:', e);
      }
      return NextResponse.json({ error: errorMsg }, { status: 502 });
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];

    if (candidate?.finishReason === 'MAX_TOKENS') {
      console.warn('Gemini response was truncated due to token limit.');
      return NextResponse.json({
        error: 'The AI response was too long and got cut off. Try optimizing a shorter section of text.'
      }, { status: 422 });
    }

    let rawText = candidate?.content?.parts?.[0]?.text?.trim() || '';

    // Strip surrounding quotes
    rawText = rawText.replace(/^["']|["']$/g, '');

    // Programmatic cleanup: Strip hallucinated section headings/prefixes
    const cleanedText = rawText
      .replace(/^(summary|professional summary|executive summary|overview|summary statement|responsibilities|description|project description|key achievements|achievements|duties)[\s:\-–—]+/i, '')
      .replace(/^#+\s*(summary|professional summary|overview|responsibilities)[\s:\-–—]*/i, '')
      .trim();

    return NextResponse.json({ optimizedText: cleanedText });
  } catch (error) {
    console.error('Optimize API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
