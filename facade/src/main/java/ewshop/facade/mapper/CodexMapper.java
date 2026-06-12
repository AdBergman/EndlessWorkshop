package ewshop.facade.mapper;

import ewshop.domain.model.Codex;
import ewshop.domain.model.CodexMetadataFact;
import ewshop.domain.model.CodexMetadataSection;
import ewshop.domain.model.CodexMetadataSectionItem;
import ewshop.facade.dto.response.CodexDto;
import ewshop.facade.dto.response.CodexMetadataFactDto;
import ewshop.facade.dto.response.CodexMetadataSectionDto;
import ewshop.facade.dto.response.CodexMetadataSectionItemDto;

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

        List<CodexMetadataFactDto> facts = toFactDtos(domain.getFacts());
        List<CodexMetadataSectionDto> sections = toSectionDtos(domain.getSections());
        List<String> publicContextKeys = (domain.getPublicContextKeys() == null)
                ? List.of()
                : List.copyOf(domain.getPublicContextKeys());

        return new CodexDto(
                domain.getExportKind(),
                domain.getEntryKey(),
                domain.getDisplayName(),
                domain.getCategory(),
                domain.getKind(),
                lines,
                refs,
                facts,
                sections,
                publicContextKeys
        );
    }

    private static List<CodexMetadataFactDto> toFactDtos(List<CodexMetadataFact> facts) {
        if (facts == null || facts.isEmpty()) return List.of();

        return facts.stream()
                .map(fact -> new CodexMetadataFactDto(fact.label(), fact.value(), fact.referenceKey()))
                .toList();
    }

    private static List<CodexMetadataSectionDto> toSectionDtos(List<CodexMetadataSection> sections) {
        if (sections == null || sections.isEmpty()) return List.of();

        return sections.stream()
                .map(section -> new CodexMetadataSectionDto(
                        section.title(),
                        section.lines() == null ? List.of() : List.copyOf(section.lines()),
                        toSectionItemDtos(section.items())
                ))
                .toList();
    }

    private static List<CodexMetadataSectionItemDto> toSectionItemDtos(List<CodexMetadataSectionItem> items) {
        if (items == null || items.isEmpty()) return List.of();

        return items.stream()
                .map(item -> new CodexMetadataSectionItemDto(
                        item.label(),
                        item.referenceKey(),
                        toFactDtos(item.facts()),
                        item.lines() == null ? List.of() : List.copyOf(item.lines())
                ))
                .toList();
    }
}
