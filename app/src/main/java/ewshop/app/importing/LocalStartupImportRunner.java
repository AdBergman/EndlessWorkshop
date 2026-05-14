package ewshop.app.importing;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.facade.dto.importing.ImportCountsDto;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.codex.CodexImportBatchDto;
import ewshop.facade.dto.importing.districts.DistrictImportBatchDto;
import ewshop.facade.dto.importing.improvements.ImprovementImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.units.UnitImportBatchDto;
import ewshop.facade.interfaces.CodexImportAdminFacade;
import ewshop.facade.interfaces.DistrictImportAdminFacade;
import ewshop.facade.interfaces.ImprovementImportAdminFacade;
import ewshop.facade.interfaces.TechImportAdminFacade;
import ewshop.facade.interfaces.UnitImportAdminFacade;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Component
@Profile({"dev", "local", "ai", "codex"})
@ConditionalOnProperty(prefix = "ewshop.local-import", name = "enabled", havingValue = "true")
public class LocalStartupImportRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(LocalStartupImportRunner.class);

    private final LocalStartupImportProperties properties;
    private final ObjectMapper objectMapper;
    private final TechImportAdminFacade techImportAdminFacade;
    private final DistrictImportAdminFacade districtImportAdminFacade;
    private final ImprovementImportAdminFacade improvementImportAdminFacade;
    private final UnitImportAdminFacade unitImportAdminFacade;
    private final CodexImportAdminFacade codexImportAdminFacade;

    public LocalStartupImportRunner(
            LocalStartupImportProperties properties,
            ObjectMapper objectMapper,
            TechImportAdminFacade techImportAdminFacade,
            DistrictImportAdminFacade districtImportAdminFacade,
            ImprovementImportAdminFacade improvementImportAdminFacade,
            UnitImportAdminFacade unitImportAdminFacade,
            CodexImportAdminFacade codexImportAdminFacade
    ) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.techImportAdminFacade = techImportAdminFacade;
        this.districtImportAdminFacade = districtImportAdminFacade;
        this.improvementImportAdminFacade = improvementImportAdminFacade;
        this.unitImportAdminFacade = unitImportAdminFacade;
        this.codexImportAdminFacade = codexImportAdminFacade;
    }

    @Override
    public void run(ApplicationArguments args) {
        runStartupImport();
    }

    void runStartupImport() {
        if (!properties.isEnabled()) {
            log.info("Local startup import is disabled.");
            return;
        }

        Path root = resolveRoot(properties.getRoot(), Path.of("").toAbsolutePath());
        Path exportsDir = root.resolve("exports");
        Path codexDir = root.resolve("codex");

        if (Files.notExists(root)) {
            log.info(
                    "Local startup import root {} does not exist; skipping. Create {} and {} for local imports.",
                    root,
                    exportsDir,
                    codexDir
            );
            return;
        }

        List<Path> files = new ArrayList<>();
        files.addAll(jsonFiles(exportsDir));
        files.addAll(jsonFiles(codexDir));

        if (files.isEmpty()) {
            log.info("No local startup import JSON files found under {}; continuing startup.", root);
            return;
        }

        log.info("Starting local startup import from {} with {} JSON file(s).", root, files.size());

        int imported = 0;
        int failed = 0;
        int skipped = 0;

        for (Path file : files) {
            try {
                ImportSummaryDto summary = importFile(file);
                if (summary == null) {
                    skipped++;
                    continue;
                }
                imported++;
                logImported(file, summary);
            } catch (Exception ex) {
                failed++;
                log.error("Local startup import failed for file {}.", file.toAbsolutePath().normalize(), ex);
            }
        }

        log.info(
                "Local startup import finished: {} imported, {} skipped, {} failed.",
                imported,
                skipped,
                failed
        );
    }

    private List<Path> jsonFiles(Path dir) {
        if (Files.notExists(dir)) {
            log.info("Local startup import folder {} does not exist; skipping it.", dir.toAbsolutePath().normalize());
            return List.of();
        }
        if (!Files.isDirectory(dir)) {
            log.warn("Local startup import path {} is not a directory; skipping it.", dir.toAbsolutePath().normalize());
            return List.of();
        }

        try (Stream<Path> stream = Files.list(dir)) {
            return stream
                    .filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().toLowerCase().endsWith(".json"))
                    .sorted(Comparator.comparing(path -> path.getFileName().toString()))
                    .toList();
        } catch (IOException ex) {
            log.error("Unable to list local startup import folder {}.", dir.toAbsolutePath().normalize(), ex);
            return List.of();
        }
    }

    static Path resolveRoot(Path configuredRoot, Path workingDirectory) {
        Path root = configuredRoot == null ? Path.of("local-imports") : configuredRoot;
        if (root.isAbsolute()) {
            return root.normalize();
        }

        Path direct = workingDirectory.resolve(root).normalize();
        if (Files.exists(direct)) {
            return direct;
        }

        Path parentSibling = workingDirectory.resolve("..").resolve(root).normalize();
        if (Files.exists(parentSibling)) {
            return parentSibling;
        }

        return direct;
    }

    private ImportSummaryDto importFile(Path file) throws IOException {
        JsonNode json = objectMapper.readTree(file.toFile());

        if (hasArray(json, "techs")) {
            return techImportAdminFacade.importTechs(objectMapper.treeToValue(json, TechImportBatchDto.class));
        }
        if (hasArray(json, "districts")) {
            return districtImportAdminFacade.importDistricts(objectMapper.treeToValue(json, DistrictImportBatchDto.class));
        }
        if (hasArray(json, "improvements")) {
            return improvementImportAdminFacade.importImprovements(objectMapper.treeToValue(json, ImprovementImportBatchDto.class));
        }
        if (hasArray(json, "units")) {
            return unitImportAdminFacade.importUnits(objectMapper.treeToValue(json, UnitImportBatchDto.class));
        }
        if (hasArray(json, "entries")) {
            return codexImportAdminFacade.importCodex(objectMapper.treeToValue(json, CodexImportBatchDto.class));
        }

        log.warn(
                "Local startup import skipped unsupported file {}; expected one of techs[], districts[], improvements[], units[], or entries[].",
                file.toAbsolutePath().normalize()
        );
        return null;
    }

    private static boolean hasArray(JsonNode json, String fieldName) {
        JsonNode value = json == null ? null : json.get(fieldName);
        return value != null && value.isArray();
    }

    private static void logImported(Path file, ImportSummaryDto summary) {
        ImportCountsDto counts = summary.counts();
        log.info(
                "Local startup import loaded {} as {}: received={}, inserted={}, updated={}, unchanged={}, deleted={}, failed={}.",
                file.toAbsolutePath().normalize(),
                summary.importKind(),
                counts.received(),
                counts.inserted(),
                counts.updated(),
                counts.unchanged(),
                counts.deleted(),
                counts.failed()
        );
    }
}
