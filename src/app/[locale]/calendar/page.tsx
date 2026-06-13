import { prisma } from "@/lib/prisma";
import CalendarClient from "./CalendarClient";

export default async function CalendarPage() {
  const events = await prisma.event.findMany({ orderBy: { date: "asc" } });
  const serialized = events.map(e => ({ ...e, createdAt: e.createdAt.toISOString() }));
  return <CalendarClient events={serialized} />;
}
