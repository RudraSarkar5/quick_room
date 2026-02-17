// controllers/uploadController.js
import { S3Client, PutObjectCommand,DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

//generate presigned url
export const generateUploadUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.body || {};

    if (!fileName || !fileType) {
      return res.status(400).json({ message: "fileName and fileType are required" });
    }

    const region = process.env.AWS_REGION;
    const bucket = process.env.S3_BUCKET_NAME;

    if (!region || !bucket) {
      return res.status(500).json({ message: "Server misconfigured: AWS_REGION or S3_BUCKET_NAME missing" });
    }

    // Create S3 client (simple: from env variables you already have)
    const s3 = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,         // your env naming
        secretAccessKey: process.env.AWS_SECRET_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN || undefined, // optional
      },
    });

    // Build an S3 object key; use a folder to keep things neat
    const key = `uploads/${Date.now()}-${fileName}`;

    const putCmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType, // must match what you PUT from frontend
    });

    // Presigned URL (valid for 15 minutes)
    const uploadUrl = await getSignedUrl(s3, putCmd, { expiresIn: 900 });

    return res.status(200).json({ uploadUrl, key });
  } catch (err) {
    console.error("generateUploadUrl error:", err);
    return res.status(500).json({
      message: "Failed to generate upload URL",
      error: err.message,
    });
  }
};



export async function deleteFromS3(key) {
  try {
    if (!key) {
      throw new Error("S3 key is required");
    }

    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN || undefined,
      },
    });

    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      })
    );

    console.log(`🗑️ Deleted from S3: ${key}`);
    return true;
  } catch (err) {
    console.error("Failed to delete from S3:", err.message);
    return false;
  }
}