import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { db } from "@/lib/prisma";

const f = createUploadthing();

const getUser = async () => {
  try {
    const user = await auth.api.getSession({
      headers: await headers(),
    });
    return user;
  } catch {
    return null;
  }
};

// FileRouter for your app
export const ourFileRouter = {
  goalImageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await getUser();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);

      // ✅ Save media entry directly to DB
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

      // ✅ Return the new Media ID to the client
      return { mediaId: media.id, ufsUrl: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
