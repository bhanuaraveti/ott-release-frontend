import { Link } from 'react-router-dom';

const frontmatter = {
  slug: 'how-we-track-ott-releases',
  title: 'How We Track Telugu OTT Releases',
  description:
    'A short explainer on how TeluguMoviesOTT collects, enriches, and publishes its daily index of Telugu films and series across every major streaming platform.',
  date: '2026-03-10',
  readingTime: '4 min',
};

function Body() {
  return (
    <>
      <p>
        TeluguMoviesOTT publishes a daily index of Telugu films and series across every major streaming platform. The directory is rebuilt every day with fresh data, and every page you read — the homepage, the platform pages, and the individual movie pages — reflects the same underlying data snapshot. This post explains, in plain terms, how that pipeline works and why the output is structured the way it is.
      </p>
      <h2 className="text-2xl font-bold mt-8 mb-4">The source</h2>
      <p>
        Our index starts with a scraper that runs every evening Indian time. The scraper pulls public listings from a curated set of source pages and extracts the five fundamental fields for every title: the name, the platform, the streaming availability, the content type (film or series), and where available, the IMDb rating. These fields are merged into a single JSON file that acts as the canonical dataset for the entire site. Scraping is a judgment call — source pages change their markup, some titles are ambiguous, and rarely a listing is duplicated across sources — and the pipeline includes validation steps to catch the obvious anomalies before they ship.
      </p>
      <p>
        Once the base dataset is assembled, an enrichment step calls a third-party metadata provider to look up additional fields for each title: a synopsis, a poster image, cast, genres, release date, runtime, and a director credit where available. Not every title is indexed by the provider — smaller regional releases often are not — so the enrichment process treats missing data as the default case and uses editorial fallback copy on pages where the metadata is absent. That fallback is why every movie page on the site has at least a few paragraphs of real content, even when the underlying title has no enriched metadata attached.
      </p>
      <h2 className="text-2xl font-bold mt-8 mb-4">The build</h2>
      <p>
        The frontend is a React application, but it is not served as a traditional single-page app. Instead, every route — the homepage, each platform page, each movie page, each blog post — is pre-rendered to static HTML at build time. That means when a search crawler visits{' '}
        <Link to="/" className="text-blue-600 hover:underline">
          the homepage
        </Link>
        {' '}or any{' '}
        <Link to="/platform/aha" className="text-blue-600 hover:underline">
          platform page
        </Link>
        , it sees fully rendered HTML with real content, metadata tags, and JSON-LD schema, rather than an empty div waiting for JavaScript to run.
      </p>
      <p>
        Pre-rendering matters for two reasons. First, search engines and automated crawlers often do not execute JavaScript, so a traditional single-page app is effectively invisible to them. Second, static HTML loads faster than a JavaScript-heavy page on slower devices and networks, which matters for a substantial share of our audience. The pre-render pipeline walks every route in the site, produces a complete HTML file for each, and ships those files alongside the JavaScript bundle so that clients with JS enabled still get the interactive experience.
      </p>
      <h2 className="text-2xl font-bold mt-8 mb-4">The refresh loop</h2>
      <p>
        When the daily scrape completes, the backend sends a signal to the frontend hosting service to trigger a rebuild. The rebuild pulls the latest JSON dataset, regenerates every static HTML file with the fresh data, and redeploys the site. This entire cycle — scrape, enrich, trigger rebuild, publish — runs without human intervention. If a source page changes or the metadata provider returns different results, the next daily run picks up the changes and the site reflects them within a day.
      </p>
      <p>
        If a title drops off a platform, it disappears from our index on the next daily run. If a new title lands, it shows up within a day. There is no editorial queue where releases wait for manual approval; the data is the source of truth, and the site reflects the data.
      </p>
      <h2 className="text-2xl font-bold mt-8 mb-4">What we do not do</h2>
      <p>
        We do not accept sponsored placements. We do not re-order titles by commercial arrangement. We do not publish editorial reviews that rank films against each other. The site is a directory, not a publication, and its value comes from being a reliable reflection of what is actually streaming rather than from opinions about what you should watch. The blog posts on this site — including this one — exist to provide context on the platforms themselves, not to steer viewers toward or away from specific titles.
      </p>
      <p>
        If you have noticed an error in our data — a wrong date, a missing title, a platform mismatch — the fastest way to fix it is to submit a correction through the contact information in our About page. Corrections land in the next daily rebuild.
      </p>
    </>
  );
}

export default { frontmatter, Body };
