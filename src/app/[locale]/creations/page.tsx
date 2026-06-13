import { prisma } from "@/lib/prisma";
import CreationsClient from "./CreationsClient";

export default async function CreationsPage() {
  const creations = await prisma.creation.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });

  const serialized = creations.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    author: c.author
      ? { id: c.author.id, name: c.author.name, username: c.author.username }
      : null,
  }));

  return <CreationsClient creations={serialized} />;
}
