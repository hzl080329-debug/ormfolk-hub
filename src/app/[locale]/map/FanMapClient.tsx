"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { countryName } from "@/lib/utils";
import { useLocale } from "next-intl";

const heartIcon = L.divIcon({
  html: `<div style="
    width: 24px; height: 24px;
    background: linear-gradient(135deg, #87CEEB, #FFE87C);
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(255,154,118,0.4);
    cursor: pointer;
  "></div>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function FanMapClient({ locations }: { locations: any[] }) {
  return (
    <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc) => (
        <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={heartIcon}>
          <Popup>
            <div className="text-center">
              <div className="font-semibold text-sm">💜 {loc.city || loc.country}</div>
              <div className="text-xs text-gray-500">{loc.country} · {loc.count} {loc.count > 1 ? "fans" : "fan"}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
