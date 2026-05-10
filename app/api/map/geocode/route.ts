import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().min(2).max(500),
});

/**
 * Forward geocode via Nominatim (OpenStreetMap).
 * Use sparingly; see https://operations.osmfoundation.org/policies/nominatim/
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({ q: url.searchParams.get("q") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ error: "Query `q` required (2–500 chars)" }, { status: 400 });
  }
  const q = parsed.data.q.trim();

  const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
  nominatimUrl.searchParams.set("q", q);
  nominatimUrl.searchParams.set("format", "json");
  nominatimUrl.searchParams.set("limit", "5");

  const res = await fetch(nominatimUrl.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "Replate/1.0 (food rescue demo; contact: https://github.com)",
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Geocoding service unavailable" }, { status: 502 });
  }

  const raw = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
    place_id: number;
  }>;

  const results = raw.map((r) => ({
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    label: r.display_name,
    placeId: r.place_id,
  }));

  return NextResponse.json({ results });
}
