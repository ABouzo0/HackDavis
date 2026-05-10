"use client";

import { useCallback, useMemo } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import Map, { Layer, Marker, NavigationControl, Source } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import type { MapMarkerPoint } from "./FoodRescueMapInner";

function boundsFromMarkers(markers: MapMarkerPoint[]): [[number, number], [number, number]] {
  if (markers.length === 0) return [
    [-121.74, 38.54],
    [-121.73, 38.55],
  ];
  let minLat = markers[0].lat;
  let maxLat = markers[0].lat;
  let minLng = markers[0].lng;
  let maxLng = markers[0].lng;
  for (const m of markers) {
    minLat = Math.min(minLat, m.lat);
    maxLat = Math.max(maxLat, m.lat);
    minLng = Math.min(minLng, m.lng);
    maxLng = Math.max(maxLng, m.lng);
  }
  const pad = 0.012;
  return [
    [minLng - pad, minLat - pad],
    [maxLng + pad, maxLat + pad],
  ];
}

export default function FoodRescueMap3DInner({
  markers,
  routePositions,
  heightClassName = "h-[320px] md:h-[380px]",
}: {
  markers: MapMarkerPoint[];
  routePositions?: [number, number][];
  heightClassName?: string;
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

  const bounds = useMemo(() => boundsFromMarkers(markers), [markers]);

  const routeFeature = useMemo(() => {
    if (!routePositions || routePositions.length < 2) return null;
    return {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: routePositions.map(([lat, lng]) => [lng, lat]),
      },
    };
  }, [routePositions]);

  const onLoad = useCallback((e: { target: MapboxMap }) => {
    const map = e.target;
    try {
      if (!map.getSource("mapbox-dem")) {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
      }
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.25 });
    } catch {
      /* terrain may already exist */
    }
  }, []);

  if (!token) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--muted)] ${heightClassName}`}
      >
        Add NEXT_PUBLIC_MAPBOX_TOKEN to enable the 3D map.
      </div>
    );
  }

  return (
    <div className={`relative z-0 overflow-hidden rounded-2xl border border-[var(--border)] ${heightClassName}`}>
      <Map
        mapboxAccessToken={token}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        initialViewState={{
          bounds,
          fitBoundsOptions: { padding: 56, maxZoom: 14 },
          pitch: 58,
          bearing: -28,
        }}
        maxPitch={85}
        onLoad={onLoad}
        style={{ width: "100%", height: "100%", minHeight: 280 }}
        reuseMaps
      >
        <NavigationControl position="top-right" showCompass visualizePitch />
        {routeFeature && (
          <Source id="rescue-route" type="geojson" data={{ type: "FeatureCollection", features: [routeFeature] }}>
            <Layer
              id="rescue-route-line"
              type="line"
              paint={{
                "line-color": "#5c3d9e",
                "line-width": 5,
                "line-opacity": 0.88,
              }}
            />
          </Source>
        )}
        {markers.map((m) => (
          <Marker key={m.id} longitude={m.lng} latitude={m.lat} anchor="center">
            <div
              title={m.label}
              className="h-4 w-4 cursor-pointer rounded-full border-2 border-white shadow-md ring-2 ring-black/10"
              style={{ backgroundColor: m.color }}
            />
          </Marker>
        ))}
      </Map>
    </div>
  );
}
