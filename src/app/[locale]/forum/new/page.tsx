import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NewPostClient from "./NewPostClient";

export default async function NewPostPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const [categories, events] = await Promise.all([
    prisma.forumCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.event.findMany({ orderBy: { date: "asc" }, select: { id: true, titleEn: true, titleZh: true, titleTh: true, date: true } }),
  ]);

  return <NewPostClient categories={categories} events={events} />;
}
