import rawManifestJson from "../../../public/svg/manifest.json";

export {
    ICON_MANIFEST_SECTIONS,
    getIconByDescriptionToken,
    getIconPath,
    getSemanticIcon,
    getStatIconByGameplayProperty,
    type IconManifestEntry,
    type IconManifestSection,
} from "./semanticIconManifest";

type RawManifestJson = Record<string, string>;

const rawManifest = rawManifestJson as RawManifestJson;

export function getRawIcon(rawKey: string): string | null {
    return rawManifest[rawKey] ?? null;
}

export function getRawIconEntries(): Array<{ rawKey: string; path: string }> {
    return Object.entries(rawManifest).map(([rawKey, path]) => ({ rawKey, path }));
}
