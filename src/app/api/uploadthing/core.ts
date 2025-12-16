import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { db } from "@/lib/prisma";

const f = createUploadthing();
const utapi = new UTApi();

const getUser = async () => {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch {
    return null;
  }
};

// Best effort: extract UploadThing key from URL that contains "/f/"
function getUploadThingKeyFromUrl(url?: string | null) {
  if (!url) return null;
  const idx = url.indexOf("/f/");
  if (idx === -1) return null;

  // everything after /f/ until ? or #
  const after = url.slice(idx + 3);
  const key = after.split("?")[0]?.split("#")[0];
  return key || null;
}

export const ourFileRouter = {
  goalImageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getUser();
      if (!session) throw new UploadThingError("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const media = await db.media.create({
        data: {
          url: file.ufsUrl,
          fileName: file.name ?? "upload",
          fileType: (file.type ?? "image").split("/")[0],
          mimeType: file.type ?? "image/*",
          extension: file.name?.split(".").pop() ?? "",
          fileSize: file.size ?? 0,
          uploadedBy: metadata.userId,
        },
      });

      return { mediaId: media.id, ufsUrl: file.ufsUrl };
    }),

  avatarUploader: f({
    image: { maxFileSize: "2MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getUser();
      if (!session) throw new UploadThingError("Unauthorized");

      const oldUrl = session.user.image ?? null; // existing avatar url
      const oldKey = getUploadThingKeyFromUrl(oldUrl);

      return { userId: session.user.id, oldKey };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Save media entry
      const media = await db.media.create({
        data: {
          url: file.ufsUrl,
          fileName: file.name ?? "avatar",
          fileType: "image",
          mimeType: file.type ?? "image/*",
          extension: file.name?.split(".").pop() ?? "",
          fileSize: file.size ?? 0,
          uploadedBy: metadata.userId,
        },
      });

      // Delete old avatar AFTER new upload succeeded
      // Prevent deleting the same file if user reuploads quickly
      if (metadata.oldKey && metadata.oldKey !== file.key) {
        try {
          await utapi.deleteFiles(metadata.oldKey);
        } catch (err) {
          console.warn("⚠️ Failed to delete old avatar:", err);
        }
      }

      return { mediaId: media.id, ufsUrl: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
