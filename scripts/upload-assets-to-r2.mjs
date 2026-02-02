#!/usr/bin/env node
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createReadStream } from "fs";
import { readdir, stat } from "fs/promises";
import path from "path";
import mime from "mime-types";

const requiredEnv = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
];

const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`[upload-assets-to-r2] Missing environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const endpoint = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;

const client = new S3Client({
  region: "auto",
  endpoint,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const TARGETS = [
  { localDir: path.resolve("public/animations/gacha"), prefix: "animations/gacha" },
  { localDir: path.resolve("public/assets"), prefix: "assets" },
];

async function walk(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(async (dirent) => {
      const res = path.resolve(dir, dirent.name);
      if (dirent.isDirectory()) {
        return walk(res);
      }
      if (dirent.isFile()) {
        return [res];
      }
      return [];
    })
  );
  return files.flat();
}

async function uploadFile(filePath, prefix, baseDir) {
  const relative = path.relative(baseDir, filePath).replace(/\\/g, "/");
  const key = `${prefix}/${relative}`;
  const contentType = mime.lookup(filePath) || "application/octet-stream";
  const fileStat = await stat(filePath);
  const bodyStream = createReadStream(filePath);

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: bodyStream,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
      ContentLength: fileStat.size,
    })
  );

  console.log(`Uploaded ${key} (${(fileStat.size / 1024).toFixed(1)} KB)`);
}

async function main() {
  for (const target of TARGETS) {
    try {
      const stats = await stat(target.localDir).catch(() => null);
      if (!stats || !stats.isDirectory()) {
        console.warn(`[upload-assets-to-r2] Skip missing directory: ${target.localDir}`);
        continue;
      }
      const files = await walk(target.localDir);
      for (const file of files) {
        await uploadFile(file, target.prefix, target.localDir);
      }
    } catch (error) {
      console.error(`[upload-assets-to-r2] Failed to upload from ${target.localDir}`, error);
      process.exit(1);
    }
  }

  console.log("All assets uploaded to R2.");
}

main();
