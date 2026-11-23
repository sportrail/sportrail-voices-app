// Vercel rejects request bodies over 4.5 MB before the route runs, and phone
// photos are often 4-8 MB. Posts render at 1080 wide, so a 2160 px long side
// keeps headroom for the cover crop while landing well under the limit.
const MAX_LONG_SIDE = 2160;
const KEEP_AS_IS_BYTES = 3 * 1024 * 1024;
const JPEG_QUALITY = 0.9;

export async function shrinkPhoto(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const longSide = Math.max(bitmap.width, bitmap.height);
    if (longSide <= MAX_LONG_SIDE && file.size <= KEEP_AS_IS_BYTES) {
      bitmap.close();
      return file;
    }

    const ratio = Math.min(1, MAX_LONG_SIDE / longSide);
    const width = Math.round(bitmap.width * ratio);
    const height = Math.round(bitmap.height * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    // Decoding failed: let the server validate and report the original file.
    return file;
  }
}
