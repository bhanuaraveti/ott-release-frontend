import { Helmet } from '@dr.pogodin/react-helmet';

/**
 * Seo — Helmet wrapper that emits title/description, canonical, Open Graph,
 * Twitter Card tags, and optional JSON-LD schema into the document head.
 *
 * Used by every route so prerendered HTML contains route-specific <head>.
 */
export default function Seo({
  title,
  description,
  canonical,
  jsonLd,
}) {
  return (
    <Helmet>
      {title ? <title>{title}</title> : null}
      {title ? <meta name="title" content={title} /> : null}
      {description ? <meta name="description" content={description} /> : null}

      {canonical ? <link rel="canonical" href={canonical} /> : null}

      {title ? <meta property="og:title" content={title} /> : null}
      {description ? <meta property="og:description" content={description} /> : null}
      {canonical ? <meta property="og:url" content={canonical} /> : null}

      {title ? <meta name="twitter:title" content={title} /> : null}
      {description ? <meta name="twitter:description" content={description} /> : null}

      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  );
}
