package ewshop.app.importing;

import ewshop.facade.dto.importing.ImportCountsDto;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.codex.CodexImportBatchDto;
import ewshop.facade.dto.importing.districts.DistrictImportBatchDto;
import ewshop.facade.dto.importing.factions.FactionImportBatchDto;
import ewshop.facade.dto.importing.heroes.HeroImportBatchDto;
import ewshop.facade.dto.importing.improvements.ImprovementImportBatchDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportBatchDto;
import ewshop.facade.dto.importing.skills.SkillImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.units.UnitImportBatchDto;
import ewshop.facade.interfaces.CodexImportAdminFacade;
import ewshop.facade.interfaces.DistrictImportAdminFacade;
import ewshop.facade.interfaces.FactionImportAdminFacade;
import ewshop.facade.interfaces.ImprovementImportAdminFacade;
import ewshop.facade.interfaces.QuestExplorerImportAdminFacade;
import ewshop.facade.interfaces.HeroImportAdminFacade;
import ewshop.facade.interfaces.SkillImportAdminFacade;
import ewshop.facade.interfaces.TechImportAdminFacade;
import ewshop.facade.interfaces.UnitImportAdminFacade;
import ewshop.domain.model.importing.ImportFileResult;
import ewshop.domain.model.importing.ImportFileStatus;
import ewshop.domain.model.importing.ImportHistoryCounts;
import ewshop.domain.model.importing.ImportRun;
import ewshop.domain.model.importing.ImportRunStatus;
import ewshop.domain.model.importing.ImportTrigger;
import ewshop.domain.repository.ImportHistoryRepository;
import org.jspecify.annotations.NonNull;
import org.jspecify.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

