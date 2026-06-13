import { prisma } from "@/lib/prisma";
import MapClient from "./MapClient";

export default async function MapPage() {
  const users = await prisma.user.findMany({
    where: { country: { not: null } },
    select: { id: true, username: true, country: true, city: true, locationHidden: false },
  });

  const filtered = users.filter(u => !u.locationHidden && u.country);

  // Group by city+country to deduplicate and count fans
  const grouped: Record<string, { city: string; country: string; count: number }> = {};
  for (const u of filtered) {
    const key = `${u.city || ""}|${u.country}`;
    if (!grouped[key]) {
      grouped[key] = { city: u.city || "", country: u.country || "", count: 0 };
    }
    grouped[key].count++;
  }

  const countryCoords: Record<string, [number, number]> = {
    China: [35, 105], Thailand: [15, 101], Japan: [36, 138], "South Korea": [37, 127],
    "Hong Kong, China": [22.3, 114.2], Singapore: [1.35, 103.8], Malaysia: [4, 102],
    Indonesia: [-6, 107], Philippines: [13, 122], Vietnam: [16, 108], India: [20, 78],
    USA: [39, -98], UK: [54, -2], France: [47, 2], Germany: [51, 9], Brazil: [-10, -55],
    Australia: [-25, 133], Canada: [60, -95], Italy: [42, 13], Spain: [40, -3],
    Mexico: [23, -102], Argentina: [-34, -64], Russia: [60, 90], Turkey: [39, 35],
    Egypt: [27, 30], "South Africa": [-30, 25], Nigeria: [9, 8], Kenya: [0, 38],
    "New Zealand": [-41, 174], Netherlands: [52, 6], Sweden: [62, 15], Norway: [62, 10],
    Denmark: [56, 10], Finland: [62, 26], Poland: [52, 20], Ukraine: [49, 32],
    Portugal: [40, -8], Greece: [39, 22], Austria: [47, 14], Switzerland: [47, 8],
    Ireland: [53, -8], UAE: [24, 54], "Saudi Arabia": [24, 45], Qatar: [25, 51],
    Israel: [31, 35], Pakistan: [30, 70], Bangladesh: [24, 90], Myanmar: [22, 96],
    Cambodia: [13, 105], Laos: [18, 106], Nepal: [28, 84], Mongolia: [46, 104],
    Kazakhstan: [48, 68], Chile: [-36, -71], Colombia: [4, -72], Peru: [-10, -76],
    Venezuela: [8, -66], Cuba: [22, -80], Morocco: [32, -6], Ghana: [8, -2],
    Ethiopia: [9, 40], Czech: [50, 15], Hungary: [47, 20], Romania: [46, 25],
    Bulgaria: [43, 25], Croatia: [45, 16], Serbia: [44, 21], Lithuania: [55, 24],
    Latvia: [57, 25], Estonia: [59, 26], Iceland: [65, -19], Jamaica: [18, -77],
    Panama: [9, -80], Uruguay: [-33, -56], Bolivia: [-17, -65], Ecuador: [-2, -78],
  };

  const mapLocations = Object.values(grouped).map(loc => {
    const coords = countryCoords[loc.country] || [20, 0];
    return { ...loc, lat: coords[0], lng: coords[1], id: `${loc.city}|${loc.country}` };
  });

  const totalFans = filtered.length;
  const uniqueCountries = [...new Set(filtered.map(l => l.country))].length;

  return <MapClient locations={mapLocations} totalFans={totalFans} countriesCount={uniqueCountries} />;
}
