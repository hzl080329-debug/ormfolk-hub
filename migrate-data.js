const Database = require('better-sqlite3');
const { PrismaClient } = require('@prisma/client');

const db = new Database('./dev.db');
const remote = new PrismaClient();

// List all actual tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables found:', tables.map(t => t.name).join(', '));

function readAll(table) {
  try { return db.prepare('SELECT * FROM ' + table).all(); }
  catch(e) { console.log('  skip ' + table + ': ' + e.message); return []; }
}

async function main() {
  console.log('\nStarting migration...');

  // Timeline entries
  const tl = readAll('TimelineEntry');
  for (const t of tl) {
    await remote.timelineEntry.upsert({
      where: { id: t.id },
      update: { year: t.year, month: t.month||0, day: t.day||1, titleEn: t.titleEn, titleZh: t.titleZh, titleTh: t.titleTh, descriptionEn: t.descriptionEn, descriptionZh: t.descriptionZh, descriptionTh: t.descriptionTh, type: t.type, actor: t.actor, imageUrl: t.imageUrl||'' },
      create: { id: t.id, year: t.year, month: t.month||0, day: t.day||1, titleEn: t.titleEn, titleZh: t.titleZh, titleTh: t.titleTh, descriptionEn: t.descriptionEn, descriptionZh: t.descriptionZh, descriptionTh: t.descriptionTh, type: t.type, actor: t.actor, imageUrl: t.imageUrl||'' },
    }).catch(() => {});
  }
  console.log('Timeline: ' + tl.length);

  // Events
  const evts = readAll('Event');
  for (const e of evts) {
    await remote.event.upsert({
      where: { id: e.id },
      update: { titleEn: e.titleEn, titleZh: e.titleZh, titleTh: e.titleTh, descriptionEn: e.descriptionEn, descriptionZh: e.descriptionZh, descriptionTh: e.descriptionTh, date: e.date, location: e.location, type: e.type, imageUrl: e.imageUrl||'' },
      create: { id: e.id, titleEn: e.titleEn, titleZh: e.titleZh, titleTh: e.titleTh, descriptionEn: e.descriptionEn, descriptionZh: e.descriptionZh, descriptionTh: e.descriptionTh, date: e.date, location: e.location, type: e.type, imageUrl: e.imageUrl||'' },
    }).catch(() => {});
  }
  console.log('Events: ' + evts.length);

  // Forum Categories
  const cats = readAll('ForumCategory');
  for (const c of cats) {
    await remote.forumCategory.upsert({
      where: { id: c.id },
      update: { slug: c.slug, nameEn: c.nameEn, nameZh: c.nameZh, nameTh: c.nameTh, descriptionEn: c.descriptionEn||'', descriptionZh: c.descriptionZh||'', descriptionTh: c.descriptionTh||'', sortOrder: c.sortOrder||0 },
      create: { id: c.id, slug: c.slug, nameEn: c.nameEn, nameZh: c.nameZh, nameTh: c.nameTh, descriptionEn: c.descriptionEn||'', descriptionZh: c.descriptionZh||'', descriptionTh: c.descriptionTh||'', sortOrder: c.sortOrder||0 },
    }).catch(() => {});
  }
  console.log('Forum Categories: ' + cats.length);

  // Users
  const users = readAll('User');
  for (const u of users) {
    await remote.user.upsert({
      where: { id: u.id },
      update: { email: u.email, username: u.username, name: u.name, password: u.password, role: u.role||'user', image: u.image, bio: u.bio, city: u.city, country: u.country, language: u.language||'en' },
      create: { id: u.id, email: u.email, username: u.username, name: u.name, password: u.password, role: u.role||'user', image: u.image, bio: u.bio, city: u.city, country: u.country, language: u.language||'en' },
    }).catch(() => {});
  }
  console.log('Users: ' + users.length);

  // Check for WallMessage, CommunityStat etc
  for (const tbl of tables.map(t => t.name)) {
    if (['_prisma_migrations','User','Account','Session','VerificationToken','Authenticator','TimelineEntry','ForumCategory','Post','Comment','Creation','Like','Event','WallMessage','FanLocation','Submission'].includes(tbl)) continue;
    const rows = readAll(tbl);
    console.log('Extra table ' + tbl + ': ' + rows.length + ' rows');
  }

  // Ensure superadmin
  await remote.user.updateMany({ where: { email: "hzl080329@gmail.com" }, data: { role: "superadmin" } }).catch(() => {});
  console.log('\nDone! Refresh your site: https://ormfolk-hub.vercel.app');

  db.close();
  await remote.$disconnect();
}
main().catch(e => { console.error('FATAL:', e.message); });
