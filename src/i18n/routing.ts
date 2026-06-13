import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh", "zht", "yue", "th"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
