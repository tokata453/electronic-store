// test-bucket.js
// Run this script to test Railway Bucket connection
// Usage: node test-bucket.js

require('dotenv').config();

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} = require('@aws-sdk/client-s3');

// ─── Colors for console output ────────────────
const green  = (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`);
const red    = (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`);
const blue   = (msg) => console.log(`\x1b[36mℹ️  ${msg}\x1b[0m`);
const yellow = (msg) => console.log(`\x1b[33m⚠️  ${msg}\x1b[0m`);

// ─── Check env vars first ─────────────────────
function checkEnvVars() {
  console.log('\n📋 Checking environment variables...\n');

  const required = [
    'BUCKET_HOST',
    'BUCKET_NAME',
    'BUCKET_ACCESS_KEY_ID',
    'BUCKET_SECRET_ACCESS_KEY',
  ];

  let allGood = true;

  required.forEach((key) => {
    if (process.env[key]) {
      green(`${key} = ${process.env[key].substring(0, 20)}...`);
    } else {
      red(`${key} is MISSING`);
      allGood = false;
    }
  });

  return allGood;
}

// ─── Create S3 client ─────────────────────────
function createClient() {
  const region = process.env.BUCKET_REGION || 'us-east-1';
  const isAws = !process.env.BUCKET_HOST || process.env.BUCKET_HOST.includes('amazonaws.com');

  return new S3Client({
    region,
    ...(isAws ? {} : { endpoint: `https://${process.env.BUCKET_HOST}` }),
    credentials: {
      accessKeyId: process.env.BUCKET_ACCESS_KEY_ID,
      secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY,
    },
    forcePathStyle: !isAws,
  });
}

function getPublicUrl(bucket, key) {
  const region = process.env.BUCKET_REGION || 'us-east-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

// ─── Tests ────────────────────────────────────
async function runTests() {
  console.log('\n🧪 Testing Railway Bucket Connection...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Check env vars
  const envOk = checkEnvVars();
  if (!envOk) {
    red('\nFix missing environment variables first!\n');
    process.exit(1);
  }

  const s3 = createClient();
  const BUCKET = process.env.BUCKET_NAME;
  const TEST_KEY = 'test/connection-test.txt';
  let passed = 0;
  let failed = 0;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ── Test 1: Upload a test file ──────────────
  blue('Test 1: Uploading test file...');
  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: TEST_KEY,
      Body: Buffer.from('Railway Bucket connection test - ' + new Date().toISOString()),
      ContentType: 'text/plain',
    }));

    const publicUrl = getPublicUrl(BUCKET, TEST_KEY);
    green(`Upload successful!`);
    console.log(`   URL: ${publicUrl}\n`);
    passed++;
  } catch (err) {
    red(`Upload failed: ${err.message}\n`);
    failed++;
  }

  // ── Test 2: List files in bucket ────────────
  blue('Test 2: Listing files in bucket...');
  try {
    const result = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: 'test/',
    }));

    const files = result.Contents || [];
    green(`Listing successful! Found ${files.length} file(s) in test/ folder`);
    files.forEach(f => console.log(`   - ${f.Key} (${f.Size} bytes)`));
    console.log('');
    passed++;
  } catch (err) {
    red(`Listing failed: ${err.message}\n`);
    failed++;
  }

  // ── Test 3: Delete test file ─────────────────
  blue('Test 3: Deleting test file...');
  try {
    await s3.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: TEST_KEY,
    }));

    green(`Delete successful! Test file cleaned up\n`);
    passed++;
  } catch (err) {
    red(`Delete failed: ${err.message}\n`);
    failed++;
  }

  // ── Test 4: Upload a test image ──────────────
  blue('Test 4: Uploading a test image (1x1 PNG)...');
  try {
    // Smallest valid PNG - 1x1 transparent pixel
    const tiny1x1PNG = Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489' +
      '0000000a49444154789c6260000000020001e221bc330000000049454e44ae426082',
      'hex'
    );

    const imgKey = 'test/test-image.png';
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: imgKey,
      Body: tiny1x1PNG,
      ContentType: 'image/png',
    }));

    const imageUrl = getPublicUrl(BUCKET, imgKey);
    green(`Image upload successful!`);
    console.log(`   Image URL: ${imageUrl}`);
    console.log(`   Open URL in browser to verify it loads\n`);

    // Cleanup
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: imgKey }));
    green(`Test image cleaned up\n`);
    passed++;
  } catch (err) {
    red(`Image upload failed: ${err.message}\n`);
    failed++;
  }

  // ── Summary ──────────────────────────────────
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RESULTS\n');
  green(`Passed: ${passed} / ${passed + failed}`);
  if (failed > 0) red(`Failed: ${failed}`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (failed === 0) {
    green('🎉 All tests passed! Railway Bucket is working!\n');
    console.log('Your bucket is ready. You can now:');
    console.log('  - Upload product images:  POST /api/upload/product/:id');
    console.log('  - Upload category images: POST /api/upload/category/:id');
    console.log('  - Upload user avatar:     POST /api/upload/avatar\n');
  } else {
    yellow('Some tests failed. Check the errors above.\n');
    console.log('Common fixes:');
    console.log('  1. Check your .env variables are correct');
    console.log('  2. Make sure bucket is created in Railway');
    console.log('  3. Verify BUCKET_HOST includes the full domain\n');
  }
}

runTests().catch((err) => {
  red(`\nUnexpected error: ${err.message}\n`);
  process.exit(1);
});
