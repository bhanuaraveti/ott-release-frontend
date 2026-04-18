import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { getAllPosts } from '../content/blog';

const SITE = 'https://telugumoviesott.onrender.com';

export default function BlogIndex() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    // Give @dr.pogodin/react-helmet a tick to flush title/meta into the DOM
    // before the prerenderer snapshots HTML. A plain setTimeout(0) fires
    // before Helmet's rAF, leaving stale <title> from index.html.
    const t = setTimeout(() => {
      requestAnimationFrame(() => {
        document.dispatchEvent(new Event('prerender-ready'));
      });
    }, 50);
    return () => clearTimeout(t);
  }, []);

  const posts = getAllPosts();
  const canonical = `${SITE}/blog`;
  const title = 'Telugu OTT Blog | TeluguMoviesOTT';
  const description =
    'Editorial context on Telugu OTT platforms, release patterns, and streaming-industry trends — alongside our daily release index.';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'TeluguMoviesOTT Blog',
    url: canonical,
    description,
    blogPost: posts.slice(0, 10).map((p) => ({
      '@type': 'BlogPosting',
      headline: p.frontmatter.title,
      url: `${SITE}/blog/${p.frontmatter.slug}`,
      datePublished: p.frontmatter.date,
      description: p.frontmatter.description,
    })),
  };

  return (
    <>
      <Seo title={title} description={description} canonical={canonical} jsonLd={jsonLd} />
      <article className="z-10 w-full max-w-4xl mx-auto px-4 py-10">
        <header className="mb-10">
          <div className="inline-block mb-3 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-100 text-sm font-semibold">
            Editorial blog
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Notes on Telugu OTT
          </h1>
          <p className="text-lg opacity-80">
            Context on platforms, release patterns, and streaming trends — alongside our daily release index.
          </p>
        </header>

        <ul className="space-y-6">
          {posts.map((post) => {
            const { slug, title: postTitle, description: postDesc, date, readingTime } = post.frontmatter;
            return (
              <li
                key={slug}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <Link to={`/blog/${slug}`} className="block">
                  <h2 className="text-xl md:text-2xl font-bold mb-2">{postTitle}</h2>
                  <div className="text-xs opacity-60 mb-3">
                    {new Date(date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                    {readingTime ? ` · ${readingTime} read` : ''}
                  </div>
                  <p className="opacity-80">{postDesc}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </article>
    </>
  );
}
