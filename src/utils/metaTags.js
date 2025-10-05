/**
 * Utility functions for dynamically updating meta tags for SEO
 */

export const updateMetaTags = ({ title, description, url, page = 'home' }) => {
  // Update document title
  document.title = title;

  // Update meta description
  updateMetaTag('name', 'description', description);
  updateMetaTag('name', 'title', title);

  // Update Open Graph tags
  updateMetaTag('property', 'og:title', title);
  updateMetaTag('property', 'og:description', description);
  updateMetaTag('property', 'og:url', url);

  // Update Twitter Card tags
  updateMetaTag('property', 'twitter:title', title);
  updateMetaTag('property', 'twitter:description', description);
  updateMetaTag('property', 'twitter:url', url);

  // Update canonical URL
  updateCanonicalLink(url);
};

const updateMetaTag = (attribute, key, content) => {
  let element = document.querySelector(`meta[${attribute}="${key}"]`);

  if (element) {
    element.setAttribute('content', content);
  } else {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    element.setAttribute('content', content);
    document.head.appendChild(element);
  }
};

const updateCanonicalLink = (url) => {
  let link = document.querySelector('link[rel="canonical"]');

  if (link) {
    link.setAttribute('href', url);
  } else {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    document.head.appendChild(link);
  }
};

export const getPageMetadata = (page, platform = null, searchTerm = null, movieCount = 0) => {
  const baseUrl = 'https://telugumoviesott.onrender.com';

  switch (page) {
    case 'home':
      if (platform && platform !== 'All') {
        return {
          title: `${platform} Telugu Movies - Latest OTT Releases 2025 | TeluguMoviesOTT`,
          description: `Find all Telugu movies available on ${platform}. Updated daily with latest releases and OTT dates. Browse ${movieCount}+ movies across all platforms.`,
          url: `${baseUrl}/?platform=${encodeURIComponent(platform)}`
        };
      }

      if (searchTerm) {
        return {
          title: `Search Results for "${searchTerm}" - Telugu Movies OTT | TeluguMoviesOTT`,
          description: `Search results for "${searchTerm}" in our database of ${movieCount}+ Telugu movies across Netflix, Prime Video, Hotstar, Aha, and more OTT platforms.`,
          url: `${baseUrl}/?search=${encodeURIComponent(searchTerm)}`
        };
      }

      return {
        title: 'Latest Telugu Movies OTT Release Dates 2025 | Netflix, Prime Video, Hotstar & More',
        description: `Find the latest Telugu movies OTT release dates across Netflix, Amazon Prime Video, Disney+ Hotstar, Aha, Zee5 and other platforms. Updated daily with ${movieCount}+ movies. Your complete guide to Telugu cinema streaming!`,
        url: baseUrl
      };

    case 'about':
      return {
        title: 'About TeluguMoviesOTT - Your Telugu Cinema OTT Guide',
        description: 'Learn about TeluguMoviesOTT, your trusted source for Telugu movie OTT release information. Discover our mission to help fans find their favorite films on streaming platforms.',
        url: `${baseUrl}/about`
      };

    case 'privacy':
      return {
        title: 'Privacy Policy - TeluguMoviesOTT',
        description: 'Read our privacy policy to understand how we collect, use, and protect your information on TeluguMoviesOTT.',
        url: `${baseUrl}/privacy`
      };

    default:
      return {
        title: 'Latest Telugu Movies OTT Release Dates 2025 | TeluguMoviesOTT',
        description: 'Find the latest Telugu movies OTT release dates across all major streaming platforms. Updated daily!',
        url: baseUrl
      };
  }
};
