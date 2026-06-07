package ewshop.app.seo.audit;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

final class CodexMissingReferencePolicy {

    private static final List<Pattern> INTERNAL_NOISE_PATTERNS = List.of(
            Pattern.compile("^UnitAbility_LandMovement$", Pattern.CASE_INSENSITIVE),
            Pattern.compile("^UnitAbility_Class_.*$", Pattern.CASE_INSENSITIVE),
            Pattern.compile("^UnitAbility_Hero_.*Trad$", Pattern.CASE_INSENSITIVE),
            Pattern.compile("^UnitAbility_Hero_BattleAbility_Equipment_.*$", Pattern.CASE_INSENSITIVE),
            Pattern.compile("^UnitAbility_Prototype_.*$", Pattern.CASE_INSENSITIVE),
            Pattern.compile("^UnitAbility_Break.*UnitDamage$", Pattern.CASE_INSENSITIVE)
    );
    private static final List<CategoryProfile> CATEGORY_PROFILES = List.of(
            new CategoryProfile("DistrictImprovement", "public SEO/indexable pages", "High", "Medium",
                    "District improvements can support standalone discovery pages and dense district-to-improvement links.", 92),
            new CategoryProfile("Technology", "public SEO/indexable pages", "High", "Low",
                    "Technologies already fit the generated encyclopedia model and create strong crawl paths from unlock relationships.", 90),
            new CategoryProfile("District", "public SEO/indexable pages", "High", "Low",
                    "District references are high-intent game concepts with clear standalone page value.", 88),
            new CategoryProfile("Resource", "public SEO/indexable pages", "High", "Medium",
                    "Resources connect economy, district, improvement, and population concepts across the graph.", 84),
            new CategoryProfile("UnitClass", "related-link-only semantic entities", "Medium", "Low",
                    "Unit classes are useful hubs for relationship labels, but may not need full pages until richer copy exists.", 72),
            new CategoryProfile("PopulationCategory", "public SEO/indexable pages", "Medium", "Medium",
                    "Population categories can reduce thin-content risk by explaining city and faction systems.", 70),
            new CategoryProfile("UnitAbility", "related-link-only semantic entities", "High", "Medium",
                    "Unit abilities unlock many visible related links from unit pages, but often need aggregation before indexing.", 82),
            new CategoryProfile("BattleAbility", "related-link-only semantic entities", "High", "Medium",
                    "Battle abilities are link-dense combat concepts best introduced as semantic entities first.", 80),
            new CategoryProfile("ActiveSkill", "related-link-only semantic entities", "High", "Medium",
                    "Active skills can expose hidden combat and hero relationships without requiring public pages immediately.", 78),
            new CategoryProfile("Effect", "metadata-only/non-public entities", "Medium", "Low",
                    "Effects are usually implementation-level mechanics that can enrich metadata without standalone pages.", 56),
            new CategoryProfile("Descriptor", "metadata-only/non-public entities", "Low", "Low",
                    "Descriptors are better treated as tags or facets than crawlable pages.", 34),
            new CategoryProfile("Tag", "metadata-only/non-public entities", "Low", "Low",
                    "Tags improve classification and filtering, but rarely carry enough standalone SEO intent.", 32),
            new CategoryProfile("Shape", "metadata-only/non-public entities", "Low", "Low",
                    "Shapes are tactical metadata and should primarily support structured relationships.", 30),
            new CategoryProfile("FactionTrait", "related-link-only semantic entities", "Medium", "Medium",
                    "Faction traits are strong semantic connectors, but should become indexable only when descriptive content exists.", 68),
            new CategoryProfile("FactionAffinity", "related-link-only semantic entities", "Medium", "Medium",
                    "Faction affinities can connect factions, traits, and abilities while staying internal at first.", 64)
    );
    private static final Map<String, CategoryProfile> PROFILES_BY_PREFIX = buildProfilesByPrefix();

    private CodexMissingReferencePolicy() {
    }

    static String classifyCategory(String referenceKey) {
        String key = trimToEmpty(referenceKey);
        for (CategoryProfile profile : CATEGORY_PROFILES) {
            if (key.equals(profile.prefix()) || key.startsWith(profile.prefix() + "_")) {
                return profile.prefix();
            }
        }

        int underscoreIndex = key.indexOf('_');
        if (underscoreIndex > 0) {
            return key.substring(0, underscoreIndex);
        }
        return "Unclassified";
    }

    static CategoryProfile profileFor(String category) {
        return PROFILES_BY_PREFIX.getOrDefault(
                category,
                new CategoryProfile(
                        category,
                        "related-link-only semantic entities",
                        "Medium",
                        "Unknown",
                        "Unclassified references should be inspected before deciding whether they deserve public pages.",
                        48
                )
        );
    }

    static int priorityScore(CodexMissingReferenceAuditService.CodexMissingReferenceCategory category) {
        CategoryProfile profile = profileFor(category.categoryPrefix());
        int volumeScore = Math.min(40, category.unresolvedCount() * 4);
        int complexityPenalty = switch (profile.implementationComplexity()) {
            case "Low" -> 0;
            case "Medium" -> 8;
            default -> 14;
        };
        return Math.max(0, profile.basePriorityScore() + volumeScore - complexityPenalty);
    }

    static String priorityRationale(CodexMissingReferenceAuditService.CodexMissingReferenceCategory category) {
        return category.categoryPrefix() + " would restore about "
                + category.hiddenPillboxesUnlockedEstimate()
                + " hidden related-link pillbox(es), has "
                + category.estimatedSeoInternalLinkingImpact().toLowerCase(Locale.ROOT)
                + ", and is recommended as "
                + category.recommendation()
                + ".";
    }

    static boolean isInternalNoiseReference(String referenceKey) {
        String key = trimToEmpty(referenceKey);
        return INTERNAL_NOISE_PATTERNS.stream().anyMatch(pattern -> pattern.matcher(key).matches());
    }

    static String nearMatchIdentity(String key) {
        String normalized = trimToEmpty(key).toLowerCase(Locale.ROOT);
        String[] prefixes = {
                "minorfaction_",
                "population_minor_",
                "hero_minorfaction_",
                "elder_minorfaction_",
                "unitability_",
                "unitdescriptor_",
                "herodescriptor_",
                "effect_",
                "tag_"
        };
        for (String prefix : prefixes) {
            if (normalized.startsWith(prefix)) {
                return normalized.substring(prefix.length());
            }
        }
        return normalized;
    }

    private static Map<String, CategoryProfile> buildProfilesByPrefix() {
        LinkedHashMap<String, CategoryProfile> profiles = new LinkedHashMap<>();
        for (CategoryProfile profile : CATEGORY_PROFILES) {
            profiles.put(profile.prefix(), profile);
        }
        return Map.copyOf(profiles);
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    record CategoryProfile(
            String prefix,
            String recommendation,
            String seoImpact,
            String implementationComplexity,
            String impactDescription,
            int basePriorityScore
    ) {
    }
}
