import { v2 as cloudinary } from "cloudinary";

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName) {
    throw new Error("CLOUDINARY_CLOUD_NAME is not configured in .env.local");
  }

  return { cloudName, apiKey, apiSecret, uploadPreset };
}

function configureCloudinary() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

  if (!apiKey || !apiSecret) {
    throw new Error(
      "CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are required for signed uploads",
    );
  }

  if (apiSecret.length < 15) {
    throw new Error(
      "CLOUDINARY_API_SECRET looks truncated. Copy the full API secret from Cloudinary Dashboard → Settings → API Keys.",
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

async function uploadImageUnsigned(
  file: File,
  cloudName: string,
  uploadPreset: string,
  folder: string,
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      result?.error?.message ??
      `Cloudinary unsigned upload failed (${response.status})`;
    throw new Error(message);
  }

  if (!result.secure_url) {
    throw new Error("Cloudinary upload did not return a secure URL");
  }

  return result.secure_url as string;
}

async function uploadImageSigned(file: File, folder: string) {
  configureCloudinary();

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder, resource_type: "image" },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error ?? new Error("Cloudinary upload failed"));
            return;
          }

          resolve({ secure_url: uploadResult.secure_url });
        },
      )
      .end(buffer);
  });

  return result.secure_url;
}

export function getCloudinaryUploadErrorMessage(error: unknown): string {
  const message =
    error instanceof Error ? error.message : "Failed to upload image";

  if (message.includes("Invalid Signature")) {
    return "Cloudinary authentication failed. Update CLOUDINARY_API_SECRET in .env.local with the full API secret from your Cloudinary dashboard.";
  }

  if (message.includes("truncated")) {
    return message;
  }

  if (message.includes("upload_preset")) {
    return `Cloudinary upload preset error: ${message}`;
  }

  return message;
}

export async function uploadImage(file: File, folder = "flipkliq/polls") {
  const { cloudName, uploadPreset } = getCloudinaryConfig();

  if (uploadPreset) {
    return uploadImageUnsigned(file, cloudName, uploadPreset, folder);
  }

  return uploadImageSigned(file, folder);
}
