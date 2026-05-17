package ewshop.facade.dto.importing.quests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record QuestImportBatchDto(
        QuestGraphImportBatchDto graph,
        QuestDialogImportBatchDto dialog
) {}
