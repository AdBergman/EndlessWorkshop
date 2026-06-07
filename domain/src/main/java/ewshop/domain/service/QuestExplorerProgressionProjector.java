package ewshop.domain.service;

import ewshop.domain.model.quest.QuestExplorer;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class QuestExplorerProgressionProjector {

    private static final Log log = LogFactory.getLog(QuestExplorerProgressionProjector.class);
    private static final String STEP_KIND_REAL_ENTRY_BACKED = "real_entry_backed";
    private static final String STEP_KIND_PARSED_ENTRY_BACKED = "parsed_entry_backed";
    private static final String STEP_KIND_VIRTUAL_ALIAS_EXPANDED = "virtual_alias_expanded";
    private static final String STEP_KIND_BRANCH_VARIANT_ONLY = "branch_variant_only";
    private static final String VARIANT_KIND_ENTRY = "entry";
    private static final String VARIANT_KIND_BRANCH_VARIANT = "branch_variant";
    private static final Pattern TRAILING_NUMERIC_VARIANT = Pattern.compile("^(.*?)(\\d+)$");
    private static final Pattern TUTORIAL_SCENARIO = Pattern.compile(
            "^TutorialScenario_Quest_([^_]+)_Chapter0*0.*",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern CHAPTER_STEP_KEY = Pattern.compile(
            ".*_Chapter(\\d+)[A-Za-z]?_Step(\\d+).*",
            Pattern.CASE_INSENSITIVE
    );

    private QuestExplorerProgressionProjector() {}

    public static QuestExplorer.Progression project(QuestExplorer explorer) {
        List<QuestExplorer.Entry> entries = safeList(explorer == null ? null : explorer.entries());
        Map<String, QuestExplorer.Entry> entriesByIdentity = entriesByIdentity(entries);
        Set<String> rawQuestLineKeys = navigationValues(entries, NavigationValue.QUESTLINE);
        Set<String> rawFactionKeys = navigationValues(entries, NavigationValue.FACTION);
        ProjectionDiagnostics diagnostics = new ProjectionDiagnostics(entries.size());
        Map<String, FamilyContext> contextsByEntryKey = new HashMap<>();
        Map<ProgressionGroupKey, QuestlineBuilder> builders = new HashMap<>();

        for (QuestExplorer.Entry entry : entries) {
            FamilyContext context = familyContext(entry, rawQuestLineKeys, rawFactionKeys, diagnostics);
            if (context != null) {
                contextsByEntryKey.put(entry.entryKey(), context);
                diagnostics.addQuestlineFamily(context.groupKey());
            }
        }

        for (QuestExplorer.Entry entry : entries) {
            FamilyContext context = contextsByEntryKey.get(entry.entryKey());
            if (context == null) continue;

            List<ProjectedPosition> positions = projectedPositions(
                    entry,
                    context,
                    entriesByIdentity,
                    contextsByEntryKey,
                    diagnostics
            );
            if (positions.isEmpty()) continue;

            QuestlineBuilder builder = builders.computeIfAbsent(context.groupKey(), ignored -> new QuestlineBuilder(context.groupKey()));
            for (ProjectedPosition position : positions) {
                builder.add(entry, context, position);
            }
        }

        List<QuestExplorer.Questline> questlines = builders.values().stream()
                .sorted(Comparator.comparingInt(QuestlineBuilder::minSequenceIndex)
                        .thenComparing(builder -> builder.groupKey.questLineFamilyKey(), nullsLastString())
                        .thenComparing(builder -> builder.groupKey.factionFamilyKey(), nullsLastString()))
                .map(QuestlineBuilder::build)
                .toList();

        List<QuestExplorer.NumericQuestlineVariantCollapse> collapses = diagnostics.numericCollapses();
        collapses.forEach(collapse -> log.info(
                "Quest explorer progression collapsed numeric questline variant " +
                        collapse.sourceQuestLineKey() + "/" + collapse.sourceFactionKey() +
                        " into " + collapse.targetQuestLineFamilyKey() + "/" + collapse.targetFactionFamilyKey() +
                        " for " + collapse.entryCount() + " entries: " + collapse.reason()
        ));
        diagnostics.tutorialEntriesPlaced.forEach(message ->
                log.info("Quest explorer progression placed tutorial entry " + message)
        );

        return new QuestExplorer.Progression(questlines, diagnostics.toSummary(questlines));
    }

    private static FamilyContext familyContext(
            QuestExplorer.Entry entry,
            Set<String> rawQuestLineKeys,
            Set<String> rawFactionKeys,
            ProjectionDiagnostics diagnostics
    ) {
        QuestExplorer.Navigation navigation = entry.navigation();
        String sourceQuestLineKey = clean(navigation == null ? null : navigation.questLineKey());
        String sourceFactionKey = clean(navigation == null ? null : navigation.factionKey());
        TutorialPlacement tutorialPlacement = null;

        if (sourceQuestLineKey == null) {
            tutorialPlacement = tutorialPlacement(entry, rawQuestLineKeys, rawFactionKeys).orElse(null);
            if (tutorialPlacement == null) return null;
            sourceQuestLineKey = tutorialPlacement.questLineKey();
            sourceFactionKey = tutorialPlacement.factionKey();
        }

        CollapseDecision collapse = collapseDecision(sourceQuestLineKey, sourceFactionKey, rawQuestLineKeys, rawFactionKeys);
        if (collapse.collapsed()) {
            diagnostics.addCollapse(collapse);
        }

        return new FamilyContext(
                sourceQuestLineKey,
                sourceFactionKey,
                collapse.questLineFamilyKey(),
                collapse.factionFamilyKey(),
                tutorialPlacement
        );
    }

    private static Optional<TutorialPlacement> tutorialPlacement(
            QuestExplorer.Entry entry,
            Set<String> rawQuestLineKeys,
            Set<String> rawFactionKeys
    ) {
        Matcher matcher = TUTORIAL_SCENARIO.matcher(nullToEmpty(entry.entryKey()));
        if (!matcher.matches()) return Optional.empty();

        String factionSuffix = matcher.group(1);
        String questLineKey = "FactionQuest_" + factionSuffix;
        if (!rawQuestLineKeys.contains(questLineKey)) return Optional.empty();

        String factionKey = "Faction_" + factionSuffix;
        if (!rawFactionKeys.contains(factionKey)) {
            factionKey = null;
        }

        return Optional.of(new TutorialPlacement(questLineKey, factionKey));
    }

    private static CollapseDecision collapseDecision(
            String sourceQuestLineKey,
            String sourceFactionKey,
            Set<String> rawQuestLineKeys,
            Set<String> rawFactionKeys
    ) {
        NumericSuffix questLineSuffix = numericSuffix(sourceQuestLineKey);
        if (questLineSuffix == null || !rawQuestLineKeys.contains(questLineSuffix.base())) {
            return CollapseDecision.unchanged(sourceQuestLineKey, sourceFactionKey);
        }

        NumericSuffix factionSuffix = numericSuffix(sourceFactionKey);
        if (factionSuffix == null ||
                !Objects.equals(questLineSuffix.suffix(), factionSuffix.suffix()) ||
                !rawFactionKeys.contains(factionSuffix.base())) {
            return CollapseDecision.unchanged(sourceQuestLineKey, sourceFactionKey);
        }

        return new CollapseDecision(
                sourceQuestLineKey,
                sourceFactionKey,
                questLineSuffix.base(),
                factionSuffix.base(),
                true
        );
    }

    private static NumericSuffix numericSuffix(String value) {
        if (value == null) return null;
        Matcher matcher = TRAILING_NUMERIC_VARIANT.matcher(value);
        if (!matcher.matches()) return null;
        return new NumericSuffix(matcher.group(1), matcher.group(2));
    }

    private static List<ProjectedPosition> projectedPositions(
            QuestExplorer.Entry entry,
            FamilyContext context,
            Map<String, QuestExplorer.Entry> entriesByIdentity,
            Map<String, FamilyContext> contextsByEntryKey,
            ProjectionDiagnostics diagnostics
    ) {
        QuestExplorer.Navigation navigation = entry.navigation();
        if (navigation == null) {
            diagnostics.addMissingChapterOrStep(entry.entryKey());
            return List.of();
        }

        if (context.tutorialPlacement() != null) {
            ProjectedPosition position = new ProjectedPosition(
                    0,
                    0,
                    "Tutorial",
                    firstNonNull(navigation.stepOrder(), 0),
                    PositionKind.REAL_ENTRY,
                    entry.entryKey()
            );
            diagnostics.addTutorialEntry(entry.entryKey() + " -> " + context.questLineFamilyKey() + " before Chapter 1");
            return List.of(position);
        }

        boolean ownPositionMissing = navigation.chapterOrder() == null || navigation.stepOrder() == null;
        if (ownPositionMissing) {
            diagnostics.addMissingChapterOrStep(entry.entryKey());
        }

        QuestExplorer.Entry parent = branchGroupParent(entry, entriesByIdentity);
        boolean branchOrderWithoutParent = navigation.branchOrder() != null && clean(navigation.branchGroupKey()) == null;
        if (branchOrderWithoutParent) {
            diagnostics.addSuspiciousBranchVariant(entry.entryKey() + " has branchOrder without branchGroupKey");
        }

        boolean shouldUseBranchGroupPosition = parent != null &&
                !Objects.equals(parent.entryKey(), entry.entryKey()) &&
                sameProgressionGroup(context, contextsByEntryKey.get(parent.entryKey())) &&
                (navigation.branchOrder() != null || ownPositionMissing);

        if (shouldUseBranchGroupPosition) {
            ProjectedPosition branchGroupPosition = branchGroupPosition(entry, parent);
            if (branchGroupPosition != null) {
                return List.of(branchGroupPosition);
            }
            diagnostics.addSuspiciousBranchVariant(entry.entryKey() + " could not inherit parent step from " + navigation.branchGroupKey());
        } else if (clean(navigation.branchGroupKey()) != null && parent == null) {
            diagnostics.addSuspiciousBranchVariant(entry.entryKey() + " references missing branchGroupKey " + navigation.branchGroupKey());
            return List.of();
        }

        if (ownPositionMissing) {
            ProjectedPosition parsedEntryPosition = parsedEntryKeyPosition(entry);
            return parsedEntryPosition == null ? List.of() : List.of(parsedEntryPosition);
        }

        ProjectedPosition ownPosition = new ProjectedPosition(
                navigation.chapterOrder(),
                firstNonNull(navigation.chapter(), navigation.chapterOrder()),
                firstNonNull(clean(navigation.chapterLabel()), "Chapter " + navigation.chapterOrder()),
                navigation.stepOrder(),
                PositionKind.REAL_ENTRY,
                entry.entryKey()
        );
        return expandedAliasPositions(entry, context, ownPosition);
    }

    private static ProjectedPosition branchGroupPosition(QuestExplorer.Entry entry, QuestExplorer.Entry parent) {
        QuestExplorer.Navigation navigation = entry.navigation();
        QuestExplorer.Navigation parentNavigation = parent.navigation();
        ChapterStepKey parsedBranchGroupKey = parseChapterStepKey(navigation.branchGroupKey());
        if (parsedBranchGroupKey != null) {
            return new ProjectedPosition(
                    parsedBranchGroupKey.chapterOrder(),
                    parsedBranchGroupKey.chapterOrder(),
                    firstNonNull(
                            clean(parentNavigation == null ? null : parentNavigation.chapterLabel()),
                            "Chapter " + parsedBranchGroupKey.chapterOrder()
                    ),
                    parsedBranchGroupKey.stepOrder(),
                    PositionKind.BRANCH_VARIANT,
                    navigation.branchGroupKey()
            );
        }
        if (parentNavigation == null || parentNavigation.chapterOrder() == null || parentNavigation.stepOrder() == null) {
            return null;
        }
        return new ProjectedPosition(
                parentNavigation.chapterOrder(),
                firstNonNull(parentNavigation.chapter(), parentNavigation.chapterOrder()),
                firstNonNull(clean(parentNavigation.chapterLabel()), "Chapter " + parentNavigation.chapterOrder()),
                parentNavigation.stepOrder(),
                PositionKind.BRANCH_VARIANT,
                navigation.branchGroupKey()
        );
    }

    private static ProjectedPosition parsedEntryKeyPosition(QuestExplorer.Entry entry) {
        ChapterStepKey parsedEntryKey = parseChapterStepKey(entry.entryKey());
        if (parsedEntryKey == null) return null;
        Integer chapterOrder = parsedEntryKey.chapterOrder();
        return new ProjectedPosition(
                chapterOrder,
                chapterOrder,
                chapterOrder != null && chapterOrder == 0 ? "Tutorial" : "Chapter " + chapterOrder,
                parsedEntryKey.stepOrder(),
                PositionKind.PARSED_ENTRY_KEY,
                entry.entryKey()
        );
    }

    private static List<ProjectedPosition> expandedAliasPositions(
            QuestExplorer.Entry entry,
            FamilyContext context,
            ProjectedPosition ownPosition
    ) {
        Map<Integer, ProjectedPosition> byStepOrder = new TreeMap<>();
        byStepOrder.put(ownPosition.stepOrder(), ownPosition);

        for (String alias : safeList(entry.aliases())) {
            if (!belongsToSourceQuestline(alias, context)) continue;
            ChapterStepKey parsedAlias = parseChapterStepKey(alias);
            if (parsedAlias == null || !Objects.equals(parsedAlias.chapterOrder(), ownPosition.chapterOrder())) continue;
            byStepOrder.putIfAbsent(parsedAlias.stepOrder(), new ProjectedPosition(
                    ownPosition.chapterOrder(),
                    ownPosition.chapterNumber(),
                    ownPosition.chapterTitle(),
                    parsedAlias.stepOrder(),
                    PositionKind.ALIAS_EXPANDED,
                    alias
            ));
        }

        return List.copyOf(byStepOrder.values());
    }

    private static boolean belongsToSourceQuestline(String key, FamilyContext context) {
        String cleanKey = clean(key);
        if (cleanKey == null) return false;
        return cleanKey.startsWith(context.sourceQuestLineKey() + "_") ||
                cleanKey.startsWith(context.questLineFamilyKey() + "_");
    }

    private static ChapterStepKey parseChapterStepKey(String value) {
        Matcher matcher = CHAPTER_STEP_KEY.matcher(nullToEmpty(value));
        if (!matcher.matches()) return null;
        int chapterOrder = Integer.parseInt(matcher.group(1));
        int oneBasedStep = Integer.parseInt(matcher.group(2));
        return new ChapterStepKey(chapterOrder, Math.max(0, oneBasedStep - 1));
    }

    private static QuestExplorer.Entry branchGroupParent(
            QuestExplorer.Entry entry,
            Map<String, QuestExplorer.Entry> entriesByIdentity
    ) {
        String branchGroupKey = clean(entry.navigation() == null ? null : entry.navigation().branchGroupKey());
        if (branchGroupKey == null) return null;
        return entriesByIdentity.get(branchGroupKey);
    }

    private static boolean sameProgressionGroup(FamilyContext left, FamilyContext right) {
        return left != null && right != null && Objects.equals(left.groupKey(), right.groupKey());
    }

    private static Map<String, QuestExplorer.Entry> entriesByIdentity(List<QuestExplorer.Entry> entries) {
        Map<String, QuestExplorer.Entry> byIdentity = new LinkedHashMap<>();
        for (QuestExplorer.Entry entry : entries) {
            putIdentity(byIdentity, entry.entryKey(), entry);
            safeList(entry.aliases()).forEach(alias -> putIdentity(byIdentity, alias, entry));
        }
        return byIdentity;
    }

    private static void putIdentity(Map<String, QuestExplorer.Entry> byIdentity, String key, QuestExplorer.Entry entry) {
        String cleanKey = clean(key);
        if (cleanKey != null) {
            byIdentity.putIfAbsent(cleanKey, entry);
        }
    }

    private static Set<String> navigationValues(List<QuestExplorer.Entry> entries, NavigationValue value) {
        Set<String> values = new HashSet<>();
        for (QuestExplorer.Entry entry : entries) {
            QuestExplorer.Navigation navigation = entry.navigation();
            if (navigation == null) continue;
            String rawValue = value == NavigationValue.QUESTLINE ? navigation.questLineKey() : navigation.factionKey();
            String cleanValue = clean(rawValue);
            if (cleanValue != null) values.add(cleanValue);
        }
        return values;
    }

    private static QuestExplorer.Variant variant(QuestExplorer.Entry entry) {
        QuestExplorer.Navigation navigation = entry.navigation();
        return new QuestExplorer.Variant(
                entry.entryKey(),
                entry.title(),
                isBranchVariant(entry) ? VARIANT_KIND_BRANCH_VARIANT : VARIANT_KIND_ENTRY,
                navigation.branchGroupKey(),
                navigation.branchLabel(),
                navigation.branchOrder(),
                navigation.previousEntryKeys(),
                distinct(concat(navigation.nextEntryKeys(), safeList(entry.branches()).stream()
                        .flatMap(branch -> branch.nextEntryKeys().stream())
                        .toList())),
                distinct(concat(navigation.failureEntryKeys(), safeList(entry.branches()).stream()
                        .flatMap(branch -> branch.failureEntryKeys().stream())
                        .toList())),
                distinct(concat(navigation.convergesIntoEntryKeys(), safeList(entry.branches()).stream()
                        .flatMap(branch -> branch.convergesIntoEntryKeys().stream())
                        .toList()))
        );
    }

    private static List<String> concat(List<String> first, List<String> second) {
        List<String> values = new ArrayList<>();
        values.addAll(safeList(first));
        values.addAll(safeList(second));
        return values;
    }

    private static List<String> distinct(List<String> values) {
        return safeList(values).stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }

    private static Comparator<QuestExplorer.Entry> canonicalEntryComparator() {
        return Comparator.comparing((QuestExplorer.Entry entry) -> isBranchVariant(entry))
                .thenComparingInt(entry -> entry.navigation().sequenceIndex())
                .thenComparing(QuestExplorer.Entry::entryKey, nullsLastString());
    }

    private static Comparator<QuestExplorer.Entry> variantComparator() {
        return (left, right) -> {
            Integer leftBranchOrder = left.navigation().branchOrder();
            Integer rightBranchOrder = right.navigation().branchOrder();
            if (leftBranchOrder != null && rightBranchOrder != null) {
                int branchDelta = leftBranchOrder.compareTo(rightBranchOrder);
                if (branchDelta != 0) return branchDelta;
            }
            int sequenceDelta = Integer.compare(left.navigation().sequenceIndex(), right.navigation().sequenceIndex());
            if (sequenceDelta != 0) return sequenceDelta;
            return nullsLastString().compare(left.entryKey(), right.entryKey());
        };
    }

    private static boolean isBranchVariant(QuestExplorer.Entry entry) {
        QuestExplorer.Navigation navigation = entry.navigation();
        return navigation != null && navigation.branchOrder() != null;
    }

    private static Comparator<String> nullsLastString() {
        return Comparator.nullsLast(String::compareTo);
    }

    private static <T> T firstNonNull(T first, T fallback) {
        return first == null ? fallback : first;
    }

    private static String clean(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private static <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : values;
    }

    private enum NavigationValue {
        QUESTLINE,
        FACTION
    }

    private enum PositionKind {
        REAL_ENTRY,
        ALIAS_EXPANDED,
        BRANCH_VARIANT,
        PARSED_ENTRY_KEY
    }

    private record NumericSuffix(String base, String suffix) {}

    private record TutorialPlacement(String questLineKey, String factionKey) {}

    private record ChapterStepKey(Integer chapterOrder, Integer stepOrder) {}

    private record ProgressionGroupKey(String questLineFamilyKey, String factionFamilyKey) {}

    private record FamilyContext(
            String sourceQuestLineKey,
            String sourceFactionKey,
            String questLineFamilyKey,
            String factionFamilyKey,
            TutorialPlacement tutorialPlacement
    ) {
        ProgressionGroupKey groupKey() {
            return new ProgressionGroupKey(questLineFamilyKey, factionFamilyKey);
        }
    }

    private record CollapseDecision(
            String sourceQuestLineKey,
            String sourceFactionKey,
            String questLineFamilyKey,
            String factionFamilyKey,
            boolean collapsed
    ) {
        static CollapseDecision unchanged(String sourceQuestLineKey, String sourceFactionKey) {
            return new CollapseDecision(sourceQuestLineKey, sourceFactionKey, sourceQuestLineKey, sourceFactionKey, false);
        }
    }

    private record ProjectedPosition(
            Integer chapterOrder,
            Integer chapterNumber,
            String chapterTitle,
            Integer stepOrder,
            PositionKind positionKind,
            String sourceIdentityKey
    ) {}

    private record StepProjection(QuestExplorer.Entry entry, ProjectedPosition position) {}

    private static final class QuestlineBuilder {
        private final ProgressionGroupKey groupKey;
        private final TreeSet<String> sourceQuestLineKeys = new TreeSet<>();
        private final TreeSet<String> sourceFactionKeys = new TreeSet<>();
        private final TreeMap<Integer, ChapterBuilder> chapters = new TreeMap<>();
        private final List<QuestExplorer.Entry> entries = new ArrayList<>();
        private int minSequenceIndex = Integer.MAX_VALUE;

        private QuestlineBuilder(ProgressionGroupKey groupKey) {
            this.groupKey = groupKey;
        }

        private void add(QuestExplorer.Entry entry, FamilyContext context, ProjectedPosition position) {
            entries.add(entry);
            minSequenceIndex = Math.min(minSequenceIndex, entry.navigation().sequenceIndex());
            addClean(sourceQuestLineKeys, context.sourceQuestLineKey());
            addClean(sourceFactionKeys, context.sourceFactionKey());
            chapters.computeIfAbsent(position.chapterOrder(), order -> new ChapterBuilder(position))
                    .add(entry, position);
        }

        private int minSequenceIndex() {
            return minSequenceIndex;
        }

        private QuestExplorer.Questline build() {
            QuestExplorer.Entry representative = entries.stream()
                    .min(Comparator.comparingInt(entry -> entry.navigation().sequenceIndex()))
                    .orElse(null);
            QuestExplorer.Navigation navigation = representative == null ? null : representative.navigation();
            return new QuestExplorer.Questline(
                    groupKey.questLineFamilyKey(),
                    groupKey.questLineFamilyKey(),
                    navigation == null ? null : navigation.questLineName(),
                    groupKey.factionFamilyKey(),
                    groupKey.factionFamilyKey(),
                    navigation == null ? null : navigation.factionName(),
                    List.copyOf(sourceQuestLineKeys),
                    List.copyOf(sourceFactionKeys),
                    chapters.values().stream().map(chapter -> chapter.build(groupKey)).toList()
            );
        }
    }

    private static final class ChapterBuilder {
        private final Integer chapterOrder;
        private final Integer chapterNumber;
        private final String chapterTitle;
        private final TreeMap<Integer, StepBuilder> steps = new TreeMap<>();

        private ChapterBuilder(ProjectedPosition position) {
            this.chapterOrder = position.chapterOrder();
            this.chapterNumber = position.chapterNumber();
            this.chapterTitle = position.chapterTitle();
        }

        private void add(QuestExplorer.Entry entry, ProjectedPosition position) {
            steps.computeIfAbsent(position.stepOrder(), StepBuilder::new).add(entry, position);
        }

        private QuestExplorer.Chapter build(ProgressionGroupKey groupKey) {
            return new QuestExplorer.Chapter(
                    chapterNumber,
                    chapterOrder,
                    chapterTitle,
                    steps.values().stream().map(step -> step.build(groupKey, chapterOrder)).toList()
            );
        }
    }

    private static final class StepBuilder {
        private final Integer stepOrder;
        private final List<StepProjection> projections = new ArrayList<>();

        private StepBuilder(Integer stepOrder) {
            this.stepOrder = stepOrder;
        }

        private void add(QuestExplorer.Entry entry, ProjectedPosition position) {
            projections.add(new StepProjection(entry, position));
        }

        private QuestExplorer.Step build(ProgressionGroupKey groupKey, Integer chapterOrder) {
            QuestExplorer.Entry detailEntry = projections.stream()
                    .map(StepProjection::entry)
                    .min(canonicalEntryComparator())
                    .orElseThrow();
            List<QuestExplorer.Entry> variants = projections.stream()
                    .map(StepProjection::entry)
                    .toList();
            return new QuestExplorer.Step(
                    stepKey(groupKey, chapterOrder, stepOrder),
                    stepOrder == null ? null : stepOrder + 1,
                    stepOrder,
                    detailEntry.title(),
                    stepProjectionKind(projections),
                    detailEntry.entryKey(),
                    distinct(variants.stream().map(QuestExplorer.Entry::entryKey).toList()),
                    aliasEntryKeys(projections),
                    variants.stream().sorted(variantComparator()).map(QuestExplorerProgressionProjector::variant).toList()
            );
        }
    }

    private static String stepKey(ProgressionGroupKey groupKey, Integer chapterOrder, Integer stepOrder) {
        return String.join(":",
                safeKeySegment(groupKey.questLineFamilyKey()),
                safeKeySegment(groupKey.factionFamilyKey()),
                "chapter-" + valueOrUnknown(chapterOrder),
                "step-" + valueOrUnknown(stepOrder)
        );
    }

    private static String stepProjectionKind(List<StepProjection> projections) {
        if (projections.stream().anyMatch(projection -> projection.position().positionKind() == PositionKind.ALIAS_EXPANDED)) {
            return STEP_KIND_VIRTUAL_ALIAS_EXPANDED;
        }
        if (projections.stream().allMatch(projection -> isBranchVariant(projection.entry()))) {
            return STEP_KIND_BRANCH_VARIANT_ONLY;
        }
        if (projections.stream().anyMatch(projection -> projection.position().positionKind() == PositionKind.PARSED_ENTRY_KEY)) {
            return STEP_KIND_PARSED_ENTRY_BACKED;
        }
        return STEP_KIND_REAL_ENTRY_BACKED;
    }

    private static List<String> aliasEntryKeys(List<StepProjection> projections) {
        return distinct(projections.stream()
                .filter(projection -> projection.position().positionKind() == PositionKind.ALIAS_EXPANDED ||
                        projection.position().positionKind() == PositionKind.BRANCH_VARIANT)
                .map(projection -> projection.position().sourceIdentityKey())
                .toList());
    }

    private static String safeKeySegment(String value) {
        String cleanValue = clean(value);
        return cleanValue == null ? "none" : cleanValue;
    }

    private static String valueOrUnknown(Integer value) {
        return value == null ? "unknown" : String.valueOf(value);
    }

    private static final class ProjectionDiagnostics {
        private final int totalEntries;
        private final Set<ProgressionGroupKey> questlineFamiliesFound = new HashSet<>();
        private final Map<CollapseKey, Integer> collapseCounts = new HashMap<>();
        private final LinkedHashSet<String> entriesWithMissingChapterOrStepOrder = new LinkedHashSet<>();
        private final LinkedHashSet<String> suspiciousBranchVariantsWithoutParentStep = new LinkedHashSet<>();
        private final LinkedHashSet<String> tutorialEntriesPlaced = new LinkedHashSet<>();

        private ProjectionDiagnostics(int totalEntries) {
            this.totalEntries = totalEntries;
        }

        private void addQuestlineFamily(ProgressionGroupKey groupKey) {
            questlineFamiliesFound.add(groupKey);
        }

        private void addCollapse(CollapseDecision decision) {
            CollapseKey key = new CollapseKey(
                    decision.sourceQuestLineKey(),
                    decision.sourceFactionKey(),
                    decision.questLineFamilyKey(),
                    decision.factionFamilyKey()
            );
            collapseCounts.merge(key, 1, Integer::sum);
        }

        private void addMissingChapterOrStep(String entryKey) {
            entriesWithMissingChapterOrStepOrder.add(entryKey);
        }

        private void addSuspiciousBranchVariant(String entryKey) {
            suspiciousBranchVariantsWithoutParentStep.add(entryKey);
        }

        private void addTutorialEntry(String entryKey) {
            tutorialEntriesPlaced.add(entryKey);
        }

        private List<QuestExplorer.NumericQuestlineVariantCollapse> numericCollapses() {
            return collapseCounts.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(entry -> new QuestExplorer.NumericQuestlineVariantCollapse(
                            entry.getKey().sourceQuestLineKey(),
                            entry.getKey().sourceFactionKey(),
                            entry.getKey().targetQuestLineFamilyKey(),
                            entry.getKey().targetFactionFamilyKey(),
                            entry.getValue(),
                            "trailing numeric questline and faction suffix matched an existing base key"
                    ))
                    .toList();
        }

        private QuestExplorer.ProgressionDebugSummary toSummary(List<QuestExplorer.Questline> questlines) {
            return new QuestExplorer.ProgressionDebugSummary(
                    totalEntries,
                    questlineFamiliesFound.stream()
                            .sorted(Comparator.comparing(ProgressionGroupKey::questLineFamilyKey, nullsLastString())
                                    .thenComparing(ProgressionGroupKey::factionFamilyKey, nullsLastString()))
                            .map(ProjectionDiagnostics::familyLabel)
                            .toList(),
                    questlines.stream().map(this::questlineDebugSummary).toList(),
                    missingMajorFactionChapters(questlines),
                    chaptersWithOnlyOneStep(questlines),
                    numericCollapses(),
                    List.copyOf(entriesWithMissingChapterOrStepOrder),
                    List.copyOf(suspiciousBranchVariantsWithoutParentStep),
                    List.copyOf(tutorialEntriesPlaced)
            );
        }

        private QuestExplorer.QuestlineDebugSummary questlineDebugSummary(QuestExplorer.Questline questline) {
            return new QuestExplorer.QuestlineDebugSummary(
                    questline.questLineFamilyKey(),
                    questline.factionFamilyKey(),
                    questline.sourceQuestLineKeys(),
                    questline.chapters().stream().map(chapter -> new QuestExplorer.ChapterDebugSummary(
                            chapter.chapterOrder(),
                            chapter.chapterNumber(),
                            chapter.title(),
                            chapter.steps().size(),
                            chapter.steps().stream().map(step -> new QuestExplorer.StepDebugSummary(
                                    step.stepKey(),
                                    step.stepOrder(),
                                    step.stepNumber(),
                                    step.projectionKind(),
                                    step.detailEntryKey(),
                                    step.sourceEntryKeys(),
                                    step.aliasEntryKeys(),
                                    step.variants().size(),
                                    (int) step.variants().stream()
                                            .filter(variant -> VARIANT_KIND_BRANCH_VARIANT.equals(variant.variantKind()))
                                            .count()
                            )).toList()
                    )).toList()
            );
        }

        private List<QuestExplorer.MissingMajorFactionChapters> missingMajorFactionChapters(
                List<QuestExplorer.Questline> questlines
        ) {
            List<QuestExplorer.MissingMajorFactionChapters> missing = new ArrayList<>();
            for (QuestExplorer.Questline questline : questlines) {
                if (!nullToEmpty(questline.questLineFamilyKey()).startsWith("FactionQuest_")) continue;
                Set<Integer> present = questline.chapters().stream()
                        .map(QuestExplorer.Chapter::chapterOrder)
                        .filter(Objects::nonNull)
                        .collect(java.util.stream.Collectors.toSet());
                List<Integer> missingChapters = new ArrayList<>();
                for (int chapter = 1; chapter <= 6; chapter++) {
                    if (!present.contains(chapter)) missingChapters.add(chapter);
                }
                if (!missingChapters.isEmpty()) {
                    missing.add(new QuestExplorer.MissingMajorFactionChapters(
                            questline.questLineFamilyKey(),
                            questline.factionFamilyKey(),
                            missingChapters
                    ));
                }
            }
            return missing;
        }

        private List<QuestExplorer.ChapterWithOneStep> chaptersWithOnlyOneStep(List<QuestExplorer.Questline> questlines) {
            List<QuestExplorer.ChapterWithOneStep> chapters = new ArrayList<>();
            for (QuestExplorer.Questline questline : questlines) {
                for (QuestExplorer.Chapter chapter : questline.chapters()) {
                    if (chapter.steps().size() == 1) {
                        chapters.add(new QuestExplorer.ChapterWithOneStep(
                                questline.questLineFamilyKey(),
                                questline.factionFamilyKey(),
                                chapter.chapterOrder(),
                                chapter.title()
                        ));
                    }
                }
            }
            return chapters;
        }

        private static String familyLabel(ProgressionGroupKey groupKey) {
            if (groupKey.factionFamilyKey() == null) return groupKey.questLineFamilyKey();
            return groupKey.questLineFamilyKey() + " / " + groupKey.factionFamilyKey();
        }
    }

    private record CollapseKey(
            String sourceQuestLineKey,
            String sourceFactionKey,
            String targetQuestLineFamilyKey,
            String targetFactionFamilyKey
    ) implements Comparable<CollapseKey> {
        @Override
        public int compareTo(CollapseKey other) {
            int questLineDelta = nullsLastString().compare(sourceQuestLineKey, other.sourceQuestLineKey);
            if (questLineDelta != 0) return questLineDelta;
            return nullsLastString().compare(sourceFactionKey, other.sourceFactionKey);
        }
    }

    private static void addClean(Set<String> values, String value) {
        String cleanValue = clean(value);
        if (cleanValue != null) values.add(cleanValue);
    }
}
