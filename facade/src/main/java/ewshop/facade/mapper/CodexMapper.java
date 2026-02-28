package ewshop.facade.mapper;

import ewshop.domain.model.Codex;
import ewshop.facade.dto.response.CodexDto;

import java.util.List;

public class CodexMapper {

    public static CodexDto toDto(Codex domain) {
        if (domain == null) return null;

        List<String> lines = (domain.getDescriptionLines() == null)
                ? List.of()
                : List.copyOf(domain.getDescriptionLines());

        List<String> refs = (domain.getReferenceKeys() == null)
                ? List.of()
                : List.copyOf(domain.getReferenceKeys());

        return new CodexDto(
                domain.getExportKind(),
                domain.getEntryKey(),
                domain.getDisplayName(),
                lines,
                refs
        );
    }
}