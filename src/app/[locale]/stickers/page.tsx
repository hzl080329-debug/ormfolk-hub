import { getCommunityStickers, getMyStickers } from "@/lib/actions";
import { auth } from "@/lib/auth";
import StickersClient from "./StickersClient";

export default async function StickersPage() {
  const session = await auth();
  const communityStickers = await getCommunityStickers();
  const myStickers = session?.user?.id ? await getMyStickers() : [];

  return (
    <StickersClient
      communityStickers={communityStickers.map(s => ({ ...s, createdAt: s.createdAt.toISOString() }))}
      myStickers={myStickers.map(s => ({ ...s, createdAt: s.createdAt.toISOString() }))}
      isLoggedIn={!!session?.user?.id}
    />
  );
}
