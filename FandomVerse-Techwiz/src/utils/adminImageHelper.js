// Utility to guarantee all admin items (Events, Articles, Characters, Merch, Trailers)
// display crisp, valid, beautiful visuals without broken image icons.

export const CATEGORY_IMAGE_POOLS = {
  anime: [
    '/image/onepice_thamnail.jpg',
    '/image/ghibili.jpg',
    '/image/beseark.jpg',
    '/image/attack.jpg',
    '/image/naruto.jpg',
    '/image/kimesu.jpg',
    '/image/jujutsu.jpg',
    '/image/firren.jpg',
    '/image/slamdunk.jpg',
    '/image/tanjiro.jpg',
    '/image/zoro.jpg',
  ],
  gaming: [
    '/image/eldenring.jpg',
    '/image/wukong.jpg',
    '/image/gta.jpg',
    '/image/monterhunter.jpg',
    '/image/t1.jpg',
    '/image/taycam.jpg',
    '/image/ban_phim.jpg',
    '/image/xbox.jpg',
    '/image/cyper.jpg',
  ],
  movies: [
    '/image/avenger.jpg',
    '/image/batman.jpg',
    '/image/iron.jpg',
    '/image/deadpool.jpg',
    '/image/thanos.jpg',
    '/image/xmen.jpg',
    '/image/harry.jpg',
    '/image/superman_2.jpg',
    '/image/avatar_3.jpg',
  ],
  tvshows: [
    '/image/wed.jpg',
    '/image/house.jpg',
    '/image/strang.jpg',
    '/image/season.jpg',
  ],
  kpop: [
    '/image/bts.jpg',
    '/image/newjean.jpg',
    '/image/kpop.jpg',
    '/image/lightstick.jpg',
    '/image/sticklight.jpg',
    '/image/m3p.jpg',
  ],
  comics: [
    '/image/bat_man.jpg',
    '/image/blackspider.jpg',
    '/image/spider_1.jpg',
    '/image/batmandark.jpg',
    '/image/joker.jpg',
    '/image/superman_2.jpg',
  ],
  manga: [
    '/image/beseark_1.jpg',
    '/image/chansawman.jpg',
    '/image/onepice_1.jpg',
    '/image/onepice_2.jpg',
    '/image/yagami.jpg',
    '/image/solo.jpg',
  ],
};

const KEYWORD_MAP = [
  { match: ['one piece', 'luffy', 'straw hat', 'nika'], src: '/image/onepice_thamnail.jpg' },
  { match: ['elden ring', 'fromsoftware', 'tarnished'], src: '/image/eldenring.jpg' },
  { match: ['wukong', 'black myth'], src: '/image/wukong.jpg' },
  { match: ['demon slayer', 'kimetsu', 'tanjiro', 'nezuko'], src: '/image/kimesu.jpg' },
  { match: ['jujutsu', 'gojo', 'sukuna', 'itadori'], src: '/image/jujutsu.jpg' },
  { match: ['chainsaw', 'denji', 'reze', 'makima'], src: '/image/chansawman.jpg' },
  { match: ['naruto', 'sasuke', 'konoha', 'ninja'], src: '/image/naruto.jpg' },
  { match: ['attack on titan', 'aot', 'shingeki', 'eren', 'levi'], src: '/image/attack.jpg' },
  { match: ['ghibli', 'totoro', 'spirited away', 'miyazaki'], src: '/image/ghibili.jpg' },
  { match: ['berserk', 'guts', 'griffith'], src: '/image/beseark.jpg' },
  { match: ['gta', 'grand theft auto', 'rockstar'], src: '/image/gta.jpg' },
  { match: ['t1', 'faker', 'league of legends', 'lolesports'], src: '/image/t1.jpg' },
  { match: ['monster hunter', 'capcom'], src: '/image/monterhunter.jpg' },
  { match: ['batman', 'gotham', 'joker', 'dark knight'], src: '/image/batman.jpg' },
  { match: ['avenger', 'marvel', 'iron man', 'thanos', 'mcu'], src: '/image/avenger.jpg' },
  { match: ['spider-man', 'spiderman', 'peter parker', 'miles morales'], src: '/image/spider_1.jpg' },
  { match: ['bts', 'bangtan', 'army'], src: '/image/bts.jpg' },
  { match: ['newjeans', 'new jeans', 'bunnies', 'k-pop', 'kpop'], src: '/image/newjean.jpg' },
  { match: ['harry potter', 'hogwarts'], src: '/image/harry.jpg' },
  { match: ['deadpool', 'wolverine'], src: '/image/deadpool.jpg' },
  { match: ['game show', 'tgs', 'e3', 'gamescom', 'tga', 'game awards'], src: '/image/gta.jpg' },
  { match: ['anime japan', 'anime expo', 'comiket', 'fes', 'cosplay'], src: '/image/ghibili.jpg' },
  { match: ['comic con', 'san diego'], src: '/image/bat_man.jpg' },
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Resolves any item's image URL or provides a matching local image.
 */
export function resolveAdminImage(item, defaultCategory = 'anime') {
  if (!item) return '/image/onepice_thamnail.jpg';

  // 1. Direct property check
  const rawUrl = item.imageUrl || item.image || item.thumbnail || item.avatarUrl || item.img;
  if (typeof rawUrl === 'string' && rawUrl.trim() !== '') {
    const trimmed = rawUrl.trim();
    if (trimmed.startsWith('image/')) {
      return `/${trimmed}`;
    }
    return trimmed;
  }

  // 2. Keyword match against title, name, franchise, id
  const titleText = (
    (typeof item.title === 'object' ? item.title?.vi || item.title?.en : item.title) ||
    (typeof item.name === 'object' ? item.name?.vi || item.name?.en : item.name) ||
    item.franchise ||
    item.id ||
    ''
  ).toLowerCase();

  for (const entry of KEYWORD_MAP) {
    if (entry.match.some((kw) => titleText.includes(kw))) {
      return entry.src;
    }
  }

  // 3. Fallback to category pool deterministically
  const cat = (item.category || defaultCategory || 'anime').toLowerCase();
  const pool = CATEGORY_IMAGE_POOLS[cat] || CATEGORY_IMAGE_POOLS.anime;
  const hash = hashString(item.id || titleText || 'fandom');
  return pool[hash % pool.length];
}

/**
 * Safe image onError handler to avoid broken images.
 */
export function handleImageFallback(e, category = 'anime') {
  const target = e.currentTarget;
  if (target.dataset.fallbackTried === 'true') {
    target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80';
    return;
  }
  target.dataset.fallbackTried = 'true';
  const pool = CATEGORY_IMAGE_POOLS[category] || CATEGORY_IMAGE_POOLS.anime;
  target.src = pool[0];
}
