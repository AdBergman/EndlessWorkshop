import { cleanup, render, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { afterEach, describe, expect, it } from "vitest";
import PageSeo from "./PageSeo";

function renderPageSeo() {
    return render(
        <HelmetProvider>
            <PageSeo
                title="EL2 Tech Tree Planner | Endless Workshop"
                description="Explore the Endless Legend 2 technology tree, view unlocks, and plan research paths."
                path="/tech"
                jsonLd={[
                    {
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        name: "EL2 Tech Tree Planner",
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        itemListElement: [],
                    },
                ]}
            />
        </HelmetProvider>
    );
}

afterEach(() => {
    cleanup();
    document.head.innerHTML = "";
});

describe("PageSeo", () => {
    it("writes core metadata into the document head", () => {
        renderPageSeo();

        expect(document.title).toBe("EL2 Tech Tree Planner | Endless Workshop");
        expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute(
            "content",
            "Explore the Endless Legend 2 technology tree, view unlocks, and plan research paths."
        );
        expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
        expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
            "href",
            "https://endlessworkshop.dev/tech"
        );
        expect(document.head.querySelector('meta[property="og:title"]')).toHaveAttribute(
            "content",
            "EL2 Tech Tree Planner | Endless Workshop"
        );
        expect(document.head.querySelector('meta[property="og:description"]')).toHaveAttribute(
            "content",
            "Explore the Endless Legend 2 technology tree, view unlocks, and plan research paths."
        );
        expect(document.head.querySelector('meta[property="og:url"]')).toHaveAttribute(
            "content",
            "https://endlessworkshop.dev/tech"
        );
        expect(document.head.querySelector('meta[property="og:type"]')).toHaveAttribute("content", "website");
        expect(document.head.querySelector('meta[name="twitter:card"]')).toHaveAttribute(
            "content",
            "summary_large_image"
        );
        expect(document.head.querySelector('meta[name="twitter:title"]')).toHaveAttribute(
            "content",
            "EL2 Tech Tree Planner | Endless Workshop"
        );
        expect(document.head.querySelector('link[rel="icon"]')).toHaveAttribute("href", "/favicon.svg");
        expect(document.head.querySelector('link[rel="shortcut icon"]')).toHaveAttribute("href", "/favicon.ico");
    });

    it("supports one or more JSON-LD payloads", async () => {
        renderPageSeo();

        await waitFor(() => {
            expect(document.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
        });

        const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));

        expect(scripts).toHaveLength(2);
        expect(JSON.parse(scripts[0].textContent ?? "{}")).toMatchObject({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "EL2 Tech Tree Planner",
        });
        expect(JSON.parse(scripts[1].textContent ?? "{}")).toMatchObject({
            "@type": "BreadcrumbList",
        });
    });
});
