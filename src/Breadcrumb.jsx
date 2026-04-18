import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';

export default function Breadcrumb({ currentPage }) {
  const baseUrl = 'https://telugumoviesott.onrender.com';

  const getBreadcrumbItems = (page) => {
    const items = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl,
      },
    ];
    if (page === 'about') {
      items.push({ "@type": "ListItem", "position": 2, "name": "About", "item": `${baseUrl}/about` });
    } else if (page === 'privacy') {
      items.push({ "@type": "ListItem", "position": 2, "name": "Privacy Policy", "item": `${baseUrl}/privacy` });
    }
    return items;
  };

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": getBreadcrumbItems(currentPage),
  };

  const paths = {
    home: [{ label: 'Home', to: '/' }],
    about: [
      { label: 'Home', to: '/' },
      { label: 'About', to: '/about' },
    ],
    privacy: [
      { label: 'Home', to: '/' },
      { label: 'Privacy Policy', to: '/privacy' },
    ],
  }[currentPage] || [{ label: 'Home', to: '/' }];

  if (paths.length === 1) {
    // Still emit breadcrumb schema on home, but no visible trail.
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
        <ol className="flex items-center space-x-2 text-sm opacity-70">
          {paths.map((path, index) => (
            <li key={path.to} className="flex items-center">
              {index > 0 && (
                <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {index === paths.length - 1 ? (
                <span className="font-medium" aria-current="page">{path.label}</span>
              ) : (
                <Link to={path.to} className="hover:underline hover:opacity-100 transition-opacity">
                  {path.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
