import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve('public');
const IMAGE_DIR = path.resolve('public/image');

async function getStats(dir) {
  const files = fs.readdirSync(dir);
  let totalBytes = 0;
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      totalBytes += stat.size;
    }
  }
  return totalBytes;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

  const originalStat = fs.statSync(filePath);
  const originalSize = originalStat.size;

  try {
    const inputBuffer = fs.readFileSync(filePath);
    let pipeline = sharp(inputBuffer);
    const metadata = await pipeline.metadata();

    // Resize if width > 1200
    if (metadata.width && metadata.width > 1200) {
      pipeline = pipeline.resize({ width: 1200, withoutEnlargement: true });
    }

    let outputBuffer;
    if (ext === '.png') {
      // Compress PNG
      outputBuffer = await pipeline
        .png({ quality: 80, compressionLevel: 9, effort: 7 })
        .toBuffer();
    } else {
      // Compress JPG
      outputBuffer = await pipeline
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer();
    }

    // Only overwrite if optimized is smaller
    if (outputBuffer.length < originalSize) {
      fs.writeFileSync(filePath, outputBuffer);
      const savedPercent = (((originalSize - outputBuffer.length) / originalSize) * 100).toFixed(1);
      console.log(`✓ ${path.basename(filePath)}: ${formatBytes(originalSize)} → ${formatBytes(outputBuffer.length)} (-${savedPercent}%)`);
    } else {
      console.log(`- ${path.basename(filePath)}: Đã tối ưu sẵn (${formatBytes(originalSize)})`);
    }
  } catch (err) {
    console.error(`✗ Lỗi tối ưu ${path.basename(filePath)}:`, err.message);
  }
}

async function run() {
  console.log('🚀 Bắt đầu tối ưu hóa hình ảnh FandomVerse (Cách 1)...\n');

  // Check hero-poster.png in public
  const heroPoster = path.join(PUBLIC_DIR, 'hero-poster.png');
  if (fs.existsSync(heroPoster)) {
    console.log('📦 Tối ưu hóa poster banner lớn:');
    await optimizeImage(heroPoster);
    console.log('');
  }

  // Check all images in public/image
  const initialBytes = await getStats(IMAGE_DIR);
  console.log(`📦 Thư mục public/image tổng dung lượng ban đầu: ${formatBytes(initialBytes)}`);

  const files = fs.readdirSync(IMAGE_DIR);
  for (const file of files) {
    const fullPath = path.join(IMAGE_DIR, file);
    if (fs.statSync(fullPath).isFile()) {
      await optimizeImage(fullPath);
    }
  }

  const finalBytes = await getStats(IMAGE_DIR);
  const totalSaved = initialBytes - finalBytes;
  const pct = ((totalSaved / initialBytes) * 100).toFixed(1);

  console.log('\n======================================================');
  console.log(`🎉 HOÀN THÀNH TỐI ƯU HÓA!`);
  console.log(`Dung lượng ban đầu : ${formatBytes(initialBytes)}`);
  console.log(`Dung lượng sau nén : ${formatBytes(finalBytes)}`);
  console.log(`Tiết kiệm được     : ${formatBytes(totalSaved)} (Giảm ${pct}%)`);
  console.log('======================================================');
}

run();
