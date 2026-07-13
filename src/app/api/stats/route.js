import { NextResponse } from 'next/server';

// Server-side in-memory cache fallback for local development
if (global.mockResumesBuilt === undefined) {
  global.mockResumesBuilt = 1245;
}

export async function GET() {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  // Fallback to in-memory mock count if Vercel KV is not linked yet
  if (!kvUrl || !kvToken) {
    return NextResponse.json({ resumesBuilt: global.mockResumesBuilt });
  }

  try {
    const response = await fetch(`${kvUrl}/get/resumes_built`, {
      headers: {
        Authorization: `Bearer ${kvToken}`,
      },
      next: { revalidate: 10 }, // Cache the count for 10 seconds for performance
    });

    if (!response.ok) {
      throw new Error('KV fetch failed');
    }

    const data = await response.json();
    const count = parseInt(data.result, 10) || global.mockResumesBuilt;
    
    return NextResponse.json({ resumesBuilt: count });
  } catch (error) {
    console.error('Stats GET Error:', error);
    return NextResponse.json({ resumesBuilt: global.mockResumesBuilt });
  }
}

export async function POST() {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    global.mockResumesBuilt += 1;
    return NextResponse.json({ success: true, resumesBuilt: global.mockResumesBuilt });
  }

  try {
    const response = await fetch(`${kvUrl}/incr/resumes_built`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('KV increment failed');
    }

    const data = await response.json();
    const newCount = parseInt(data.result, 10);

    return NextResponse.json({ success: true, resumesBuilt: newCount });
  } catch (error) {
    console.error('Stats POST Error:', error);
    global.mockResumesBuilt += 1;
    return NextResponse.json({ success: true, resumesBuilt: global.mockResumesBuilt });
  }
}
