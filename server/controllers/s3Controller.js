
import { S3Client, PutObjectCommand,DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

// Generate presigned POST URL
export const generateUploadUrl = async (req, res) => {
  try {
    const { fileName, fileType, fileSize } = req.body || {};

    if (!fileName || !fileSize) {
      return res.status(400).json({ message: "fileName, fileType, and fileSize are required" });
    }

    // Check file size (50 MB = 50 * 1024 * 1024 bytes)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (fileSize > MAX_SIZE) {
      return res.status(400).json({ message: "File size exceeds 50 MB limit" });
    }

    const region = process.env.AWS_REGION;
    const bucket = process.env.S3_BUCKET_NAME;

    if (!region || !bucket) {
      return res.status(500).json({ message: "Server misconfigured: AWS_REGION or S3_BUCKET_NAME missing" });
    }

    const s3 = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN || undefined,
      },
    });

    // Build an S3 object key
    const key = `uploads/${Date.now()}-${fileName}`;

    // Create presigned POST with conditions
    const presignedPost = await createPresignedPost(s3, {
      Bucket: bucket,
      Key: key,
      Conditions: [
        ["content-length-range", 0, MAX_SIZE], // enforce max size at S3 level
        
      ],
      Fields: {
        "Content-Type": fileType,
        ResponseContentDisposition: `attachment; filename="${fileName}"`,

      },
      Expires: 900, 
    });

    return res.status(200).json({ presignedPost, key });
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

    console.log(`Deleted from S3: ${key}`);
    return true;
  } catch (err) {
    console.error("Failed to delete from S3:", err.message);
    return false;
  }
}