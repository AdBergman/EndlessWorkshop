package ewshop.infrastructure.persistence.adapters;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.domain.model.quest.QuestChronicle;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.QuestChronicleRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Repository
public class QuestChronicleRepositoryAdapter implements QuestChronicleRepository {

    private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {};

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public QuestChronicleRepositoryAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public ImportResult replaceQuestChronicle(QuestChronicle chronicle) {
        ImportResult result = new ImportResult();
        if (chronicle == null || chronicle.entries().isEmpty()) return result;

        int previousCount = countEntries();
        jdbcTemplate.update("DELETE FROM quest_chronicle_requirements");
        jdbcTemplate.update("DELETE FROM quest_chronicle_rewards");
        jdbcTemplate.update("DELETE FROM quest_chronicle_import_batches");

        long batchId = insertBatch(chronicle);
        for (int entryOrder = 0; entryOrder < chronicle.entries().size(); entryOrder++) {
            insertEntry(batchId, entryOrder, chronicle.entries().get(entryOrder));
        }
        result.setDeleted(previousCount);
        for (int i = 0; i < chronicle.entries().size(); i++) {
            result.incrementInserted();
        }
        return result;
    }

    @Override
    public QuestChronicle findQuestChronicle() {
        List<BatchRow> batches = jdbcTemplate.query(
                "SELECT * FROM quest_chronicle_import_batches ORDER BY imported_at DESC, id DESC LIMIT 1",
                (rs, rowNum) -> new BatchRow(
                        rs.getLong("id"),
                        rs.getString("game"),
                        rs.getString("game_version"),
                        rs.getString("exporter_version"),
                        rs.getString("exported_at_utc"),
                        rs.getString("export_kind"),
                        rs.getString("schema_version"),
                        rs.getString("contract_surface")
                )
        );
        if (batches.isEmpty()) {
            return emptyChronicle();
        }

        BatchRow batch = batches.get(0);
        Map<Long, EntryAccumulator> entriesById = loadEntries(batch.id());
        loadAliases(entriesById);
        loadObjectives(entriesById);
        loadPaths(entriesById);
        loadTranscriptBlocks(entriesById);

        List<QuestChronicle.Entry> entries = entriesById.values().stream()
                .sorted(Comparator.comparingInt(EntryAccumulator::entryOrder))
                .map(EntryAccumulator::toEntry)
                .toList();

        return new QuestChronicle(
                batch.game(),
                batch.gameVersion(),
                batch.exporterVersion(),
                batch.exportedAtUtc(),
                batch.exportKind(),
                batch.schemaVersion(),
                batch.contractSurface(),
                entries
        );
    }

    private int countEntries() {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM quest_chronicle_entries", Integer.class);
        return count == null ? 0 : count;
    }

    private static QuestChronicle emptyChronicle() {
        return new QuestChronicle(null, null, null, null, "quest_chronicle", null, null, List.of());
    }

    private long insertBatch(QuestChronicle chronicle) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement("""
                    INSERT INTO quest_chronicle_import_batches
                        (game, game_version, exporter_version, exported_at_utc, export_kind, schema_version,
                         contract_surface, imported_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, chronicle.game());
            ps.setString(2, chronicle.gameVersion());
            ps.setString(3, chronicle.exporterVersion());
            ps.setString(4, chronicle.exportedAtUtc());
            ps.setString(5, chronicle.exportKind());
            ps.setString(6, chronicle.schemaVersion());
            ps.setString(7, chronicle.contractSurface());
            ps.setTimestamp(8, Timestamp.from(Instant.now()));
            return ps;
        }, keyHolder);
        return key(keyHolder);
    }

    private void insertEntry(long batchId, int entryOrder, QuestChronicle.Entry entry) {
        long entryId = insertAndReturnKey("""
                INSERT INTO quest_chronicle_entries
                    (batch_id, entry_order, entry_key, primary_quest_key, source_quest_keys, grouping_key,
                     grouping_reason, title, summary_lines, quest_type, is_mandatory, is_key_narrative_beat,
                     faction_key, quest_line_key, chapter, chapter_label, step, step_label, branch_key,
                     branch_label, next_entry_keys, failure_entry_keys, converges_into_entry_keys)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                batchId, entryOrder, entry.entryKey(), entry.primaryQuestKey(), json(entry.sourceQuestKeys()),
                entry.groupingKey(), entry.groupingReason(), entry.title(), json(entry.summaryLines()),
                entry.questType(), entry.mandatory(), entry.keyNarrativeBeat(), entry.factionKey(),
                entry.questLineKey(), entry.chapter(), entry.chapterLabel(), entry.step(), entry.stepLabel(),
                entry.branchKey(), entry.branchLabel(), json(entry.nextEntryKeys()), json(entry.failureEntryKeys()),
                json(entry.convergesIntoEntryKeys()));

