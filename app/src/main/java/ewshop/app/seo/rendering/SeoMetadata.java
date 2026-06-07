package ewshop.app.seo.rendering;

record SeoMetadata(
        String pageTitle,
        String seoDescription,
        String canonicalUrl,
        String pageUrl,
        String robots,
        String webPageJsonLd,
        String breadcrumbJsonLd
) {
}
