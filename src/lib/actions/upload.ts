"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

export async function uploadRsvpCardImage(weddingId: string, formData: FormData) {
  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) return { ok: false as const, error: "請選擇圖片" };
  if (file.size > 5 * 1024 * 1024) return { ok: false as const, error: "圖片不能超過 5MB" };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${weddingId}/rsvp-card.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from("wedding-images")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (error) return { ok: false as const, error: `上傳失敗：${error.message}` };

  const { data } = supabaseAdmin.storage.from("wedding-images").getPublicUrl(path);
  const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

  await prisma.wedding.update({
    where: { id: weddingId },
    data: { rsvpCardImageUrl: publicUrl },
  });

  revalidatePath("/guest");
  return { ok: true as const, url: publicUrl };
}

export async function removeRsvpCardImage(weddingId: string) {
  await prisma.wedding.update({
    where: { id: weddingId },
    data: { rsvpCardImageUrl: null },
  });
  revalidatePath("/guest");
}
