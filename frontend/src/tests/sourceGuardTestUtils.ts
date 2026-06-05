import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";

export function readSource(srcDir: string, file: string): string {
    return readFileSync(resolve(srcDir, file), "utf8");
}

export function listProductionSourceFiles(srcDir: string, dir = srcDir): string[] {
    return readdirSync(dir).flatMap((entry) => {
        const fullPath = resolve(dir, entry);
        const relativePath = relative(srcDir, fullPath);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            if (relativePath === "tests") return [];
            return listProductionSourceFiles(srcDir, fullPath);
        }

        if (!/\.(ts|tsx)$/.test(entry)) return [];
        if (entry.includes(".test.")) return [];
        return [relativePath];
    });
}

export function expectSourceToInclude(source: string, patterns: RegExp[]) {
    for (const pattern of patterns) {
        expect(source).toMatch(pattern);
    }
}

export function expectSourceToExclude(source: string, patterns: RegExp[]) {
    for (const pattern of patterns) {
        expect(source).not.toMatch(pattern);
    }
}

export function expectFilesToExclude(srcDir: string, files: string[], patterns: RegExp[]) {
    for (const file of files) {
        expectSourceToExclude(readSource(srcDir, file), patterns);
    }
}
