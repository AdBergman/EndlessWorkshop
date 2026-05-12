export const SITE_NAME = "Endless Workshop";
export const SITE_URL = "https://endlessworkshop.dev";
export const DEFAULT_IMAGE_URL = `${SITE_URL}/logo512.png`;

type JsonLdNode = Record<string, unknown>;

export type PublicRouteSeoKey =
    | "home"
    | "tech"
    | "units"
    | "codex"
    | "summary"
    | "mods"
    | "info";

export type AppRouteSeoKey = Exclude<PublicRouteSeoKey, "home">;

export type PublicRouteSeoConfig = {
    path: string;
    title: string;
    description: string;
    robots?: string;
    imageUrl?: string;
    ogType?: string;
    indexable: boolean;
    jsonLd?: JsonLdNode | JsonLdNode[];
};

// SPA shell metadata only. Generated/legacy SEO routes such as
// /encyclopedia/units/:slug and /units/:slug are backend-owned and intentionally
// kept alive for search engines.
export const publicRouteSeo: Record<PublicRouteSeoKey, PublicRouteSeoConfig> = {
    home: {
        path: "/",
        title: "Endless Workshop | Endless Legend 2 Tools and References",
        description:
            "Interactive Endless Legend 2 tools and references for tech planning, unit evolution, codex browsing, mods, and end-game report analysis.",
        robots: "noindex, follow",
        indexable: false,
    },
    tech: {
        path: "/tech",
        title: "EL2 Tech Tree Planner | Endless Workshop",
        description:
            "Explore the Endless Legend 2 technology tree, view unlocks, and plan research paths with the EWShop interactive tech planner.",
        indexable: true,
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "EL2 Tech Tree Planner",
            description: "Interactive Endless Legend 2 technology tree planner and reference.",
            url: `${SITE_URL}/tech`,
        },
    },
    units: {
        path: "/units",
        title: "EL2 Unit Evolution Explorer | Endless Workshop",
        description:
            "Explore Endless Legend 2 unit evolution, stats, and progression with the EWShop interactive unit explorer.",
        indexable: true,
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "EL2 Unit Evolution Explorer",
            description: "Interactive Endless Legend 2 unit evolution explorer and reference.",
            url: `${SITE_URL}/units`,
        },
    },
    codex: {
        path: "/codex",
        title: "EL2 Codex Encyclopedia | Endless Workshop",
        description:
            "Browse the Endless Legend 2 codex, encyclopedia entries, and cross-linked workshop reference data in Endless Workshop.",
        indexable: true,
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "EL2 Codex Encyclopedia",
            description: "Searchable Endless Legend 2 codex and encyclopedia reference.",
            url: `${SITE_URL}/codex`,
            about: "Endless Legend 2",
        },
    },
    summary: {
        path: "/summary",
        title: "Endless Legend 2 Game Summary | Endless Workshop",
        description:
            "Upload or preview Endless Legend 2 end-game reports to review summaries, tech progress, empire stats, and city breakdowns.",
        indexable: true,
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Endless Legend 2 Game Summary",
            description:
                "Endless Legend 2 end-game report viewer with summary, tech progress, empire stats, and city breakdown views.",
            url: `${SITE_URL}/summary`,
        },
    },
    mods: {
        path: "/mods",
        title: "EL2 Mods | Essentials Pack & Tools | Endless Workshop",
        description:
            "Download the EL2 Essentials Pack and supporting Endless Legend 2 mods, with concise install guidance and release links.",
        indexable: true,
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "EL2 Mods",
            description: "Endless Legend 2 mod pack downloads, support tools, and installation guidance.",
            url: `${SITE_URL}/mods`,
            about: "Endless Legend 2 mods",
        },
    },
    info: {
        path: "/info",
        title: "About Endless Workshop | Endless Legend 2 Tools",
        description:
            "Learn about Endless Workshop, an interactive Endless Legend 2 reference and planning tool for tech trees, units, saves, codex data, and mods.",
        indexable: true,
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About Endless Workshop",
            description: "About Endless Workshop and its Endless Legend 2 reference tools.",
            url: `${SITE_URL}/info`,
        },
    },
};

export const PUBLIC_ROUTE_SEO = Object.values(publicRouteSeo);

export const INDEXABLE_PUBLIC_ROUTE_SEO = PUBLIC_ROUTE_SEO.filter((route) => route.indexable);
