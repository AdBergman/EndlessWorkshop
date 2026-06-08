import type { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import {
    DEFAULT_IMAGE_URL,
    SITE_NAME,
    SITE_URL,
} from "@/components/Seo/routeSeo";
import { stringifyJsonLd } from "@/components/Seo/pageSeoJson";

type PageSeoProps = {
    title: string;
    description: string;
    path: string;
    imageUrl?: string;
    robots?: string;
    ogType?: string;
    children?: ReactNode;
    jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

function buildCanonicalUrl(path: string): string {
    if (!path || path === "/") {
        return SITE_URL;
    }

    return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export default function PageSeo({
    title,
    description,
    path,
    imageUrl = DEFAULT_IMAGE_URL,
    robots = "index, follow",
    ogType = "website",
    children,
    jsonLd,
}: PageSeoProps) {
    const canonicalUrl = buildCanonicalUrl(path);
    const jsonLdNodes = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

    return (
        <Helmet prioritizeSeoTags>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="robots" content={robots} />

            <link rel="canonical" href={canonicalUrl} />

            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={imageUrl} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />

            <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <link rel="shortcut icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/manifest.json" />

            {jsonLdNodes.map((node, index) => (
                <script key={`${canonicalUrl}-jsonld-${index}`} type="application/ld+json">
                    {stringifyJsonLd(node)}
                </script>
            ))}

            {children}
        </Helmet>
    );
}
