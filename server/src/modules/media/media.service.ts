import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import { MediaAsset } from "./schemas/media-asset.schema";

const UPLOAD_DIR = join(process.cwd(), "uploads");

@Injectable()
export class MediaService {
  constructor(@InjectModel(MediaAsset.name) private readonly model: Model<MediaAsset>) {}

  findAll(): Promise<MediaAsset[]> {
    return this.model.find().sort({ createdAt: -1 }).lean() as any;
  }

  /** Converts uploaded images to WebP and enforces alt text as a required field, per the platform's media pipeline requirement. */
  async upload(file: Express.Multer.File, altText: string, uploadedBy?: string): Promise<MediaAsset> {
    if (!altText?.trim()) throw new BadRequestException("altText is required for every media asset");

    await mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `${randomUUID()}.webp`;
    const webpBuffer = await sharp(file.buffer).webp({ quality: 82 }).toBuffer();
    await writeFile(join(UPLOAD_DIR, filename), webpBuffer);

    return this.model.create({
      filename,
      url: `/uploads/${filename}`,
      mimeType: "image/webp",
      size: webpBuffer.length,
      altText,
      uploadedBy,
    });
  }
}
