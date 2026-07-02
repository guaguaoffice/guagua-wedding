import { prisma } from "@/lib/prisma";
import { RsvpForm } from "@/app/rsvp/[token]/RsvpForm";

export default async function RsvpPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const wedding = await prisma.wedding.findUnique({ where: { rsvpToken: token } });

  if (!wedding) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-24 min-h-screen text-center">
        <h1 className="text-xl font-bold">這個連結已失效</h1>
        <p className="text-text-soft max-w-sm">
          請跟新人確認最新的出席回覆連結。
        </p>
      </main>
    );
  }

  const bgColor = wedding.rsvpCardColor || "#e4f0ea";
  return (
    <main className="flex-1 flex flex-col items-center px-6 py-16 min-h-screen" style={{ backgroundColor: bgColor }}>
      <RsvpForm
        token={token}
        weddingName={wedding.name}
        weddingDate={wedding.weddingDate}
        cardTitle={wedding.rsvpCardTitle}
        cardSubtitle={wedding.rsvpCardSubtitle}
        cardImageUrl={wedding.rsvpCardImageUrl}
        cardColor={wedding.rsvpCardColor}
        venueName={wedding.venueName}
        venueDetail={wedding.venueDetail}
      />
    </main>
  );
}
