package ewshop.app.migration;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

class Jackson2UsageInventoryTest {

    @Test
    void reportRemainingJackson2UsageByModule() throws IOException {
        Path repoRoot = findRepoRoot(Path.of("").toAbsolutePath());
        List<Usage> usages = new ArrayList<>();

        for (String module : List.of("api", "app", "domain", "facade", "infrastructure")) {
            collectJavaUsages(repoRoot.resolve(module), module, usages);
            collectPomUsages(repoRoot.resolve(module).resolve("pom.xml"), module, usages);
        }
        collectPomUsages(repoRoot.resolve("pom.xml"), "root", usages);

        System.out.println();
        System.out.println("Jackson 2 usage inventory. Informational while spring-boot-jackson2 is intentional debt.");
        usages.stream()
                .sorted()
                .forEach(usage -> System.out.printf(
                        Locale.ROOT,
                        "[%s] %-14s %-12s %s:%d%n",
                        usage.category(),
                        usage.module(),
                        usage.kind(),
                        repoRoot.relativize(usage.path()),
                        usage.lineNumber()
                ));
    }

    private static void collectJavaUsages(Path moduleRoot, String module, List<Usage> usages) throws IOException {
        Path sourceRoot = moduleRoot.resolve("src");
        if (Files.notExists(sourceRoot)) {
            return;
        }

        try (var paths = Files.walk(sourceRoot)) {
            List<Path> javaFiles = paths
                    .filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().endsWith(".java"))
                    .toList();

            for (Path javaFile : javaFiles) {
                List<String> lines = Files.readAllLines(javaFile);
                for (int index = 0; index < lines.size(); index++) {
                    if (lines.get(index).contains("com.fasterxml.jackson")) {
                        usages.add(new Usage(module, javaFile, index + 1, kind(javaFile), category(javaFile)));
                    }
                }
            }
        }
    }

    private static void collectPomUsages(Path pom, String module, List<Usage> usages) throws IOException {
        if (Files.notExists(pom)) {
            return;
        }

        List<String> lines = Files.readAllLines(pom);
        for (int index = 0; index < lines.size(); index++) {
            String line = lines.get(index);
            if (line.contains("spring-boot-jackson2") || line.contains("com.fasterxml.jackson")) {
                usages.add(new Usage(module, pom, index + 1, "pom", "dependency"));
            }
        }
    }

    private static Path findRepoRoot(Path start) {
        Path current = start;
        while (current != null) {
            if (Files.exists(current.resolve(".git")) && Files.exists(current.resolve("pom.xml"))) {
                return current;
            }
            current = current.getParent();
        }
        throw new IllegalStateException("Could not locate repository root from " + start);
    }

    private static String kind(Path path) {
        String normalized = path.toString().replace('\\', '/');
        if (normalized.contains("/src/test/")) {
            return "test-code";
        }
        return "runtime-code";
    }

    private static String category(Path path) {
        String normalized = path.toString().replace('\\', '/');
        if (normalized.contains("/src/test/")) {
            return "tests";
        }
        if (normalized.contains("/dto/importing/")) {
            return "import-dto";
        }
        return "runtime";
    }

    private record Usage(
            String module,
            Path path,
            int lineNumber,
            String kind,
            String category
    ) implements Comparable<Usage> {
        @Override
        public int compareTo(Usage other) {
            int categoryCompare = category.compareTo(other.category);
            if (categoryCompare != 0) return categoryCompare;
            int moduleCompare = module.compareTo(other.module);
            if (moduleCompare != 0) return moduleCompare;
            int pathCompare = path.compareTo(other.path);
            if (pathCompare != 0) return pathCompare;
            return Integer.compare(lineNumber, other.lineNumber);
        }
    }
}
