import { useEffect } from 'react';

export default function Breadcrumb({ currentPage, onNavigate }) {
  // Add breadcrumb structured data
  useEffect(() => {
    const breadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": getBreadcrumbItems(currentPage)
    };

    // Remove existing breadcrumb schema
    const existingSchema = document.getElementById('breadcrumb-schema');
    if (existingSchema) {
      existingSchema.remove();
    }

    // Add new schema
    const script = document.createElement('script');
    script.id = 'breadcrumb-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(breadcrumbList);
    document.head.appendChild(script);

    return () => {
      const schemaEl = document.getElementById('breadcrumb-schema');
      if (schemaEl) schemaEl.remove();
    };
  }, [currentPage]);

  const getBreadcrumbItems = (page) => {
    const baseUrl = 'https://telugumoviesott.onrender.com';
    const items = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      }
    ];

    if (page === 'about') {
      items.push({
        "@type": "ListItem",
        "position": 2,
        "name": "About",
        "item": `${baseUrl}/about`
      });
    } else if (page === 'privacy') {
      items.push({
        "@type": "ListItem",
        "position": 2,
        "name": "Privacy Policy",
        "item": `${baseUrl}/privacy`
      });
    }

    return items;
  };

  const breadcrumbPaths = {
    'home': [{ label: 'Home', page: 'home' }],
    'about': [
      { label: 'Home', page: 'home' },
      { label: 'About', page: 'about' }
    ],
    'privacy': [
      { label: 'Home', page: 'home' },
      { label: 'Privacy Policy', page: 'privacy' }
    ]
  };

  const paths = breadcrumbPaths[currentPage] || breadcrumbPaths['home'];

  if (paths.length === 1) {
    return null; // Don't show breadcrumb on home page
  }

  return (
    <nav aria-label="Breadcrumb" className="z-10 w-full max-w-6xl mx-auto px-4 py-2">
      <ol className="flex items-center space-x-2 text-sm opacity-70">
        {paths.map((path, index) => (
          <li key={path.page} className="flex items-center">
            {index > 0 && (
              <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {index === paths.length - 1 ? (
              <span className="font-medium" aria-current="page">{path.label}</span>
            ) : (
              <button
                onClick={() => onNavigate(path.page)}
                className="hover:underline hover:opacity-100 transition-opacity"
              >
                {path.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
