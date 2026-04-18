import aha from './aha.json';
import primeVideo from './prime-video.json';
import netflix from './netflix.json';
import hotstar from './hotstar.json';
import zee5 from './zee5.json';
import sonyliv from './sonyliv.json';
import appleTv from './apple-tv.json';

const platforms = [aha, primeVideo, netflix, hotstar, zee5, sonyliv, appleTv];

const bySlug = new Map(platforms.map((p) => [p.slug, p]));

export function getAllPlatforms() {
  return platforms;
}

export function getPlatformBySlug(slug) {
  if (!slug) return null;
  return bySlug.get(slug) || null;
}

export function matchPlatformRecord(platformName) {
  if (!platformName) return null;
  const needle = platformName.toLowerCase().trim();
  for (const p of platforms) {
    if (p.matchNames.some((n) => n.toLowerCase() === needle)) return p;
  }
  return null;
}
