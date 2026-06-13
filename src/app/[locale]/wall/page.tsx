import { prisma } from "@/lib/prisma";
import WallClient from "./WallClient";

export default async function WallPage() {
  const messages = await prisma.wallMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const serialized = messages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  return <WallClient messages={serialized} />;
}
