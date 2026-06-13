const Database = require('better-sqlite3');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const genId = () => crypto.randomBytes(12).toString('hex');

const db = new Database('./dev.db');
const baseDir = '/Users/mandyhuang/Desktop/Ormfolk';
const uploadDir = './public/uploads/gallery';

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Category mapping from folder name
const catMap = {
  'Folk IG': 'photo', 'Folk IG快拍': 'photo', 'Folk IG相关': 'photo',
  'Folk Tiktok': 'photo', 'Folk X': 'photo',
  'Ormsin IG': 'photo', 'Ormsin IG快拍': 'photo', 'Ormsin IG相关': 'photo',
  'Ormsin X': 'photo', 'Ormsin Tiktok': 'photo',
  'OrmFolk IG相关': 'photo', 'OrmFolk 活动': 'event_photo',
  'OrmFolk Tiktok直播': 'photo', 'OrmFolk直播': 'photo',
  'KTP Tiktok': 'photo', 'KTP油管': 'photo', '油管vlog': 'photo',
  'Baby Folk': 'photo', 'Be Mine': 'drama_still',
  'My Lady\'s Bodyguard': 'drama_still', '多面热恋': 'drama_still',
  'Apple第二季中字': 'drama_still',
  'kimbap': 'kimbap', 'avatar': 'photo',
  '生日会': 'event_photo', '见面会': 'event_photo',
};

function tagFromFolder(folder) {
  if (folder.includes('Folk')) return 'folk';
  if (folder.includes('Ormsin')) return 'orm';
  return 'both';
}

function getFolders(base) {
  const result = [];
  const dirs = fs.readdirSync(base);
  for (const d of dirs) {
    const full = path.join(base, d);
    if (fs.statSync(full).isDirectory() && d !== 'Apple第二季中字') result.push(d);
  }
  return result;
}

let total = 0;
const folders = getFolders(baseDir);

for (const folder of folders) {
  const folderPath = path.join(baseDir, folder);
  const files = fs.readdirSync(folderPath).filter(f => !f.startsWith('.') && !f.endsWith('.pages'));

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg','.jpeg','.png','.gif','.webp','.mp4','.mov'].includes(ext)) continue;

    const srcPath = path.join(folderPath, file);
    const newName = genId() + ext;
    const dstPath = path.join(uploadDir, newName);

    try {
      fs.copyFileSync(srcPath, dstPath);
    } catch(e) { continue; }

    const url = '/uploads/gallery/' + newName;
    const cat = catMap[folder] || 'photo';
    const tag = tagFromFolder(folder);

    // Insert into SQLite (local) - for now just track what we copied
    total++;
    if (total % 50 === 0) console.log('Copied ' + total + ' files...');
  }
}

console.log('\nDone! Copied ' + total + ' files to ' + uploadDir);
console.log('Total size: ' + (fs.readdirSync(uploadDir).length) + ' files');
db.close();
