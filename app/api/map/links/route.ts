import { NextResponse } from "next/server";
import { z } from "zod";
import { allExternalDirectionLinks } from "@/lib/map-links";

const bodySchema = z.object({
  from: z.object({ lat: z.number(), lng: z.number() }),
  to: z.object({ lat: z.number(), lng: z.number() }),
});

const querySchema = z.object({
  fromLat: z.coerce.number(),
  fromLng: z.coerce.number(),
  toLat: z.coerce.number(),
  toLng: z.coerce.number(),
});

/** JSON with URLs to open Google Maps, Apple Maps, or OSM in a new tab. */
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }
  const links = allExternalDirectionLinks(parsed.data.from, parsed.data.to);
  return NextResponse.json({ links });
}

/** Same as POST — `GET /api/map/links?fromLat=&fromLng=&toLat=&toLng=` for quick links / QR codes. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    fromLat: url.searchParams.get("fromLat"),
    fromLng: url.searchParams.get("fromLng"),
    toLat: url.searchParams.get("toLat"),
    toLng: url.searchParams.get("toLng"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Query fromLat, fromLng, toLat, toLng required" }, { status: 400 });
  }
  const { fromLat, fromLng, toLat, toLng } = parsed.data;
  const links = allExternalDirectionLinks(
    { lat: fromLat, lng: fromLng },
    { lat: toLat, lng: toLng },
  );
  return NextResponse.json({ links });
}