@Component
@Profile({"dev", "local", "ai", "codex"})
@ConditionalOnProperty(prefix = "ewshop.local-import", name = "enabled", havingValue = "true")
public class LocalStartupImportRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(LocalStartupImportRunner.class);
    private static final Set<String> DIAGNOSTICS_ONLY_CODEX_EXPORT_KINDS = Set.of(
            "quest_explorer_branch_diagnostics",
            "actions-codex-inventory",
            "bonuses-codex-mechanics",
            "victorycondition-threshold-diagnostics"
    );
    private final LocalStartupImportProperties properties;
    private final ObjectMapper objectMapper;
    private final Environment environment;
    private final TechImportAdminFacade techImportAdminFacade;
    private final DistrictImportAdminFacade districtImportAdminFacade;
    private final ImprovementImportAdminFacade improvementImportAdminFacade;
    private final UnitImportAdminFacade unitImportAdminFacade;
    private final FactionImportAdminFacade factionImportAdminFacade;
    private final HeroImportAdminFacade heroImportAdminFacade;
    private final SkillImportAdminFacade skillImportAdminFacade;
    private final CodexImportAdminFacade codexImportAdminFacade;
    private final QuestExplorerImportAdminFacade questExplorerImportAdminFacade;
    private final ImportHistoryRepository importHistoryRepository;

    public LocalStartupImportRunner(
            LocalStartupImportProperties properties,
            ObjectMapper objectMapper,
            Environment environment,
            TechImportAdminFacade techImportAdminFacade,
            DistrictImportAdminFacade districtImportAdminFacade,
            ImprovementImportAdminFacade improvementImportAdminFacade,
            UnitImportAdminFacade unitImportAdminFacade,
            FactionImportAdminFacade factionImportAdminFacade,
            HeroImportAdminFacade heroImportAdminFacade,
            SkillImportAdminFacade skillImportAdminFacade,
            CodexImportAdminFacade codexImportAdminFacade,
            QuestExplorerImportAdminFacade questExplorerImportAdminFacade,
            ImportHistoryRepository importHistoryRepository
    ) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.environment = environment;
        this.techImportAdminFacade = techImportAdminFacade;
        this.districtImportAdminFacade = districtImportAdminFacade;
        this.improvementImportAdminFacade = improvementImportAdminFacade;
        this.unitImportAdminFacade = unitImportAdminFacade;
        this.factionImportAdminFacade = factionImportAdminFacade;
        this.heroImportAdminFacade = heroImportAdminFacade;
        this.skillImportAdminFacade = skillImportAdminFacade;
        this.codexImportAdminFacade = codexImportAdminFacade;
        this.questExplorerImportAdminFacade = questExplorerImportAdminFacade;
        this.importHistoryRepository = importHistoryRepository;
    }

    @Override
    public void run(@NonNull ApplicationArguments args) {
        runStartupImport();
    }

    LocalStartupImportSummary runStartupImport() {
        assertAllowedProfiles();

        if (!properties.isEnabled()) {
            log.info("Local startup import is disabled.");
            return LocalStartupImportSummary.empty();
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
            return LocalStartupImportSummary.empty();
        }

        List<LocalImportFile> files = new ArrayList<>();
        files.addAll(jsonFiles(exportsDir, LocalImportFolder.EXPORTS));
        files.addAll(jsonFiles(codexDir, LocalImportFolder.CODEX));

        if (files.isEmpty()) {
            log.info("No local startup import JSON files found under {}; continuing startup.", root);
            return LocalStartupImportSummary.empty();
        }

        log.info("Starting local startup import from {} with {} JSON file(s).", root, files.size());
        ImportHistoryRecorder historyRecorder = new ImportHistoryRecorder(importHistoryRepository, root, Instant.now());

        int imported = 0;
        int failed = 0;
        int skipped = 0;
        Set<Path> questExplorerPaths = new HashSet<>();

        List<LocalImportFile> questExplorerFiles = findQuestExplorerFiles(files);
        if (!questExplorerFiles.isEmpty()) {
            questExplorerFiles.forEach(file -> questExplorerPaths.add(file.path()));
            try {
                ImportSummaryDto summary = importQuestExplorerFile(questExplorerFiles);
                imported++;
                logImported(questExplorerFiles.get(0).path(), summary);
                historyRecorder.recordImported(questExplorerFiles.get(0), summary);
            } catch (Exception ex) {
                failed++;
                questExplorerFiles.forEach(file -> historyRecorder.recordFailed(file, ex));
                log.error("Local startup import failed for quest_explorer file.", ex);
            }
        }

        for (LocalImportFile file : files) {
            if (questExplorerPaths.contains(file.path())) {
                continue;
            }
            try {
                ImportSummaryDto summary = importFile(file);
                if (summary == null) {
                    skipped++;
                    historyRecorder.recordSkipped(file, skipReasonFor(file));
                    continue;
                }
                imported++;
                logImported(file.path(), summary);
                historyRecorder.recordImported(file, summary);
            } catch (Exception ex) {
                failed++;
                historyRecorder.recordFailed(file, ex);
                log.error("Local startup import failed for file {}.", file.path().toAbsolutePath().normalize(), ex);
            }
        }

        log.info(
                "Local startup import finished: {} imported, {} skipped, {} failed.",
                imported,
                skipped,
                failed
        );
        historyRecorder.save();
        return new LocalStartupImportSummary(imported, skipped, failed);
    }

    private void assertAllowedProfiles() {
        Set<String> activeProfiles = Arrays.stream(environment.getActiveProfiles())
                .map(profile -> profile.toLowerCase(Locale.ROOT))
                .collect(java.util.stream.Collectors.toSet());

        if (activeProfiles.contains("prod") || activeProfiles.contains("staging")) {
            throw new IllegalStateException(
                    "Local startup import is not allowed when prod or staging profile is active. "
                            + "Use Admin Import/Web UI/API imports for deployed environments."
            );
        }
    }

    private List<LocalImportFile> jsonFiles(Path dir, LocalImportFolder folder) {
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
                    .map(path -> new LocalImportFile(path, folder))
                    .toList();
        } catch (IOException ex) {
            log.error("Unable to list local startup import folder {}.", dir.toAbsolutePath().normalize(), ex);
            return List.of();
        }
    }

    static Path resolveRoot(@Nullable Path configuredRoot, Path workingDirectory) {
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

    private @Nullable ImportSummaryDto importFile(LocalImportFile file) throws IOException {
        JsonNode json = objectMapper.readTree(file.path().toFile());

        return switch (file.folder()) {
            case EXPORTS -> importExportFile(file.path(), json);
            case CODEX -> importCodexFile(file.path(), json);
        };
    }

    private String skipReasonFor(LocalImportFile file) {
        JsonNode json = readJsonOrNull(file.path());
        String exportKind = json == null ? null : normalizedExportKind(json);

        if (file.folder() == LocalImportFolder.EXPORTS) {
            return "unsupported-export-kind";
        }

        if (exportKind != null && DIAGNOSTICS_ONLY_CODEX_EXPORT_KINDS.contains(exportKind)) {
            return "diagnostics-only";
        }

        if (file.path().getFileName().toString().equalsIgnoreCase("last-export-status.json")) {
            return "diagnostics-only";
        }

        return "unsupported-codex-shape";
    }

    private @Nullable ImportSummaryDto importExportFile(Path file, JsonNode json) throws IOException {
        String exportKind = normalizedExportKind(json);

        if ("tech".equals(exportKind) || shouldLetAdminValidationReport(json, "techs", exportKind)) {
            return techImportAdminFacade.importTechs(objectMapper.treeToValue(json, TechImportBatchDto.class));
        }
        if ("districts".equals(exportKind) || shouldLetAdminValidationReport(json, "districts", exportKind)) {
            return districtImportAdminFacade.importDistricts(objectMapper.treeToValue(json, DistrictImportBatchDto.class));
        }
        if ("improvements".equals(exportKind) || shouldLetAdminValidationReport(json, "improvements", exportKind)) {
            return improvementImportAdminFacade.importImprovements(objectMapper.treeToValue(json, ImprovementImportBatchDto.class));
        }
        if ("units".equals(exportKind) || shouldLetAdminValidationReport(json, "units", exportKind)) {
            return unitImportAdminFacade.importUnits(objectMapper.treeToValue(json, UnitImportBatchDto.class));
        }
        if ("factions".equals(exportKind) || shouldLetAdminValidationReport(json, "factions", exportKind)) {
            return factionImportAdminFacade.importFactions(objectMapper.treeToValue(json, FactionImportBatchDto.class));
        }
        if ("heroes".equals(exportKind)) {
            return heroImportAdminFacade.importHeroes(objectMapper.treeToValue(json, HeroImportBatchDto.class));
        }
        if ("skills".equals(exportKind)) {
            return skillImportAdminFacade.importSkills(objectMapper.treeToValue(json, SkillImportBatchDto.class));
        }
        if ("quest_explorer".equals(exportKind)) {
            return questExplorerImportAdminFacade.importQuestExplorer(objectMapper.treeToValue(json, QuestExplorerImportBatchDto.class));
        }

        log.warn(
                "Local startup import skipped unsupported exports file {} with exportKind='{}'. Supported exports kinds are: districts, improvements, units, factions, heroes, skills, tech, and quest_explorer.",
                file.toAbsolutePath().normalize(),
                exportKind == null ? "missing" : exportKind
        );
        return null;
    }

    private List<LocalImportFile> findQuestExplorerFiles(List<LocalImportFile> files) {
        List<LocalImportFile> explorerFiles = new ArrayList<>();

        for (LocalImportFile file : files) {
            if (file.folder() != LocalImportFolder.EXPORTS) continue;

            try {
                JsonNode json = objectMapper.readTree(file.path().toFile());
                String exportKind = normalizedExportKind(json);
                if ("quest_explorer".equals(exportKind)) {
                    explorerFiles.add(file);
                }
            } catch (JacksonException ignored) {
                // Let the normal per-file import path report malformed files.
            }
        }

        return explorerFiles;
    }

    private ImportSummaryDto importQuestExplorerFile(List<LocalImportFile> files) throws IOException {
        if (files.size() != 1) {
            throw new IllegalArgumentException(
                    "Quest startup import requires exactly one quest_explorer file; found " + files.size() + " file(s)."
            );
        }

        JsonNode json = objectMapper.readTree(files.get(0).path().toFile());
        return questExplorerImportAdminFacade.importQuestExplorer(
                objectMapper.treeToValue(json, QuestExplorerImportBatchDto.class)
        );
    }

    private @Nullable ImportSummaryDto importCodexFile(Path file, JsonNode json) throws IOException {
        String exportKind = normalizedExportKind(json);

        if (exportKind != null && DIAGNOSTICS_ONLY_CODEX_EXPORT_KINDS.contains(exportKind)) {
            log.warn(
                    "Local startup import skipped diagnostics-only codex file {} with exportKind='{}'; diagnostics are validation evidence and are not runtime import data.",
                    file.toAbsolutePath().normalize(),
                    exportKind
            );
            return null;
        }

        if (file.getFileName().toString().equalsIgnoreCase("last-export-status.json")) {
            log.warn(
                    "Local startup import skipped diagnostics-only status file {}; diagnostics are validation evidence and are not runtime import data.",
                    file.toAbsolutePath().normalize()
            );
            return null;
        }

        if (json.has("entries")) {
            return codexImportAdminFacade.importCodex(objectMapper.treeToValue(json, CodexImportBatchDto.class));
        }

        log.warn(
                "Local startup import skipped unsupported codex file {} with exportKind='{}'. Codex files must use the generic entries[] import shape.",
                file.toAbsolutePath().normalize(),
                exportKind == null ? "missing" : exportKind
        );
        return null;
    }

    private static boolean shouldLetAdminValidationReport(JsonNode json, String importArrayField, @Nullable String exportKind) {
        return exportKind == null && json.has(importArrayField);
    }

    private static @Nullable String normalizedExportKind(JsonNode json) {
        JsonNode value = json.get("exportKind");
        if (value == null || !value.isString()) {
            return null;
        }
        String text = value.asString().trim().toLowerCase(Locale.ROOT);
        return text.isEmpty() ? null : text;
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

    private JsonNode readJsonOrNull(Path path) {
        try {
            return objectMapper.readTree(path.toFile());
        } catch (Exception ignored) {
            return null;
        }
    }

    private final class ImportHistoryRecorder {

        private static final int MAX_ERROR_MESSAGE_LENGTH = 1000;

        private final ImportHistoryRepository repository;
        private final Path root;
        private final Instant startedAtUtc;
        private final List<ImportFileResult> fileResults = new ArrayList<>();

        private ImportHistoryRecorder(ImportHistoryRepository repository, Path root, Instant startedAtUtc) {
            this.repository = repository;
            this.root = root;
            this.startedAtUtc = startedAtUtc;
        }

        private void recordImported(LocalImportFile file, ImportSummaryDto summary) {
            FileMetadata metadata = metadataFor(file.path());
            fileResults.add(new ImportFileResult(
                    file.folder().label,
                    filename(file.path()),
                    sourcePathHash(file.path()),
                    fileSha256(file.path()),
                    metadata.exportKind(),
                    summary.importKind(),
                    metadata.game(),
                    metadata.gameVersion(),
                    metadata.exporterVersion(),
                    metadata.exportedAtUtc(),
                    metadata.schemaVersion(),
                    ImportFileStatus.IMPORTED,
                    null,
                    null,
                    countsFrom(summary.counts()),
                    summary.durationMs()
            ));
        }

        private void recordSkipped(LocalImportFile file, String skipReason) {
            FileMetadata metadata = metadataFor(file.path());
            fileResults.add(new ImportFileResult(
                    file.folder().label,
                    filename(file.path()),
                    sourcePathHash(file.path()),
                    fileSha256(file.path()),
                    metadata.exportKind(),
                    null,
                    metadata.game(),
                    metadata.gameVersion(),
                    metadata.exporterVersion(),
                    metadata.exportedAtUtc(),
                    metadata.schemaVersion(),
                    ImportFileStatus.SKIPPED,
                    skipReason,
                    null,
                    ImportHistoryCounts.empty(),
                    null
            ));
        }

        private void recordFailed(LocalImportFile file, Exception exception) {
            FileMetadata metadata = metadataFor(file.path());
            fileResults.add(new ImportFileResult(
                    file.folder().label,
                    filename(file.path()),
                    sourcePathHash(file.path()),
                    fileSha256(file.path()),
                    metadata.exportKind(),
                    null,
                    metadata.game(),
                    metadata.gameVersion(),
                    metadata.exporterVersion(),
                    metadata.exportedAtUtc(),
                    metadata.schemaVersion(),
                    ImportFileStatus.FAILED,
                    null,
                    shortErrorMessage(exception),
                    ImportHistoryCounts.empty(),
                    null
            ));
        }

        private void save() {
            try {
                repository.saveImportRun(toRun(Instant.now()));
            } catch (Exception ex) {
                log.warn("Local startup import history recording failed; import results remain applied.", ex);
            }
        }

        private ImportRun toRun(Instant completedAtUtc) {
            int imported = countByStatus(ImportFileStatus.IMPORTED);
            int skipped = countByStatus(ImportFileStatus.SKIPPED);
            int failed = countByStatus(ImportFileStatus.FAILED);
            ImportHistoryCounts aggregateCounts = aggregateCounts();

            return new ImportRun(
                    UUID.randomUUID().toString(),
                    ImportTrigger.LOCAL_STARTUP,
                    runStatus(imported, skipped, failed),
                    startedAtUtc,
                    completedAtUtc,
                    sourceLabel(root),
                    null,
                    fileResults.size(),
                    imported,
                    skipped,
                    failed,
                    aggregateCounts,
                    consistentMetadata(FileMetadata::game),
                    consistentMetadata(FileMetadata::gameVersion),
                    consistentMetadata(FileMetadata::exporterVersion),
                    consistentMetadata(FileMetadata::exportedAtUtc),
                    notes(imported, skipped, failed),
                    fileResults
            );
        }

        private int countByStatus(ImportFileStatus status) {
            return (int) fileResults.stream()
                    .filter(result -> result.status() == status)
                    .count();
        }

        private ImportHistoryCounts aggregateCounts() {
            ImportHistoryCounts counts = ImportHistoryCounts.empty();
            for (ImportFileResult result : fileResults) {
                counts = counts.plus(result.counts());
            }
            return counts;
        }

        private String consistentMetadata(java.util.function.Function<FileMetadata, String> extractor) {
            Set<String> values = new HashSet<>();
            for (ImportFileResult result : fileResults) {
                FileMetadata metadata = new FileMetadata(
                        result.game(),
                        result.gameVersion(),
                        result.exporterVersion(),
                        result.exportedAtUtc(),
                        result.exportKind(),
                        result.schemaVersion()
                );
                String value = clean(extractor.apply(metadata));
                if (value != null) {
                    values.add(value);
                }
            }
            return values.size() == 1 ? values.iterator().next() : null;
        }

        private FileMetadata metadataFor(Path path) {
            JsonNode json = readJsonOrNull(path);
            if (json == null) {
                return FileMetadata.empty();
            }
            return new FileMetadata(
                    textValue(json, "game"),
                    textValue(json, "gameVersion"),
                    textValue(json, "exporterVersion"),
                    textValue(json, "exportedAtUtc"),
                    textValue(json, "exportKind"),
                    textValue(json, "schemaVersion")
            );
        }

        private static ImportHistoryCounts countsFrom(ImportCountsDto counts) {
            if (counts == null) return ImportHistoryCounts.empty();
            return new ImportHistoryCounts(
                    counts.received(),
                    counts.inserted(),
                    counts.updated(),
                    counts.unchanged(),
                    counts.deleted(),
                    counts.failed()
            );
        }

        private static ImportRunStatus runStatus(int imported, int skipped, int failed) {
            if (failed == 0) return ImportRunStatus.SUCCESS;
            return imported > 0 || skipped > 0 ? ImportRunStatus.PARTIAL_SUCCESS : ImportRunStatus.FAILED;
        }

        private static String notes(int imported, int skipped, int failed) {
            if (skipped == 0 && failed == 0) {
                return null;
            }
            return "Imported " + imported + ", skipped " + skipped + ", failed " + failed + ".";
        }

        private static String filename(Path path) {
            Path filename = path.getFileName();
            return filename == null ? "unknown.json" : filename.toString();
        }

        private static String sourceLabel(Path root) {
            Path filename = root.getFileName();
            return filename == null ? root.toString() : filename.toString();
        }

        private static String sourcePathHash(Path path) {
            return sha256(path.toAbsolutePath().normalize().toString().getBytes(StandardCharsets.UTF_8));
        }

        private static @Nullable String fileSha256(Path path) {
            try {
                return sha256(Files.readAllBytes(path));
            } catch (IOException ex) {
                return null;
            }
        }

        private static String sha256(byte[] bytes) {
            try {
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                return toHex(digest.digest(bytes));
            } catch (NoSuchAlgorithmException ex) {
                throw new IllegalStateException("SHA-256 is not available", ex);
            }
        }

        private static String toHex(byte[] bytes) {
            StringBuilder builder = new StringBuilder(bytes.length * 2);
            for (byte value : bytes) {
                builder.append(String.format("%02x", value));
            }
            return builder.toString();
        }

        private static @Nullable String textValue(JsonNode json, String field) {
            JsonNode value = json.get(field);
            if (value == null || !value.isString()) {
                return null;
            }
            return clean(value.asString());
        }

        private static @Nullable String clean(@Nullable String value) {
            if (value == null) return null;
            String trimmed = value.trim();
            return trimmed.isEmpty() ? null : trimmed;
        }

        private static String shortErrorMessage(Exception exception) {
            String message = exception.getMessage();
            String fallback = exception.getClass().getSimpleName();
            String text = message == null || message.isBlank() ? fallback : message.trim();
            if (text.length() <= MAX_ERROR_MESSAGE_LENGTH) {
                return text;
            }
            return text.substring(0, MAX_ERROR_MESSAGE_LENGTH);
        }
    }

    private record FileMetadata(
            @Nullable String game,
            @Nullable String gameVersion,
            @Nullable String exporterVersion,
            @Nullable String exportedAtUtc,
            @Nullable String exportKind,
            @Nullable String schemaVersion
    ) {
        private static FileMetadata empty() {
            return new FileMetadata(null, null, null, null, null, null);
        }
    }

    private enum LocalImportFolder {
        EXPORTS("exports"),
        CODEX("codex");

        private final String label;

        LocalImportFolder(String label) {
            this.label = label;
        }
    }

    private record LocalImportFile(Path path, LocalImportFolder folder) {}

}
