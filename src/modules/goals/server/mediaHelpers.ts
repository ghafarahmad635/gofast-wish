
import type { Prisma } from "@prisma/client";
import { utapi } from "./procedures";


function getUploadThingKeyFromUrl(url: string | null | undefined) {
  if (!url) return null;
  const idx = url.indexOf("/f/");
  if (idx === -1) return null;
  return url.slice(idx + 3);
}

export async function maybeDeleteOldMedia(
  tx: Prisma.TransactionClient,
  mediaId: string | null,
) {
  if (!mediaId) return;

  const media = await tx.media.findUnique({
    where: { id: mediaId },
    select: { id: true, url: true, isSystem: true },
  });
  if (!media) return;

  // Never delete system defaults
  if (media.isSystem) return;

  // If still referenced by any goal, do not delete
  const usedByGoal = await tx.goal.findFirst({
    where: { featuredImageId: mediaId },
    select: { id: true },
  });
  if (usedByGoal) return;

  // If referenced by addon icons, do not delete
  const usedByAddon = await tx.addOn.findFirst({
    where: { iconId: mediaId },
    select: { id: true },
  });
  if (usedByAddon) return;

  // Delete Uploadthing file if applicable
  const utKey = getUploadThingKeyFromUrl(media.url);
  if (utKey) {
    try {
      await utapi.deleteFiles(utKey);
    } catch (err) {
      console.warn("⚠️ Failed to delete Uploadthing file:", err);
    }
  }

  // Delete Media row
  await tx.media.delete({ where: { id: mediaId } });
}
