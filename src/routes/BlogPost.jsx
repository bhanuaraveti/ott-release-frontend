import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import AdSlot from '../components/AdSlot';
import { getPostBySlug, getAllPosts } from '../content/blog';

const SITE = 'https://telugumoviesott.onrender.com';

function dispatchPrerenderReady() {
  if (typeof document === 'undefined') return;
  setTimeout(() => {
    requestAnimationFrame(() => {
      document.dispatchEvent(new Event('prerender-ready'));
    });
  }, 50);
}

function PostNotFound({ slug }) {
  useEffect(() => {
    dispatchPrerenderReady();
  }, []);
  return (
    <>
      <Seo
        title="Blog post not found | TeluguMoviesOTT"
        description="We could not find this blog post. Browse the blog index for available articles."
        canonical={`${SITE}/blog/${slug || ''}`}
      />
      <section className="z-10 w-full max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Post not found</h1>
        <p className="opacity-80 mb-6">
          We do not have a post with the slug{' '}
          <code className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700">{slug || '—'}</code>.
        </p>
        <Link
          to="/blog"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Back to the blog
        </Link>
      </section>
    </>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = slug ? getPostBySlug(slug) : null;

  useEffect(() => {
    dispatchPrerenderReady();
  }, [slug]);

  if (!post) return <PostNotFound slug={slug} />;

  const { frontmatter, Body } = post;
  const canonical = `${SITE}/blog/${frontmatter.slug}`;
  const title = `${frontmatter.title} | TeluguMoviesOTT`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: frontmatter.title,
    description: frontmatter.description,
    datePublished: frontmatter.date,
    url: canonical,
    author: {
      '@type': 'Organization',
      name: 'TeluguMoviesOTT',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TeluguMoviesOTT',
      url: SITE,
    },
  };

  const related = getAllPosts()
    .filter((p) => p.frontmatter.slug !== frontmatter.slug)
    .slice(0, 3);

  return (
    <>
      <Seo
        title={title}
        description={frontmatter.description}
        canonical={canonical}
        jsonLd={jsonLd}
      />
      <article className="z-10 w-full max-w-3xl mx-auto px-4 py-10">
        <header className="mb-8">
          <div className="inline-block mb-3 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-100 text-sm font-semibold">
            Blog
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {frontmatter.title}
          </h1>
          <div className="text-sm opacity-60">
            {new Date(frontmatter.date).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
            {frontmatter.readingTime ? ` · ${frontmatter.readingTime} read` : ''}
          </div>
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-4 leading-relaxed opacity-90">
          <Body />
        </div>

        <AdSlot slot="blog-post" className="my-10" />

        {related.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-4">More from the blog</h2>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((p) => (
                <li
                  key={p.frontmatter.slug}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <Link to={`/blog/${p.frontmatter.slug}`} className="block">
                    <p className="font-semibold text-sm">{p.frontmatter.title}</p>
                    <p className="text-xs opacity-70 mt-2">{p.frontmatter.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-10">
          <Link to="/blog" className="text-blue-600 hover:underline">
            ← Back to all blog posts
          </Link>
        </div>
      </article>
    </>
  );
}
