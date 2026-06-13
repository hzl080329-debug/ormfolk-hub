const Database = require('better-sqlite3');
const crypto = require('crypto');
const fs = require('fs');
const genId = () => crypto.randomBytes(12).toString('hex');

const db = new Database('./dev.db');
const uploadDir = './public/uploads/gallery';

// Create GalleryItem table if not exists (SQLite)
db.exec(`CREATE TABLE IF NOT EXISTS GalleryItem (
  id TEXT PRIMARY KEY, url TEXT, caption TEXT, tag TEXT DEFAULT 'both',
  category TEXT DEFAULT 'photo', videoUrl TEXT, featured INTEGER DEFAULT 0,
  reviewStatus TEXT DEFAULT 'approved', userId TEXT, createdAt TEXT
)`);

const files = fs.readdirSync(uploadDir);

// Tag from filename (we'll use 'both' as default)
const now = new Date().toISOString();
let count = 0;

const insert = db.prepare(`INSERT OR IGNORE INTO GalleryItem
  (id, url, caption, tag, category, featured, reviewStatus, userId, createdAt)
  VALUES (?, ?, ?, ?, ?, 0, 'approved', 'system', ?)`);

for (const file of files) {
  const ext = file.split('.').pop().toLowerCase();
  const isVideo = ['mp4', 'mov'].includes(ext);
  const id = genId();
  const url = '/uploads/gallery/' + file;

  // Simple caption from filename
  const caption = '';

  insert.run(id, url, caption, 'both', isVideo ? 'photo' : 'photo', now);
  count++;
}

console.log('Inserted ' + count + ' gallery items into dev.db');
db.close();
