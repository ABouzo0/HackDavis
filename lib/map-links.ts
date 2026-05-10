import { directionsUrl } from "./maps-link";

export type LatLng = { lat: number; lng: number };

export function googleDirectionsLink(from: LatLng, to: LatLng): string {
  return directionsUrl(from, to);
}

/** Apple Maps directions (opens native app on iOS). */
export function appleDirectionsLink(from: LatLng, to: LatLng): string {
  const o = `${from.lat},${from.lng}`;
  const d = `${to.lat},${to.lng}`;
  return `https://maps.apple.com/?saddr=${encodeURIComponent(o)}&daddr=${encodeURIComponent(d)}&dirflg=d`;
}

/**
 * OpenStreetMap directions between two points — shows from/to markers on osm.org
 * (hash-only map URLs do not render app-specific gold/purple pins).
 */
export function openStreetMapBrowseBetween(from: LatLng, to: LatLng): string {
  const route = `${from.lat},${from.lng};${to.lat},${to.lng}`;
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${encodeURIComponent(route)}`;
}

/** Browse OSM on one point with a visible marker (`mlat` / `mlon`). */
export function openStreetMapBrowse(center: LatLng, zoom = 14): string {
  const { lat, lng } = center;
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
}

export function allExternalDirectionLinks(from: LatLng, to: LatLng) {
  return {
    googleMaps: googleDirectionsLink(from, to),
    appleMaps: appleDirectionsLink(from, to),
    openStreetMapBrowse: openStreetMapBrowseBetween(from, to),
  };
}