        for (int i = 0; i < entry.sourceQuestKeys().size(); i++) {
            jdbcTemplate.update("""
                    INSERT INTO quest_chronicle_source_aliases (entry_id, alias_order, source_quest_key)
                    VALUES (?, ?, ?)
                    """, entryId, i, entry.sourceQuestKeys().get(i));
        }
        for (int i = 0; i < entry.objectives().size(); i++) {
            insertObjective(entryId, i, entry.objectives().get(i));
        }
        for (int i = 0; i < entry.paths().size(); i++) {
            insertPath(entryId, i, entry.paths().get(i));
        }
        for (int i = 0; i < entry.transcriptBlocks().size(); i++) {
            insertTranscriptBlock(entryId, i, entry.transcriptBlocks().get(i));
        }
    }

    private void insertObjective(long entryId, int objectiveOrder, QuestChronicle.Objective objective) {
        long objectiveId = insertAndReturnKey("""
                INSERT INTO quest_chronicle_objectives
                    (entry_id, objective_order, objective_text, source_quest_key, choice_key, step_index,
                     description_lines, completion_lines, failure_lines, forbidden_lines, selection_lines, reward_lines)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, entryId, objectiveOrder, objective.objectiveText(), objective.sourceQuestKey(),
                objective.choiceKey(), objective.stepIndex(), json(objective.descriptionLines()),
                json(objective.completionLines()), json(objective.failureLines()), json(objective.forbiddenLines()),
                json(objective.selectionLines()), json(objective.rewardLines()));

        insertRequirements("OBJECTIVE_COMPLETION", objectiveId, objective.completionRequirements());
        insertRequirements("OBJECTIVE_FAILURE", objectiveId, objective.failureRequirements());
        insertRequirements("OBJECTIVE_FORBIDDEN", objectiveId, objective.forbiddenRequirements());
        insertRequirements("OBJECTIVE_SELECTION", objectiveId, objective.selectionRequirements());
        insertRewards("OBJECTIVE", objectiveId, objective.rewards());
    }

    private void insertPath(long entryId, int pathOrder, QuestChronicle.Path path) {
        long pathId = insertAndReturnKey("""
                INSERT INTO quest_chronicle_paths
                    (entry_id, path_order, path_key, label, label_source, choice_ordinal, source_quest_key,
                     choice_key, condition_lines, reward_lines, next_entry_keys, failure_entry_keys)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, entryId, pathOrder, path.pathKey(), path.label(), path.labelSource(), path.choiceOrdinal(),
                path.sourceQuestKey(), path.choiceKey(), json(path.conditionLines()), json(path.rewardLines()),
                json(path.nextEntryKeys()), json(path.failureEntryKeys()));
        insertRequirements("PATH", pathId, path.requirements());
        insertRewards("PATH", pathId, path.rewards());
    }

    private void insertRequirements(String ownerType, long ownerId, List<QuestChronicle.Requirement> requirements) {
        for (int i = 0; i < requirements.size(); i++) {
            QuestChronicle.Requirement requirement = requirements.get(i);
            jdbcTemplate.update("""
                    INSERT INTO quest_chronicle_requirements
                        (owner_type, owner_id, requirement_order, requirement_key, kind, phase, polarity,
                         display_text, reference_key, reference_kind, reference_display_name, target_role,
                         target_label, state, required_count, duration_turns)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, ownerType, ownerId, i, requirement.requirementKey(), requirement.kind(), requirement.phase(),
                    requirement.polarity(), requirement.displayText(), requirement.referenceKey(),
                    requirement.referenceKind(), requirement.referenceDisplayName(), requirement.targetRole(),
                    requirement.targetLabel(), requirement.state(), requirement.requiredCount(),
                    requirement.durationTurns());
        }
    }

    private void insertRewards(String ownerType, long ownerId, List<QuestChronicle.Reward> rewards) {
        for (int i = 0; i < rewards.size(); i++) {
            QuestChronicle.Reward reward = rewards.get(i);
            jdbcTemplate.update("""
                    INSERT INTO quest_chronicle_rewards
                        (owner_type, owner_id, reward_order, reward_key, source_reward_keys, kind, display_text,
                         formula_text, amount, asset_kind, asset_key, asset_display_name, target_scope_label)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, ownerType, ownerId, i, reward.rewardKey(), json(reward.sourceRewardKeys()), reward.kind(),
                    reward.displayText(), reward.formulaText(), reward.amount(), reward.assetKind(), reward.assetKey(),
                    reward.assetDisplayName(), reward.targetScopeLabel());
        }
    }

    private void insertTranscriptBlock(long entryId, int blockOrder, QuestChronicle.TranscriptBlock block) {
        long blockId = insertAndReturnKey("""
                INSERT INTO quest_chronicle_transcript_blocks
                    (entry_id, block_order, dialog_key, phase, source_quest_key, choice_key, step_index)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, entryId, blockOrder, block.dialogKey(), block.phase(), block.sourceQuestKey(),
                block.choiceKey(), block.stepIndex());
        for (int i = 0; i < block.lines().size(); i++) {
            QuestChronicle.TranscriptLine line = block.lines().get(i);
            jdbcTemplate.update("""
                    INSERT INTO quest_chronicle_transcript_lines
                        (transcript_block_id, line_order, line_index, role, speaker_label, text)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, blockId, i, line.lineIndex(), line.role(), line.speakerLabel(), line.text());
        }
    }

    private long insertAndReturnKey(String sql, Object... args) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            for (int i = 0; i < args.length; i++) {
                ps.setObject(i + 1, args[i]);
            }
            return ps;
        }, keyHolder);
        return key(keyHolder);
    }

    private Map<Long, EntryAccumulator> loadEntries(long batchId) {
        Map<Long, EntryAccumulator> entries = new LinkedHashMap<>();
        jdbcTemplate.query("""
                SELECT * FROM quest_chronicle_entries
                WHERE batch_id = ?
                ORDER BY entry_order, id
                """, rs -> {
            long id = rs.getLong("id");
            entries.put(id, new EntryAccumulator(
                    id,
                    rs.getInt("entry_order"),
                    rs.getString("entry_key"),
                    rs.getString("primary_quest_key"),
                    readStringList(rs.getString("source_quest_keys")),
                    rs.getString("grouping_key"),
                    rs.getString("grouping_reason"),
                    rs.getString("title"),
                    readStringList(rs.getString("summary_lines")),
                    rs.getString("quest_type"),
                    rs.getBoolean("is_mandatory"),
                    rs.getBoolean("is_key_narrative_beat"),
                    rs.getString("faction_key"),
                    rs.getString("quest_line_key"),
                    (Integer) rs.getObject("chapter"),
                    rs.getString("chapter_label"),
                    (Integer) rs.getObject("step"),
                    rs.getString("step_label"),
                    rs.getString("branch_key"),
                    rs.getString("branch_label"),
                    readStringList(rs.getString("next_entry_keys")),
                    readStringList(rs.getString("failure_entry_keys")),
                    readStringList(rs.getString("converges_into_entry_keys"))
            ));
        }, batchId);
        return entries;
    }

    private void loadAliases(Map<Long, EntryAccumulator> entriesById) {
        if (entriesById.isEmpty()) return;
        jdbcTemplate.query("""
                SELECT * FROM quest_chronicle_source_aliases
                ORDER BY entry_id, alias_order, id
                """, rs -> {
            EntryAccumulator entry = entriesById.get(rs.getLong("entry_id"));
            if (entry != null) entry.sourceQuestKeys().add(rs.getString("source_quest_key"));
        });
    }

    private void loadObjectives(Map<Long, EntryAccumulator> entriesById) {
        if (entriesById.isEmpty()) return;
        Map<Long, ObjectiveAccumulator> objectives = new LinkedHashMap<>();
        jdbcTemplate.query("SELECT * FROM quest_chronicle_objectives ORDER BY entry_id, objective_order, id", rs -> {
            long id = rs.getLong("id");
            ObjectiveAccumulator objective = new ObjectiveAccumulator(
                    id,
                    rs.getLong("entry_id"),
                    rs.getInt("objective_order"),
                    rs.getString("objective_text"),
                    rs.getString("source_quest_key"),
                    rs.getString("choice_key"),
                    (Integer) rs.getObject("step_index"),
                    readStringList(rs.getString("description_lines")),
                    readStringList(rs.getString("completion_lines")),
                    readStringList(rs.getString("failure_lines")),
                    readStringList(rs.getString("forbidden_lines")),
                    readStringList(rs.getString("selection_lines")),
                    readStringList(rs.getString("reward_lines"))
            );
            objectives.put(id, objective);
            EntryAccumulator entry = entriesById.get(objective.entryId());
            if (entry != null) entry.objectives().add(objective);
        });
        loadRequirements(objectives);
        loadRewards(objectives, Map.of());
    }

    private void loadPaths(Map<Long, EntryAccumulator> entriesById) {
        if (entriesById.isEmpty()) return;
        Map<Long, PathAccumulator> paths = new LinkedHashMap<>();
        jdbcTemplate.query("SELECT * FROM quest_chronicle_paths ORDER BY entry_id, path_order, id", rs -> {
            long id = rs.getLong("id");
            PathAccumulator path = new PathAccumulator(
                    id,
                    rs.getLong("entry_id"),
                    rs.getInt("path_order"),
                    rs.getString("path_key"),
                    rs.getString("label"),
                    rs.getString("label_source"),
                    (Integer) rs.getObject("choice_ordinal"),
                    rs.getString("source_quest_key"),
                    rs.getString("choice_key"),
                    readStringList(rs.getString("condition_lines")),
                    readStringList(rs.getString("reward_lines")),
                    readStringList(rs.getString("next_entry_keys")),
                    readStringList(rs.getString("failure_entry_keys"))
            );
            paths.put(id, path);
            EntryAccumulator entry = entriesById.get(path.entryId());
            if (entry != null) entry.paths().add(path);
        });
        loadRequirements(paths);
        loadRewards(Map.of(), paths);
    }

    private void loadRequirements(Map<Long, ? extends RequirementOwner> owners) {
        if (owners.isEmpty()) return;
        jdbcTemplate.query("SELECT * FROM quest_chronicle_requirements ORDER BY owner_type, owner_id, requirement_order, id", rs -> {
            RequirementOwner owner = owners.get(rs.getLong("owner_id"));
            if (owner == null || !owner.acceptsRequirementOwnerType(rs.getString("owner_type"))) return;
            owner.addRequirement(rs.getString("owner_type"), new QuestChronicle.Requirement(
                    rs.getString("requirement_key"),
                    rs.getString("kind"),
                    rs.getString("phase"),
                    rs.getString("polarity"),
                    rs.getString("display_text"),
                    rs.getString("reference_key"),
                    rs.getString("reference_kind"),
                    rs.getString("reference_display_name"),
                    rs.getString("target_role"),
                    rs.getString("target_label"),
                    rs.getString("state"),
                    (Integer) rs.getObject("required_count"),
                    (Integer) rs.getObject("duration_turns")
            ));
        });
    }

    private void loadRewards(Map<Long, ObjectiveAccumulator> objectives, Map<Long, PathAccumulator> paths) {
        jdbcTemplate.query("SELECT * FROM quest_chronicle_rewards ORDER BY owner_type, owner_id, reward_order, id", rs -> {
            String ownerType = rs.getString("owner_type");
            RewardOwner owner = "OBJECTIVE".equals(ownerType)
                    ? objectives.get(rs.getLong("owner_id"))
                    : paths.get(rs.getLong("owner_id"));
            if (owner == null) return;
            owner.rewards().add(new QuestChronicle.Reward(
                    rs.getString("reward_key"),
                    readStringList(rs.getString("source_reward_keys")),
                    rs.getString("kind"),
                    rs.getString("display_text"),
                    rs.getString("formula_text"),
                    (Integer) rs.getObject("amount"),
                    rs.getString("asset_kind"),
                    rs.getString("asset_key"),
                    rs.getString("asset_display_name"),
                    rs.getString("target_scope_label")
            ));
        });
    }

    private void loadTranscriptBlocks(Map<Long, EntryAccumulator> entriesById) {
        if (entriesById.isEmpty()) return;
        Map<Long, TranscriptBlockAccumulator> blocks = new LinkedHashMap<>();
        jdbcTemplate.query("SELECT * FROM quest_chronicle_transcript_blocks ORDER BY entry_id, block_order, id", rs -> {
            long id = rs.getLong("id");
            TranscriptBlockAccumulator block = new TranscriptBlockAccumulator(
                    id,
                    rs.getLong("entry_id"),
                    rs.getInt("block_order"),
                    rs.getString("dialog_key"),
                    rs.getString("phase"),
                    rs.getString("source_quest_key"),
                    rs.getString("choice_key"),
                    (Integer) rs.getObject("step_index")
            );
            blocks.put(id, block);
            EntryAccumulator entry = entriesById.get(block.entryId());
            if (entry != null) entry.transcriptBlocks().add(block);
        });
        jdbcTemplate.query("SELECT * FROM quest_chronicle_transcript_lines ORDER BY transcript_block_id, line_order, id", rs -> {
            TranscriptBlockAccumulator block = blocks.get(rs.getLong("transcript_block_id"));
            if (block != null) {
                block.lines().add(new QuestChronicle.TranscriptLine(
                        (Integer) rs.getObject("line_index"),
                        rs.getString("role"),
                        rs.getString("speaker_label"),
                        rs.getString("text")
                ));
            }
        });
    }

    private String json(Object value) {
        if (value == null) return null;
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new IllegalArgumentException("Unable to encode quest chronicle JSON value", ex);
        }
    }

    private List<String> readStringList(String value) {
        return read(value, STRING_LIST, List.of());
    }

    private <T> T read(String value, TypeReference<T> type, T fallback) {
        if (value == null || value.isBlank()) return fallback;
        try {
            return objectMapper.readValue(value, type);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Unable to decode quest chronicle JSON value", ex);
        }
    }

    private long key(KeyHolder keyHolder) {
        Number key = keyHolder.getKey();
        if (key == null) throw new IllegalStateException("Insert did not return generated key");
        return key.longValue();
    }

    private record BatchRow(
            long id,
            String game,
            String gameVersion,
            String exporterVersion,
            String exportedAtUtc,
            String exportKind,
            String schemaVersion,
            String contractSurface
    ) {}

    private interface RewardOwner {
        List<QuestChronicle.Reward> rewards();
    }

    private interface RequirementOwner {
        boolean acceptsRequirementOwnerType(String ownerType);
        void addRequirement(String ownerType, QuestChronicle.Requirement requirement);
    }

    private record EntryAccumulator(
            long id,
            int entryOrder,
            String entryKey,
            String primaryQuestKey,
            List<String> sourceQuestKeys,
            String groupingKey,
            String groupingReason,
            String title,
            List<String> summaryLines,
            String questType,
            boolean mandatory,
            boolean keyNarrativeBeat,
            String factionKey,
            String questLineKey,
            Integer chapter,
            String chapterLabel,
            Integer step,
            String stepLabel,
            String branchKey,
            String branchLabel,
            List<String> nextEntryKeys,
            List<String> failureEntryKeys,
            List<String> convergesIntoEntryKeys,
            List<ObjectiveAccumulator> objectives,
            List<PathAccumulator> paths,
            List<TranscriptBlockAccumulator> transcriptBlocks
    ) {
        EntryAccumulator(
                long id,
                int entryOrder,
                String entryKey,
                String primaryQuestKey,
                List<String> sourceQuestKeys,
                String groupingKey,
                String groupingReason,
                String title,
                List<String> summaryLines,
                String questType,
                boolean mandatory,
                boolean keyNarrativeBeat,
                String factionKey,
                String questLineKey,
                Integer chapter,
                String chapterLabel,
                Integer step,
                String stepLabel,
                String branchKey,
                String branchLabel,
                List<String> nextEntryKeys,
                List<String> failureEntryKeys,
                List<String> convergesIntoEntryKeys
        ) {
            this(id, entryOrder, entryKey, primaryQuestKey, new ArrayList<>(sourceQuestKeys), groupingKey,
                    groupingReason, title, new ArrayList<>(summaryLines), questType, mandatory, keyNarrativeBeat,
                    factionKey, questLineKey, chapter, chapterLabel, step, stepLabel, branchKey, branchLabel,
                    new ArrayList<>(nextEntryKeys), new ArrayList<>(failureEntryKeys),
                    new ArrayList<>(convergesIntoEntryKeys), new ArrayList<>(), new ArrayList<>(),
                    new ArrayList<>());
        }

        QuestChronicle.Entry toEntry() {
            List<String> aliases = sourceQuestKeys.stream()
                    .filter(Objects::nonNull)
                    .filter(value -> !value.isBlank())
                    .distinct()
                    .toList();
            return new QuestChronicle.Entry(
                    entryKey, primaryQuestKey, aliases, groupingKey, groupingReason, title, summaryLines, questType,
                    mandatory, keyNarrativeBeat, factionKey, questLineKey, chapter, chapterLabel, step, stepLabel,
                    branchKey, branchLabel, nextEntryKeys, failureEntryKeys, convergesIntoEntryKeys,
                    objectives.stream().sorted(Comparator.comparingInt(ObjectiveAccumulator::objectiveOrder))
                            .map(ObjectiveAccumulator::toObjective).toList(),
                    paths.stream().sorted(Comparator.comparingInt(PathAccumulator::pathOrder))
                            .map(PathAccumulator::toPath).toList(),
                    transcriptBlocks.stream().sorted(Comparator.comparingInt(TranscriptBlockAccumulator::blockOrder))
                            .map(TranscriptBlockAccumulator::toBlock).toList()
            );
        }
    }

    private record ObjectiveAccumulator(
            long id,
            long entryId,
            int objectiveOrder,
            String objectiveText,
            String sourceQuestKey,
            String choiceKey,
            Integer stepIndex,
            List<String> descriptionLines,
            List<String> completionLines,
            List<String> failureLines,
            List<String> forbiddenLines,
            List<String> selectionLines,
            List<String> rewardLines,
            List<QuestChronicle.Requirement> completionRequirements,
            List<QuestChronicle.Requirement> failureRequirements,
            List<QuestChronicle.Requirement> forbiddenRequirements,
            List<QuestChronicle.Requirement> selectionRequirements,
            List<QuestChronicle.Reward> rewards
    ) implements RequirementOwner, RewardOwner {
        ObjectiveAccumulator(
                long id,
                long entryId,
                int objectiveOrder,
                String objectiveText,
                String sourceQuestKey,
                String choiceKey,
                Integer stepIndex,
                List<String> descriptionLines,
                List<String> completionLines,
                List<String> failureLines,
                List<String> forbiddenLines,
                List<String> selectionLines,
                List<String> rewardLines
        ) {
            this(id, entryId, objectiveOrder, objectiveText, sourceQuestKey, choiceKey, stepIndex,
                    new ArrayList<>(descriptionLines), new ArrayList<>(completionLines), new ArrayList<>(failureLines),
                    new ArrayList<>(forbiddenLines), new ArrayList<>(selectionLines), new ArrayList<>(rewardLines),
                    new ArrayList<>(), new ArrayList<>(), new ArrayList<>(), new ArrayList<>(), new ArrayList<>());
        }

        @Override
        public boolean acceptsRequirementOwnerType(String ownerType) {
            return ownerType != null && ownerType.startsWith("OBJECTIVE_");
        }

        @Override
        public void addRequirement(String ownerType, QuestChronicle.Requirement requirement) {
            switch (ownerType) {
                case "OBJECTIVE_COMPLETION" -> completionRequirements.add(requirement);
                case "OBJECTIVE_FAILURE" -> failureRequirements.add(requirement);
                case "OBJECTIVE_FORBIDDEN" -> forbiddenRequirements.add(requirement);
                case "OBJECTIVE_SELECTION" -> selectionRequirements.add(requirement);
                default -> {}
            }
        }

        QuestChronicle.Objective toObjective() {
            return new QuestChronicle.Objective(objectiveText, sourceQuestKey, choiceKey, stepIndex,
                    descriptionLines, completionLines, failureLines, forbiddenLines, selectionLines, rewardLines,
                    completionRequirements, failureRequirements, forbiddenRequirements, selectionRequirements, rewards);
        }
    }

    private record PathAccumulator(
            long id,
            long entryId,
            int pathOrder,
            String pathKey,
            String label,
            String labelSource,
            Integer choiceOrdinal,
            String sourceQuestKey,
            String choiceKey,
            List<String> conditionLines,
            List<String> rewardLines,
            List<String> nextEntryKeys,
            List<String> failureEntryKeys,
            List<QuestChronicle.Requirement> requirements,
            List<QuestChronicle.Reward> rewards
    ) implements RequirementOwner, RewardOwner {
        PathAccumulator(
                long id,
                long entryId,
                int pathOrder,
                String pathKey,
                String label,
                String labelSource,
                Integer choiceOrdinal,
                String sourceQuestKey,
                String choiceKey,
                List<String> conditionLines,
                List<String> rewardLines,
                List<String> nextEntryKeys,
                List<String> failureEntryKeys
        ) {
            this(id, entryId, pathOrder, pathKey, label, labelSource, choiceOrdinal, sourceQuestKey, choiceKey,
                    new ArrayList<>(conditionLines), new ArrayList<>(rewardLines), new ArrayList<>(nextEntryKeys),
                    new ArrayList<>(failureEntryKeys), new ArrayList<>(), new ArrayList<>());
        }

        @Override
        public boolean acceptsRequirementOwnerType(String ownerType) {
            return "PATH".equals(ownerType);
        }

        @Override
        public void addRequirement(String ownerType, QuestChronicle.Requirement requirement) {
            requirements.add(requirement);
        }

        QuestChronicle.Path toPath() {
            return new QuestChronicle.Path(pathKey, label, labelSource, choiceOrdinal, sourceQuestKey, choiceKey,
                    conditionLines, rewardLines, nextEntryKeys, failureEntryKeys, requirements, rewards);
        }
    }

    private record TranscriptBlockAccumulator(
            long id,
            long entryId,
            int blockOrder,
            String dialogKey,
            String phase,
            String sourceQuestKey,
            String choiceKey,
            Integer stepIndex,
            List<QuestChronicle.TranscriptLine> lines
    ) {
        TranscriptBlockAccumulator(
                long id,
                long entryId,
                int blockOrder,
                String dialogKey,
                String phase,
                String sourceQuestKey,
                String choiceKey,
                Integer stepIndex
        ) {
            this(id, entryId, blockOrder, dialogKey, phase, sourceQuestKey, choiceKey, stepIndex,
                    new ArrayList<>());
        }

        QuestChronicle.TranscriptBlock toBlock() {
            return new QuestChronicle.TranscriptBlock(dialogKey, phase, sourceQuestKey, choiceKey, stepIndex,
                    lines);
        }
    }
}
