import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, locale: string = "en") {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric", month: "long", day: "numeric",
  });
}

export function timeAgo(date: string | Date) {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// Country → flag emoji (auto-generated from region codes)
const countryNameToCode: Record<string, string> = {
  "afghanistan": "AF", "albania": "AL", "algeria": "DZ", "andorra": "AD", "angola": "AO",
  "argentina": "AR", "armenia": "AM", "australia": "AU", "austria": "AT", "azerbaijan": "AZ",
  "bahrain": "BH", "bangladesh": "BD", "belarus": "BY", "belgium": "BE", "bolivia": "BO",
  "bosnia": "BA", "brazil": "BR", "bulgaria": "BG", "cambodia": "KH", "canada": "CA",
  "chile": "CL", "china": "CN", "colombia": "CO", "costa rica": "CR", "croatia": "HR",
  "cuba": "CU", "cyprus": "CY", "czech": "CZ", "denmark": "DK", "egypt": "EG",
  "estonia": "EE", "ethiopia": "ET", "finland": "FI", "france": "FR", "georgia": "GE",
  "germany": "DE", "ghana": "GH", "greece": "GR", "hong kong": "HK", "hungary": "HU",
  "iceland": "IS", "india": "IN", "indonesia": "ID", "iran": "IR", "iraq": "IQ",
  "ireland": "IE", "israel": "IL", "italy": "IT", "jamaica": "JM", "japan": "JP",
  "jordan": "JO", "kazakhstan": "KZ", "kenya": "KE", "kuwait": "KW", "laos": "LA",
  "latvia": "LV", "lebanon": "LB", "lithuania": "LT", "luxembourg": "LU", "malaysia": "MY",
  "maldives": "MV", "mexico": "MX", "mongolia": "MN", "morocco": "MA", "myanmar": "MM",
  "nepal": "NP", "netherlands": "NL", "new zealand": "NZ", "nigeria": "NG", "norway": "NO",
  "pakistan": "PK", "palestine": "PS", "panama": "PA", "peru": "PE", "philippines": "PH",
  "poland": "PL", "portugal": "PT", "qatar": "QA", "romania": "RO", "russia": "RU",
  "saudi arabia": "SA", "serbia": "RS", "singapore": "SG", "slovakia": "SK", "slovenia": "SI",
  "south africa": "ZA", "south korea": "KR", "spain": "ES", "sri lanka": "LK", "sweden": "SE",
  "switzerland": "CH", "taiwan": "TW", "thailand": "TH", "turkey": "TR", "ukraine": "UA",
  "uae": "AE", "uk": "GB", "usa": "US", "united states": "US", "united kingdom": "GB",
  "uruguay": "UY", "venezuela": "VE", "vietnam": "VN",
};

const countryNamesZh: Record<string, string> = {
  China: "中国", Thailand: "泰国", Japan: "日本", "South Korea": "韩国",
  "Hong Kong, China": "中国香港", Singapore: "新加坡", Malaysia: "马来西亚",
  Indonesia: "印度尼西亚", Philippines: "菲律宾", Vietnam: "越南", India: "印度",
  USA: "美国", UK: "英国", France: "法国", Germany: "德国", Brazil: "巴西",
  Australia: "澳大利亚", Canada: "加拿大", Italy: "意大利", Spain: "西班牙",
  Mexico: "墨西哥", Argentina: "阿根廷", Russia: "俄罗斯", Turkey: "土耳其",
  Egypt: "埃及", "South Africa": "南非", Nigeria: "尼日利亚", Kenya: "肯尼亚",
  "New Zealand": "新西兰", Netherlands: "荷兰", Belgium: "比利时", Sweden: "瑞典",
  Norway: "挪威", Denmark: "丹麦", Finland: "芬兰", Poland: "波兰",
  Ukraine: "乌克兰", Portugal: "葡萄牙", Greece: "希腊", Austria: "奥地利",
  Switzerland: "瑞士", Ireland: "爱尔兰", UAE: "阿联酋", "Saudi Arabia": "沙特阿拉伯",
  Qatar: "卡塔尔", Israel: "以色列", Pakistan: "巴基斯坦", Bangladesh: "孟加拉国",
  Myanmar: "缅甸", Cambodia: "柬埔寨", Laos: "老挝", Nepal: "尼泊尔",
  Mongolia: "蒙古", Kazakhstan: "哈萨克斯坦", Chile: "智利", Colombia: "哥伦比亚",
  Peru: "秘鲁", Venezuela: "委内瑞拉", Cuba: "古巴", Morocco: "摩洛哥",
  Ghana: "加纳", Ethiopia: "埃塞俄比亚", Czech: "捷克", Hungary: "匈牙利",
  Romania: "罗马尼亚", Bulgaria: "保加利亚", Croatia: "克罗地亚", Serbia: "塞尔维亚",
  Lithuania: "立陶宛", Latvia: "拉脱维亚", Estonia: "爱沙尼亚",
  Iceland: "冰岛", Jamaica: "牙买加", Panama: "巴拿马", Uruguay: "乌拉圭",
  Bolivia: "玻利维亚", Ecuador: "厄瓜多尔", Iran: "伊朗", Iraq: "伊拉克",
  Algeria: "阿尔及利亚", Angola: "安哥拉", Jordan: "约旦", Lebanon: "黎巴嫩",
  Palestine: "巴勒斯坦", SriLanka: "斯里兰卡",
};

const countryNamesTh: Record<string, string> = {
  China: "จีน", Thailand: "ไทย", Japan: "ญี่ปุ่น", "South Korea": "เกาหลีใต้",
  "Hong Kong, China": "ฮ่องกง", Singapore: "สิงคโปร์", USA: "สหรัฐอเมริกา",
  UK: "อังกฤษ", France: "ฝรั่งเศส", Germany: "เยอรมนี", Australia: "ออสเตรเลีย",
  India: "อินเดีย", Vietnam: "เวียดนาม", Philippines: "ฟิลิปปินส์",
  Indonesia: "อินโดนีเซีย", Malaysia: "มาเลเซีย", Brazil: "บราซิล",
  Canada: "แคนาดา", Italy: "อิตาลี", Spain: "สเปน", Russia: "รัสเซีย",
};

export function countryName(country: string | null | undefined, locale: string = "en"): string {
  if (!country) return "";
  if (locale === "zh") return countryNamesZh[country] || country;
  if (locale === "th") return countryNamesTh[country] || country;
  return country;
}

export function countryFlag(country: string | null | undefined): string {
  if (!country) return "";
  const lower = country.toLowerCase().trim();

  // Direct code match
  const code = countryNameToCode[lower];
  if (code) {
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
  }

  // Partial match — prioritize longer match
  let bestMatch: string | null = null;
  let bestLen = 0;
  for (const [name, c] of Object.entries(countryNameToCode)) {
    if (lower.includes(name)) {
      if (name.length > bestLen) { bestMatch = c; bestLen = name.length; }
    }
  }

  if (bestMatch) {
    return String.fromCodePoint(...[...bestMatch.toUpperCase()].map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65));
  }

  return "🌍";
}

// Simplified → Traditional Chinese converter (lightweight)
let s2tConverter: ((text: string) => string) | null = null;
async function getS2TConverter() {
  if (s2tConverter) return s2tConverter;
  const { SimplifiedToTraditional } = await import("opencc-js");
  s2tConverter = SimplifiedToTraditional({});
  return s2tConverter;
}

export async function toTraditional(text: string): Promise<string> {
  try {
    const cnv = await getS2TConverter();
    return cnv(text);
  } catch {
    return text;
  }
}

// Helper: check if locale is a Chinese variant
export function isZhLocale(locale: string): boolean {
  return locale === "zh" || locale === "zht" || locale === "yue";
}
