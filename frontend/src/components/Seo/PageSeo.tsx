import type { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import {
    DEFAULT_IMAGE_URL,
    SITE_NAME,
    SITE_URL,
} from "@/components/Seo/routeSeo";

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

            {jsonLdNodes.map((node, index) => (
                <script key={`${canonicalUrl}-jsonld-${index}`} type="application/ld+json">
                    {JSON.stringify(node)}
                </script>
            ))}

            {children}
        </Helmet>
    );
}
