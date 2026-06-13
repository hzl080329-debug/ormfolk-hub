import { prisma } from "@/lib/prisma";
import TimelineClient from "./TimelineClient";

export default async function TimelinePage() {
  const [timelineEntries, events] = await Promise.all([
    prisma.timelineEntry.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }, { day: "desc" }] }),
    prisma.event.findMany({ orderBy: { date: "asc" } }),
  ]);

  // Combine timeline entries + events into unified timeline items
  const allItems: any[] = [
    ...timelineEntries.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      source: "timeline",
    })),
    ...events.map((e) => ({
      id: e.id,
      year: new Date(e.date).getFullYear(),
      month: new Date(e.date).getMonth() + 1,
      day: new Date(e.date).getDate(),
      titleEn: e.titleEn,
      titleZh: e.titleZh,
      titleTh: e.titleTh,
      descriptionEn: e.descriptionEn,
      descriptionZh: e.descriptionZh,
      descriptionTh: e.descriptionTh,
      type: e.type === "online" ? "event" : "event",
      actor: "both",
      imageUrl: e.imageUrl,
      location: e.location,
      eventType: e.type,
      createdAt: e.createdAt.toISOString(),
      source: "event",
    })),
  ];

  // Sort by date descending
  allItems.sort((a, b) => {
    const aDate = a.year * 10000 + a.month * 100 + a.day;
    const bDate = b.year * 10000 + b.month * 100 + b.day;
    return bDate - aDate;
  });

  return <TimelineClient items={allItems} />;
}
