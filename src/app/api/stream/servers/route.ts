import { NextRequest, NextResponse } from "next/server";
import { fetchMultiProviderServers } from "@/lib/streamProviders";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const malId = params.get("malId") || undefined;
    const episodeNumber = parseInt(params.get("episode") || "1", 10);
    const episodeEmbedId = params.get("episodeEmbedId") || undefined;
    const embedSub = params.get("embedSub") || undefined;
    const embedDub = params.get("embedDub") || undefined;
    const trailerUrl = params.get("trailerUrl") || undefined;

    if (Number.isNaN(episodeNumber)) {
      return NextResponse.json({ error: "Invalid episode number" }, { status: 400 });
    }

    const servers = await fetchMultiProviderServers({
      malId,
      episodeNumber,
      episodeEmbedId,
      embedSub,
      embedDub,
      trailerUrl,
    });

    return NextResponse.json({ servers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch stream servers";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
