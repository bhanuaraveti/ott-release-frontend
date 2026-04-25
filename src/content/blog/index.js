import bestTeluguFilmsAha from './best-telugu-films-aha.jsx';
import primeVideoTeluguLineup from './prime-video-telugu-lineup.jsx';
import netflixTeluguOriginals from './netflix-telugu-originals.jsx';
import ottReleaseCalendarApril2026 from './ott-release-calendar-april-2026.jsx';
import hotstarTeluguWatchlist from './hotstar-telugu-watchlist.jsx';
import zee5TeluguPicks from './zee5-telugu-picks.jsx';
import sonylivTeluguGuide from './sonyliv-telugu-guide.jsx';
import howWeTrackOttReleases from './how-we-track-ott-releases.jsx';
import teluguOttRoundupApril15252026 from './telugu-ott-roundup-april-15-25-2026.jsx';

const posts = [
  bestTeluguFilmsAha,
  primeVideoTeluguLineup,
  netflixTeluguOriginals,
  ottReleaseCalendarApril2026,
  hotstarTeluguWatchlist,
  zee5TeluguPicks,
  sonylivTeluguGuide,
  howWeTrackOttReleases,
  teluguOttRoundupApril15252026,
];

const bySlug = new Map(posts.map((p) => [p.frontmatter.slug, p]));

export function getAllPosts() {
  return posts
    .slice()
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
}

export function getPostBySlug(slug) {
  if (!slug) return null;
  return bySlug.get(slug) || null;
}
