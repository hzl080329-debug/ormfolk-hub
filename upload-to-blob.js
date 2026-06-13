// Upload all gallery images to Vercel Blob, then update DB
const { put } = require('@vercel/blob');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const prisma = new PrismaClient();
const galleryDir = './public/uploads/gallery';
const genId = () => crypto.randomBytes(12).toString('hex');

async function main() {
  const files = fs.readdirSync(galleryDir);
  console.log('Uploading ' + files.length + ' files to Vercel Blob...');

  let uploaded = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(galleryDir, file);
    try {
      const blob = await put(file, fs.readFileSync(filePath), {
        access: 'public',
        contentType: file.endsWith('.mp4') ? 'video/mp4' : file.endsWith('.png') ? 'image/png' : 'image/jpeg',
      });

      // Insert into GalleryItem
      await prisma.galleryItem.create({
        data: {
          id: genId(),
          url: blob.url,
          caption: '',
          tag: 'both',
          category: 'photo',
          featured: false,
          reviewStatus: 'approved',
          userId: 'system',
        }
      }).catch(() => {});

      uploaded++;
      if (uploaded % 50 === 0) console.log('  ' + uploaded + '/' + files.length);
    } catch(e) {
      console.log('  skip ' + file + ': ' + e.message);
    }
  }

  console.log('\nDone! Uploaded ' + uploaded + ' files to Vercel Blob');
  await prisma.$disconnect();
}
main().catch(e => { console.error(e.message); process.exit(1); });
