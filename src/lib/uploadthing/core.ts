import { stackServerApp } from "@/app/stack/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const uploadRouter = {
  // Route for resume profile photos
  profilePhoto: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const user = await stackServerApp.getUser();

      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Profile photo uploaded for userId:", metadata.userId);
      console.log("File URL:", file.ufsUrl);

      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
      };
    }),

  // Route for any document uploads (future use)
  documentUpload: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
    "application/msword": { maxFileSize: "16MB", maxFileCount: 5 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "16MB",
      maxFileCount: 5,
    },
  })
    .middleware(async () => {
      const user = await stackServerApp.getUser();

      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Document uploaded for userId:", metadata.userId);

      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
        name: file.name,
      };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
