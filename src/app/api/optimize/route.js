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

    // Formulate a structured prompt for Gemini based on the resume section type
    let prompt = `You are a professional resume writer and recruitment expert. 
Optimize the following text for the role of "${role || 'Professional'}" to make it Applicant Tracking System (ATS) friendly, professional, and impact-driven.

Instructions:
1. Use active, strong action verbs at the start of bullet points.
2. Incorporate key industry terms and skills relevant to the role.
3. Keep the wording clear, elegant, and concise.
4. Maintain truthfulness—do not invent or hallucinate achievements, numbers, or technologies not present in the input.
5. Return ONLY the rewritten optimized content, formatted as plain text. Do not include any greeting, introduction, conclusion, markdown wrappers, or meta-commentary.

Input Text to Rewrite:\n"${text}"`;

    if (section === 'summary') {
      prompt += `\n\nSpecific Guidance for Summary: Make it a compelling 2-3 sentence executive professional summary highlighting core strengths.`;
    } else if (section === 'experience' || section === 'projects') {
      prompt += `\n\nSpecific Guidance: Format as high-impact bullet points demonstrating actions and results. Use the X-Y-Z formula (Accomplished [X], as measured by [Y], by doing [Z]) if metrics are provided.`;
    }

    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

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
            maxOutputTokens: 800,
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
    const optimizedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    return NextResponse.json({ optimizedText });
  } catch (error) {
    console.error('Optimize API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
