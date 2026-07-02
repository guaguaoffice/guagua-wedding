import { prisma } from "@/lib/prisma";
import { GuestCheckinPage } from "./GuestCheckinPage";

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const guest = await prisma.guest.findUnique({
    where: { checkinToken: token },
    include: {
      wedding: true,
      table: true,
    },
  });

  if (!guest) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-bg px-6 text-center">
        <h1 className="text-xl font-bold">無效的連結</h1>
        <p className="text-text-soft mt-2 text-sm">請跟新人確認你的專屬報到連結。</p>
      </main>
    );
  }

  return (
    <GuestCheckinPage
      token={token}
      guestName={guest.name}
      tableName={guest.table?.name ?? null}
      checkedInAt={guest.checkedInAt}
      weddingName={guest.wedding.name}
      weddingDate={guest.wedding.weddingDate}
      venueName={guest.wedding.venueName}
      cardTitle={guest.wedding.rsvpCardTitle}
      cardSubtitle={guest.wedding.rsvpCardSubtitle}
      cardImageUrl={guest.wedding.rsvpCardImageUrl}
    />
  );
}
