import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterHandle?: string;
  type?: string;
  canonical?: string;
  structuredData?: object;
  noindex?: boolean;
}

const SEO = ({ 
  title, 
  description, 
  keywords, 
  author = 'TECH Theory', 
  ogTitle, 
  ogDescription, 
  ogImage, 
  ogUrl, 
  twitterHandle = '@techtheory', 
  type = 'website',
  canonical,
  structuredData,
  noindex = false
}: SEOProps) => {
  const siteTitle = 'TECH Theory - Modern Tech News & Reviews';
  const fullTitle = title ? `${title} | TECH Theory` : siteTitle;
  const defaultDescription = 'Stay ahead with the latest tech news, reviews, and insights. Your premier destination for technology coverage.';
  const metaDescription = description || defaultDescription;
  
  // Base URL for canonical tags - replace with your actual domain
  const baseUrl = 'https://techtheory.co.in';
  const canonicalUrl = canonical || `${baseUrl}${window.location.pathname}${window.location.search}`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph tags */}
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || metaDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={ogUrl || canonicalUrl} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={ogTitle || fullTitle} />
      <meta name="twitter:description" content={ogDescription || metaDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
