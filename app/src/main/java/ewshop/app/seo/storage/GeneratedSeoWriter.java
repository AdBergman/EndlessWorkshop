package ewshop.app.seo.storage;

import ewshop.app.seo.generation.SeoRoutes;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.stream.Stream;

@Component
public class GeneratedSeoWriter {

    private final SeoOutputLocator seoOutputLocator;

    public GeneratedSeoWriter(SeoOutputLocator seoOutputLocator) {
        this.seoOutputLocator = seoOutputLocator;
    }

    public LinkedHashSet<String> listExistingGeneratedKinds() {
        Path outputRoot = seoOutputLocator.getOutputRoot();
        if (!Files.isDirectory(outputRoot)) {
            return new LinkedHashSet<>();
        }

        try (Stream<Path> pathStream = Files.list(outputRoot)) {
            return pathStream
                    .filter(Files::isDirectory)
                    .map(path -> path.getFileName().toString())
                    .collect(LinkedHashSet::new, LinkedHashSet::add, LinkedHashSet::addAll);
        } catch (IOException exception) {
            throw new UncheckedIOException("Failed to inspect generated SEO output root: " + outputRoot, exception);
        }
    }

    public void deleteGeneratedOutput(LinkedHashSet<String> kindsToRebuild) {
        for (String kind : kindsToRebuild) {
            deleteGeneratedKindOutput(kind);
        }
    }

    public List<String> listGeneratedRoutes() {
        Path outputRoot = seoOutputLocator.getOutputRoot();
        if (!Files.isDirectory(outputRoot)) {
            return List.of();
        }

        try (Stream<Path> pathStream = Files.walk(outputRoot, 4)) {
            LinkedHashSet<String> routes = pathStream
                    .filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().equals("index.html"))
                    .map(outputRoot::relativize)
                    .map(SeoRoutes::routeForGeneratedIndex)
                    .filter(route -> !route.isBlank())
                    .collect(LinkedHashSet::new, LinkedHashSet::add, LinkedHashSet::addAll);

            return routes.stream()
                    .sorted()
                    .toList();
        } catch (IOException exception) {
            throw new UncheckedIOException("Failed to read generated SEO routes from: " + outputRoot, exception);
        }
    }

    public void writeUtf8(Path targetFile, String content) {
        try {
            Files.createDirectories(targetFile.getParent());
            Files.writeString(targetFile, content, StandardCharsets.UTF_8);
        } catch (IOException exception) {
            throw new UncheckedIOException("Failed to write SEO output: " + targetFile, exception);
        }
    }

    private void deleteGeneratedKindOutput(String kind) {
        Path kindOutputDirectory = seoOutputLocator.getOutputRoot().resolve(kind);
        if (!Files.exists(kindOutputDirectory)) {
            return;
        }

        try (Stream<Path> pathStream = Files.walk(kindOutputDirectory)) {
            pathStream.sorted(Comparator.reverseOrder()).forEach(this::deletePath);
        } catch (IOException exception) {
            throw new UncheckedIOException("Failed to clear generated SEO output for kind '" + kind + "'", exception);
        }
    }

    private void deletePath(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException exception) {
            throw new UncheckedIOException("Failed to delete generated SEO output: " + path, exception);
        }
    }
}
