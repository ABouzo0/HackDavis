"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

export type MapMarkerPoint = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  /** Tailwind-ish colors */
  color: string;
};

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 13);
      return;
    }
    const b = L.latLngBounds(positions);
    map.fitBounds(b, { padding: [48, 48], maxZoom: 14 });
  }, [map, positions]);
  return null;
}

export default function FoodRescueMapInner({
  markers,
  /** Optional driving route (lat, lng) pairs — from /api/map/route */
  routePositions,
  heightClassName = "h-[320px] md:h-[380px]",
}: {
  markers: MapMarkerPoint[];
  routePositions?: [number, number][];
  heightClassName?: string;
}) {
  const positions = useMemo(
    () => markers.map((m) => [m.lat, m.lng] as [number, number]),
    [markers],
  );

  const center = useMemo(() => {
    if (positions.length === 0) return [38.5449, -121.7405] as [number, number];
    const lat = positions.reduce((a, p) => a + p[0], 0) / positions.length;
    const lng = positions.reduce((a, p) => a + p[1], 0) / positions.length;
    return [lat, lng] as [number, number];
  }, [positions]);

  return (
    <div className={`relative z-0 overflow-hidden rounded-2xl border border-[var(--border)] ${heightClassName}`}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%", minHeight: 280 }}
        className="z-0 [&_.leaflet-control-attribution]:max-w-[calc(100%-12px)] [&_.leaflet-control-attribution]:truncate [&_.leaflet-control-attribution]:bg-black/40 [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:text-[var(--muted)]"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds positions={positions.length ? positions : [center]} />
        {routePositions && routePositions.length > 1 && (
          <Polyline
            positions={routePositions}
            pathOptions={{ color: "#5c3d9e", weight: 5, opacity: 0.82 }}
          />
        )}
        {markers.map((m) => (
          <CircleMarker
            key={m.id}
            center={[m.lat, m.lng]}
            radius={10}
            pathOptions={{
              color: m.color,
              fillColor: m.color,
              fillOpacity: 0.85,
              weight: 2,
            }}
          >
            <Popup>
              <span className="text-sm font-medium text-neutral-900">{m.label}</span>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
