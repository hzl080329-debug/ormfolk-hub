const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const genId = () => crypto.randomBytes(12).toString('hex');

const remote = new PrismaClient();

function secToDur(s) {
  const m = Math.floor(parseInt(s)/60);
  const sec = parseInt(s) % 60;
  return m + ':' + String(sec).padStart(2,'0');
}

async function main() {
  console.log('Connecting to production database...');

  // ===== APPLE S2 (your APPLE) =====
  const s2Episodes = [
    ['TwvTk7EB5lA',1,'(your) APPLE EP.1 Eng Sub',601],['r_8P7uiEge8',2,'(your) APPLE EP.2 Eng Sub',649],
    ['aQ0IMXLw7E4',3,'(your) APPLE EP.3 Eng Sub',680],['e42vC-U0M9s',4,'(your) APPLE EP.4 Eng Sub',609],
    ['YOsoUItRDzs',5,'(your) APPLE EP.5 Eng Sub',626],['TgmnZMY_HNQ',6,'(your) APPLE EP.6 Eng Sub',609],
    ['p06riLRqYlU',7,'(your) APPLE EP.7 Eng Sub',714],['mmxyRxofApg',8,'(your) APPLE EP.8 Eng Sub',602],
    ['UD5LABRzFC4',9,'(your) APPLE EP.9 Eng Sub',622],['5-64dD89oa4',10,'(your) APPLE EP.10 Eng Sub',600],
    ['35vYdybJSZc',11,'(your) APPLE EP.11 Eng Sub',627],['tJLoeRbaiJo',12,'(your) APPLE EP.12 Eng Sub',648],
    ['DOM_0PEn6dg',13,'(your) APPLE EP.13 Eng Sub',622],['tFn3TkI1VLU',14,'(your) APPLE EP.14 Eng Sub',607],
    ['GDOPiOqG_pE',15,'(your) APPLE EP.15 Eng Sub',608],['8z3uqHYj2jI',16,'(your) APPLE EP.16 Eng Sub',617],
    ['HqQQNcVFTkk',17,'(your) APPLE EP.17 Eng Sub',610],['mcPwCyZ5yok',18,'(your) APPLE EP.18 Eng Sub',636],
    ['QiSlUGVthCQ',19,'(your) APPLE EP.19 Eng Sub',604],['eNnGYutchKs',20,'(your) APPLE EP.20 Eng Sub',604],
    ['vLdmdq-4Kpk',21,'(your) APPLE EP.21 Eng Sub',601],['50JH3In7t5s',22,'(your) APPLE EP.22 Eng Sub',602],
    ['FE6tx0JE6Uc',23,'(your) APPLE EP.23 Eng Sub',703],['-Mz9q6eDczI',24,'(your) APPLE EP.24 Eng Sub',624],
    ['c7l9die1dzE',25,'(your) APPLE EP.25 Eng Sub',603],['rxf8LDNB5ug',26,'(your) APPLE EP.26 Eng Sub',733],
    ['hpQYmkQHL9g',27,'(your) APPLE EP.27 Eng Sub',748],['sMCJJUTVB6A',28,'(your) APPLE EP.28 Eng Sub',680],
    ['oc9FgCvnSfk',29,'(your) APPLE EP.29 Eng Sub',609],['lqGHIYqbv0s',30,'(your) APPLE EP.30 Eng Sub',607],
    ['wa1ygCa-TP4',31,'(your) APPLE EP.31 Eng Sub',602],['tn0ZqxkSDWU',32,'(your) APPLE EP.32 Eng Sub',792],
    ['D68c5Mj4iWQ',33,'(your) APPLE EP.33 Final Eng Sub',707],
  ];

  // Delete existing Apple S2 drama and recreate
  const existingS2 = await remote.drama.findFirst({ where: { title: 'Apple Season 2' } });
  if (existingS2) { await remote.dramaEpisode.deleteMany({ where: { dramaId: existingS2.id } }); await remote.drama.delete({ where: { id: existingS2.id } }); }

  const s2 = await remote.drama.create({
    data: {
      title: 'Apple Season 2', titleZh: '致親愛的你 第二季', titleTh: '(your) APPLE เธอ...ที่รักของฉัน ซีซั่น 2',
      description: 'Season 2 of Apple My Love. Kris and Karn navigate their relationship.', descriptionZh: '《致親愛的你》第二季。', descriptionTh: 'ซีซั่น 2 ของ Apple My Love',
      coverImage: 'https://img.youtube.com/vi/EBuqRIbLEF4/maxresdefault.jpg', sortOrder: 2,
    }
  });
  for (const [vid,num,title,dur] of s2Episodes) {
    const zh = num===33?'第'+num+'集（最終回）':'第'+num+'集';
    await remote.dramaEpisode.create({ data: { dramaId: s2.id, episodeNum: num, title: 'EP. '+num, titleZh: zh, titleTh: 'ตอนที่ '+num, videoUrl: 'https://youtu.be/'+vid, duration: secToDur(dur), language: 'en,ko,ja,th' } });
  }
  console.log('Apple S2: 33 episodes');

  // ===== APPLE S1 (APPLE ถึงเธอ...ที่รัก) =====
  const s1Groups = [
    { num:0, title:'EP. 0', zh:'第0集 - 紀錄片', th:'ตอนที่ 0', urls: ['p5-m1cz5ZMA','ReVyjShqPCU','4e0f6nLlRHw','NlAidnL19bY'] },
    { num:1, title:'EP. 1', zh:'第1集', th:'ตอนที่ 1', urls: ['26CSt6-Rs9I','QqijaGQlxFE','2Hl1v5aacKw','mYRYd50ZMZQ'] },
    { num:2, title:'EP. 2', zh:'第2集', th:'ตอนที่ 2', urls: ['_cE4Pj42HAY','Ccx4wNfSJ6I','1Whn352J5nM','5I8c-bmgw1Q'] },
    { num:3, title:'EP. 3', zh:'第3集', th:'ตอนที่ 3', urls: ['bSexhnV9XAE','nB_-IohgVbk','M2WtlyQIaGA','2BMuwEQ7mxs'] },
    { num:4, title:'EP. 4', zh:'第4集', th:'ตอนที่ 4', urls: ['XuxT0a3abMQ','gIR-wEwAB40','dy8QKK9ShBo','DYRQDlEil1o'] },
    { num:5, title:'EP. 5', zh:'第5集', th:'ตอนที่ 5', urls: ['EUR5cYRSs6o','gWdmFlMQo7c','alyRVHfjEgc','y9I0v7GUquM'] },
    { num:6, title:'EP. 5.1', zh:'第5.1集', th:'ตอนที่ 5.1', urls: ['ByigJDW_PPA','UtlTYl2E1GU','7ir9qsoaXcE','s95IZyWinIs'] },
    { num:7, title:'EP. 6 Final', zh:'第6集（最終回）', th:'ตอนที่ 6 (ตอนจบ)', urls: ['33gHPNTpVlc','VhZhWDsIAqc','sAH7eQcQD4c','4uhgWPcbLpE','TtMolYAgtu4'] },
  ];

  const existingS1 = await remote.drama.findFirst({ where: { title: 'Apple My Love Season 1' } });
  if (existingS1) { await remote.dramaEpisode.deleteMany({ where: { dramaId: existingS1.id } }); await remote.drama.delete({ where: { id: existingS1.id } }); }

  const s1 = await remote.drama.create({
    data: {
      title: 'Apple My Love Season 1', titleZh: '致親愛的你 第一季', titleTh: 'APPLE ถึงเธอ...ที่รัก ซีซั่น 1',
      description: 'The story of Kris and Karn.', descriptionZh: 'Kris和Karn的故事。', descriptionTh: 'เรื่องราวของคริสและกาล',
      coverImage: 'https://img.youtube.com/vi/Xg2DxxEfZ80/maxresdefault.jpg', sortOrder: 1,
    }
  });
  for (const g of s1Groups) {
    await remote.dramaEpisode.create({ data: { dramaId: s1.id, episodeNum: g.num, title: g.title, titleZh: g.zh, titleTh: g.th, videoUrl: g.urls.map(v=>'https://youtu.be/'+v).join('\n'), language: 'en,ko,ja,th' } });
  }
  // Extras
  await remote.dramaEpisode.create({ data: { dramaId: s1.id, episodeNum: 8, title: 'Official Trailer', titleZh: '正式預告', titleTh: 'Official Trailer', videoUrl: 'https://youtu.be/Xg2DxxEfZ80', duration: '4:25', language: 'en,ko,ja,th' } });
  await remote.dramaEpisode.create({ data: { dramaId: s1.id, episodeNum: 9, title: 'Mini Trailer', titleZh: '迷你預告', titleTh: 'Mini Trailer', videoUrl: 'https://youtu.be/EBuqRIbLEF4', duration: '2:35', language: 'en,ko,ja,th' } });
  await remote.dramaEpisode.create({ data: { dramaId: s1.id, episodeNum: 10, title: 'OST', titleZh: 'OST - 可以讓我成為你的摯愛嗎', titleTh: 'OST - ให้ฉันเป็นที่รักได้มั๊ย', videoUrl: 'https://youtu.be/IsKtf2DoCBU', duration: '3:37', language: 'en,ko,ja,th' } });
  console.log('Apple S1: 11 entries');

  // ===== My Lady's Bodyguard =====
  const existingBg = await remote.drama.findFirst({ where: { title: { contains: 'Bodyguard' } } });
  if (existingBg) { await remote.dramaEpisode.deleteMany({ where: { dramaId: existingBg.id } }); await remote.drama.delete({ where: { id: existingBg.id } }); }

  const bg = await remote.drama.create({
    data: {
      title: "My Lady's Bodyguard", titleZh: '我的保鑣女士', titleTh: 'องครักษ์พิทักษ์แม่หญิงจอมซน',
      description: 'Official teaser.', descriptionZh: '官方預告。', descriptionTh: 'ตัวอย่างอย่างเป็นทางการ',
      coverImage: 'https://img.youtube.com/vi/tq-GGjCLdHU/maxresdefault.jpg', sortOrder: 3,
    }
  });
  await remote.dramaEpisode.create({ data: { dramaId: bg.id, episodeNum: 1, title: 'Official Teaser', titleZh: '官方預告', titleTh: 'ตัวอย่างอย่างเป็นทางการ', videoUrl: 'https://youtu.be/tq-GGjCLdHU', duration: '3:17', language: 'en,ko,ja,th' } });
  console.log("My Lady's Bodyguard: 1 teaser");

  console.log('\nALL DONE! https://ormfolk-hub.vercel.app/dramas');
  await remote.$disconnect();
}
main().catch(e => { console.error(e.message); process.exit(1); });
