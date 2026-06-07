package ewshop.app.seo;

import ewshop.app.seo.storage.GeneratedSeoWriter;
import ewshop.app.seo.storage.SeoOutputLocator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashSet;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class GeneratedSeoWriterTest {

    @TempDir
    Path tempDir;

    @Test
    void deleteGeneratedOutputDeletesOnlyRequestedKindDirectories() throws Exception {
        SeoOutputLocator outputLocator = new SeoOutputLocator(tempDir.toString());
        GeneratedSeoWriter writer = new GeneratedSeoWriter(outputLocator);

        Path generatedTechPage = tempDir.resolve("tech/workshop/index.html");
        Path generatedEncyclopediaPage = tempDir.resolve("encyclopedia/tech/workshop/index.html");
        Path unrelatedDirectoryFile = tempDir.resolve("manual-notes/keep.txt");
        Path rootSpaAsset = tempDir.resolve("tech.html");
        Files.createDirectories(generatedTechPage.getParent());
        Files.createDirectories(generatedEncyclopediaPage.getParent());
        Files.createDirectories(unrelatedDirectoryFile.getParent());
        Files.writeString(generatedTechPage, "old generated tech page");
        Files.writeString(generatedEncyclopediaPage, "old generated encyclopedia page");
        Files.writeString(unrelatedDirectoryFile, "manual file");
        Files.writeString(rootSpaAsset, "spa asset");

        writer.deleteGeneratedOutput(new LinkedHashSet<>(List.of("tech", "encyclopedia")));

        assertThat(generatedTechPage).doesNotExist();
        assertThat(generatedEncyclopediaPage).doesNotExist();
        assertThat(unrelatedDirectoryFile).hasContent("manual file");
        assertThat(rootSpaAsset).hasContent("spa asset");
    }
}
