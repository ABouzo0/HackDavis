export function directionsUrl(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): string {
  const o = `${from.lat},${from.lng}`;
  const d = `${to.lat},${to.lng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}`;
}
