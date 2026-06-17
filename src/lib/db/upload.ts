import type { UploadInput } from "./library";

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

const ACCEPTED = new Set(Object.keys(EXT_BY_TYPE));

/** Pull a single uploaded image File from multipart form data into bytes. */
export async function readUpload(
  form: FormData,
  field = "file",
): Promise<UploadInput> {
  const file = form.get(field);
  if (!(file instanceof File)) throw new Error("no file provided");
  if (!ACCEPTED.has(file.type)) {
    throw new Error(`unsupported image type: ${file.type || "unknown"}`);
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext =
    EXT_BY_TYPE[file.type] ??
    (file.name.includes(".") ? file.name.split(".").pop()! : "png");
  return { bytes, contentType: file.type, ext };
}
