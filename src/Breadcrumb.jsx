import { Link, useLocation, useParams } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { getPlatformBySlug } from './content/platforms';
import { getPostBySlug } from './content/blog';

const BASE_URL = 'https://telugumoviesott.onrender.com';

function prettifySlug(slug) {
  if (!slug) return '';
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function computeTrail(pathname, routeParams) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return [{ label: 'Home', to: '/' }];
  }

  const trail = [{ label: 'Home', to: '/' }];
  const [root, param] = segments;

  if (root === 'about') {
    trail.push({ label: 'About', to: '/about' });
  } else if (root === 'privacy') {
    trail.push({ label: 'Privacy Policy', to: '/privacy' });
  } else if (root === 'blog') {
    trail.push({ label: 'Blog', to: '/blog' });
    if (param) {
      const post = getPostBySlug(param);
      trail.push({
        label: post?.frontmatter?.title || prettifySlug(param),
        to: `/blog/${param}`,
      });
    }
  } else if (root === 'platform' && param) {
    const platform = getPlatformBySlug(param);
    trail.push({
      label: platform?.name || prettifySlug(param),
      to: `/platform/${param}`,
    });
  } else if (root === 'movie' && param) {
    trail.push({
      label: prettifySlug(param),
      to: `/movie/${param}`,
    });
  }

  return trail;
}

export default function Breadcrumb() {
  const location = useLocation();
  const params = useParams();
  const trail = computeTrail(location.pathname, params);

  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${BASE_URL}${item.to}`,
    })),
  };

  if (trail.length <= 1) {
    return (
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(breadcrumbList)}</script>
      </Helmet>
    );
  }

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(breadcrumbList)}</script>
      </Helmet>
      <nav aria-label="Breadcrumb" className="z-10 w-full max-w-6xl mx-auto px-4 py-2">
        <ol className="flex items-center flex-wrap gap-y-1 text-sm opacity-70">
          {trail.map((item, index) => (
            <li key={item.to} className="flex items-center">
              {index > 0 && (
                <svg
                  className="w-4 h-4 mx-2 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {index === trail.length - 1 ? (
                <span className="font-medium truncate max-w-[200px] md:max-w-none" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="hover:underline hover:opacity-100 transition-opacity">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
