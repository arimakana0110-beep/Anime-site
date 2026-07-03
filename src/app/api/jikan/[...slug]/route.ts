import { NextRequest, NextResponse } from "next/server";

const JIKAN_API_URL = "https://api.jikan.moe/v4";

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);
    if (response.ok || response.status !== 429) {
      return response;
    }

    lastResponse = response;
    if (attempt < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return lastResponse!;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;

    const targetUrl = new URL(`${JIKAN_API_URL}/${slug.join("/")}`);
    searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });

    const response = await fetchWithRetry(targetUrl.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    }, 3);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Jikan API returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch from Jikan API";
    console.error("Jikan proxy fetch failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
