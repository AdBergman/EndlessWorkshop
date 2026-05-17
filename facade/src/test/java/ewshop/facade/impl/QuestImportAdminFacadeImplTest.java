package ewshop.facade.impl;

import ewshop.domain.command.QuestImportSnapshot;
import ewshop.domain.model.quest.QuestExplorer;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.service.QuestImportService;
import ewshop.domain.service.QuestService;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.quests.*;
import org.junit.jupiter.api.Test;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import java.lang.reflect.Method;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class QuestImportAdminFacadeImplTest {

    @Test
    void importQuests_warmsQuestReadCacheAfterSuccessfulImport() {
        ImportResult result = new ImportResult();
        result.incrementInserted();

        RecordingQuestImportService questImportService = new RecordingQuestImportService(result);
        RecordingQuestService questService = new RecordingQuestService();
        QuestImportAdminFacadeImpl facade = new QuestImportAdminFacadeImpl(questImportService, questService);

        ImportSummaryDto summary = facade.importQuests(questPayload());

        assertTrue(questImportService.called);
        assertEquals(1, questImportService.capturedSnapshot.quests().size());
        assertEquals(1, questService.getExplorerCalls);
        assertEquals(1, summary.counts().inserted());
    }

    @Test
    void questReadAndImportServicesUseQuestCacheAnnotations() throws Exception {
        Method getQuestExplorer = QuestService.class.getMethod("getQuestExplorer");
        Cacheable cacheable = getQuestExplorer.getAnnotation(Cacheable.class);
        assertNotNull(cacheable);
        assertArrayEquals(new String[]{"quests"}, cacheable.value());

        Method importQuests = QuestImportService.class.getMethod("importQuests", QuestImportSnapshot.class);
        CacheEvict cacheEvict = importQuests.getAnnotation(CacheEvict.class);
        assertNotNull(cacheEvict);
        assertArrayEquals(new String[]{"quests"}, cacheEvict.value());
        assertTrue(cacheEvict.allEntries());
    }

    private static final class RecordingQuestImportService extends QuestImportService {
        private final ImportResult result;
        private QuestImportSnapshot capturedSnapshot;
        private boolean called;

        private RecordingQuestImportService(ImportResult result) {
            super(null);
            this.result = result;
        }

        @Override
        public ImportResult importQuests(QuestImportSnapshot snapshot) {
            called = true;
            capturedSnapshot = snapshot;
            return result;
        }
    }

    private static final class RecordingQuestService extends QuestService {
        private int getExplorerCalls;

        private RecordingQuestService() {
            super(null);
        }

        @Override
        public QuestExplorer getQuestExplorer() {
            getExplorerCalls++;
            return new QuestExplorer(List.of(), List.of());
        }
    }

    private static QuestImportBatchDto questPayload() {
        QuestDialogBlockRefDto ref = new QuestDialogBlockRefDto(
                "Quest_A",
                "Choice_A",
                0,
                "Dialog_A",
                "start",
                1
        );

        QuestGraphStepDto step = new QuestGraphStepDto(
                0,
                "Find the trail.",
                null,
                null,
                List.of("Find the trail."),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of("Dialog_A"),
                List.of(ref)
        );

        QuestGraphChoiceDto choice = new QuestGraphChoiceDto(
                "Choice_A",
                "Choice A",
                List.of("Choice description"),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of("Choice_A"),
                List.of(step)
        );

        QuestGraphQuestDto quest = new QuestGraphQuestDto(
                "Quest_A",
                "A Quest",
                List.of("Quest description"),
                "QuestCategory_Test",
                "Curiosity",
                false,
                false,
                true,
                false,
                false,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                List.of(),
                List.of(),
                List.of("Quest_A"),
                List.of(choice),
                List.of()
        );

        QuestDialogBlockDto dialogBlock = new QuestDialogBlockDto(
                "Quest_A",
                "Choice_A",
                0,
                "Dialog_A",
                "start",
                List.of(new QuestDialogLineDto(0, "narrator", null, "Line"))
        );

        return new QuestImportBatchDto(
                new QuestGraphImportBatchDto("Endless Legend 2", "0.80", "0.1.0", "now", "quest_graph", List.of(quest)),
                new QuestDialogImportBatchDto("Endless Legend 2", "0.80", "0.1.0", "now", "quest_dialog", List.of(dialogBlock))
        );
    }
}
