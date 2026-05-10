import { NextResponse } from "next/server";
import { z } from "zod";

const coordsSchema = z.object({
  fromLat: z.coerce.number().min(-90).max(90),
  fromLng: z.coerce.number().min(-180).max(180),
  toLat: z.coerce.number().min(-90).max(90),
  toLng: z.coerce.number().min(-180).max(180),
});

type OsrmRouteResponse = {
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: { type: string; coordinates: number[][] };
  }>;
  code?: string;
};

/**
 * Driving route geometry via public OSRM demo (same coordinates order as OSRM: lng,lat).
 * Draw path on embedded Leaflet map; not for production navigation guarantees.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = coordsSchema.safeParse({
    fromLat: url.searchParams.get("fromLat"),
    fromLng: url.searchParams.get("fromLng"),
    toLat: url.searchParams.get("toLat"),
    toLng: url.searchParams.get("toLng"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coordinates", details: parsed.error.flatten() }, { status: 400 });
  }

  const { fromLat, fromLng, toLat, toLng } = parsed.data;
  const path = `${fromLng},${fromLat};${toLng},${toLat}`;
  const osrm = `https://router.project-osrm.org/route/v1/driving/${path}?overview=full&geometries=geojson`;

  const res = await fetch(osrm, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    return NextResponse.json({ error: "Routing service unavailable" }, { status: 502 });
  }

  const data = (await res.json()) as OsrmRouteResponse;
  const route = data.routes?.[0];
  if (!route) {
    return NextResponse.json({ error: "No route found" }, { status: 404 });
  }

  const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);

  return NextResponse.json({
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    positions: coords,
  });
}
