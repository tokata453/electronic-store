// utils/bucket.js
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const path = require('path');

// Configure S3 client pointing to Railway Bucket
const s3 = new S3Client({
  region: process.env.BUCKET_REGION || 'auto',
  endpoint: `https://${process.env.BUCKET_HOST}`,
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY_ID,
    secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for Railway
});

const BUCKET_NAME = process.env.BUCKET_NAME;

/**
 * Upload a file buffer to Railway Bucket
 * @param {Buffer} buffer     - File data
 * @param {string} folder     - Folder: 'products' | 'categories' | 'avatars'
 * @param {string} mimetype   - e.g. 'image/jpeg'
 * @param {string} originalName - Original filename (for extension)
 * @returns {Promise<{url, key}>}
 */
const uploadFile = async (buffer, folder, mimetype, originalName) => {
  // Build a unique key:  products/1712345678-839201234.jpg
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1_000_000_000);
  const key = `${folder}/${timestamp}-${random}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
  );

  // Public URL
  const url = `https://${process.env.BUCKET_HOST}/${BUCKET_NAME}/${key}`;
  return { url, key };
};

/**
 * Delete a file from Railway Bucket by key
 * @param {string} key - e.g. 'products/1712345678-839201234.jpg'
 */
const deleteFile = async (key) => {
  if (!key) return;
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
};

/**
 * Extract the key from a full bucket URL
 * e.g. 'https://bucket.railway.app/my-bucket/products/abc.jpg' → 'products/abc.jpg'
 */
const keyFromUrl = (url) => {
  if (!url) return null;
  try {
    const prefix = `https://${process.env.BUCKET_HOST}/${BUCKET_NAME}/`;
    return url.startsWith(prefix) ? url.replace(prefix, '') : null;
  } catch {
    return null;
  }
};

module.exports = { uploadFile, deleteFile, keyFromUrl };