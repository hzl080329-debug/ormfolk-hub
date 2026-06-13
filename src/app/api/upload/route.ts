import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { createWriteStream } from "fs";
import path from "path";
import { auth } from "@/lib/auth";
import { Readable } from "stream";

const ALLOWED_EXTS = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "svg", "heic", "heif",
  "mp4", "webm", "mov", "avi", "mkv",
  "pdf", "zip", "rar",
]);
const MAX_SIZE = 500 * 1024 * 1024;

export const maxDuration = 300;

async function uploadToBlob(filename: string, buffer: Buffer, mimeType: string): Promise<string> {
  const { put } = await import("@vercel/blob");
  const blob = await put(filename, buffer, { access: "public", contentType: mimeType });
  return blob.url;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

  try {
    const Busboy = (await import("busboy")).default;
    const nodeReadable = Readable.fromWeb(request.body as any);

    if (!useBlob) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
    }

    const result: { url: string; filename: string }[] = [];
    const errors: { index: number; name: string; error: string }[] = [];
    let idx = 0;
    let pendingWrites = 0;

    await new Promise<void>((resolve) => {
      const bb = Busboy({ headers: { "content-type": contentType }, limits: { fileSize: MAX_SIZE } });

      const checkDone = () => {
        if (pendingWrites === 0) resolve();
      };

      bb.on("file", (fieldname: string, fileStream: NodeJS.ReadableStream, info: { filename: string; mimeType: string }) => {
        const currentIdx = idx++;
        const ext = info.filename.split(".").pop()?.toLowerCase() || "jpg";

        if (!ALLOWED_EXTS.has(ext)) {
          fileStream.resume();
          errors.push({ index: currentIdx, name: info.filename, error: `File type .${ext} not allowed` });
          return;
        }

        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        pendingWrites++;

        if (useBlob) {
          // Vercel Blob: collect chunks into buffer
          const chunks: Buffer[] = [];
          let size = 0;
          fileStream.on("data", (chunk: Buffer) => {
            size += chunk.length;
            if (size > MAX_SIZE) {
              fileStream.destroy(new Error(`File too large: ${(size / 1024 / 1024).toFixed(0)}MB (max 500MB)`));
            }
            chunks.push(chunk);
          });
          fileStream.on("end", async () => {
            try {
              const url = await uploadToBlob(filename, Buffer.concat(chunks), info.mimeType);
              result.push({ url, filename });
            } catch (err: any) {
              errors.push({ index: currentIdx, name: info.filename, error: err.message });
            }
            pendingWrites--;
            checkDone();
          });
          fileStream.on("error", (err: Error) => {
            errors.push({ index: currentIdx, name: info.filename, error: err.message });
            pendingWrites--;
            checkDone();
          });
        } else {
          // Local filesystem
          const uploadDir = path.join(process.cwd(), "public", "uploads");
          const filepath = path.join(uploadDir, filename);
          const writeStream = createWriteStream(filepath);
          let size = 0;
          fileStream.on("data", (chunk: Buffer) => {
            size += chunk.length;
            if (size > MAX_SIZE) {
              fileStream.destroy(new Error(`File too large: ${(size / 1024 / 1024).toFixed(0)}MB (max 500MB)`));
            }
          });
          fileStream.on("error", (err: Error) => {
            errors.push({ index: currentIdx, name: info.filename, error: err.message });
          });
          writeStream.on("finish", () => {
            result.push({ url: `/uploads/${filename}`, filename });
            pendingWrites--;
            checkDone();
          });
          writeStream.on("error", (err: Error) => {
            errors.push({ index: currentIdx, name: info.filename, error: err.message });
            pendingWrites--;
            checkDone();
          });
          fileStream.pipe(writeStream);
        }
      });

      bb.on("error", (err: Error) => {
        errors.push({ index: -1, name: "request", error: err.message });
        pendingWrites = 0;
        resolve();
      });

      bb.on("finish", () => { checkDone(); });

      nodeReadable.pipe(bb);
    });

    return NextResponse.json({
      files: result,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
