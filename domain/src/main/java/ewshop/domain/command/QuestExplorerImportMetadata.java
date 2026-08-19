package ewshop.domain.command;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public record QuestExplorerImportMetadata(
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String exportKind,
        String schemaVersion,
        Map<String, Object> chapterRootEvidence
) {
    public QuestExplorerImportMetadata(
            String gameVersion,
            String exporterVersion,
            String exportedAtUtc,
            String exportKind,
            String schemaVersion
    ) {
        this(gameVersion, exporterVersion, exportedAtUtc, exportKind, schemaVersion, Map.of());
    }

    public QuestExplorerImportMetadata {
        chapterRootEvidence = chapterRootEvidence == null
                ? Map.of()
                : Collections.unmodifiableMap(new LinkedHashMap<>(chapterRootEvidence));
    }
}
