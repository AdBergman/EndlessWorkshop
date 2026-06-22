package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.Codex;
import ewshop.domain.model.CodexSvgIcon;
import ewshop.infrastructure.persistence.entities.CodexEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class CodexMapper {

    public Codex toDomain(CodexEntity entity) {
        if (entity == null) return null;

        return Codex.builder()
                .exportKind(entity.getExportKind())
                .entryKey(entity.getEntryKey())
                .displayName(entity.getDisplayName())
                .category(entity.getCategory())
                .kind(entity.getKind())
                .descriptionLines(entity.getDescriptionLines() == null ? List.of() : List.copyOf(entity.getDescriptionLines()))
                .referenceKeys(entity.getReferenceKeys() == null ? List.of() : List.copyOf(entity.getReferenceKeys()))
                .facts(CodexMetadataJsonMapper.decodeFacts(entity.getFactsJson()))
                .sections(CodexMetadataJsonMapper.decodeSections(entity.getSectionsJson()))
                .publicContextKeys(entity.getPublicContextKeys() == null ? List.of() : List.copyOf(entity.getPublicContextKeys()))
                .svgIcon(toSvgIcon(entity.getSvgIconSource(), entity.getSvgIconKey()))
                .build();
    }

    public CodexEntity toEntity(Codex domain) {
        if (domain == null) return null;

        CodexEntity entity = new CodexEntity();
        entity.setExportKind(domain.getExportKind());
        entity.setEntryKey(domain.getEntryKey());
        entity.setDisplayName(domain.getDisplayName());
        entity.setCategory(domain.getCategory());
        entity.setKind(domain.getKind());
        entity.setSvgIconSource(domain.getSvgIcon() == null ? null : domain.getSvgIcon().source());
        entity.setSvgIconKey(domain.getSvgIcon() == null ? null : domain.getSvgIcon().key());
        entity.setDescriptionLines(domain.getDescriptionLines() == null ? List.of() : new ArrayList<>(domain.getDescriptionLines()));
        entity.setReferenceKeys(domain.getReferenceKeys() == null ? List.of() : new ArrayList<>(domain.getReferenceKeys()));
        entity.setFactsJson(CodexMetadataJsonMapper.encodeFacts(domain.getFacts()));
        entity.setSectionsJson(CodexMetadataJsonMapper.encodeSections(domain.getSections()));
        entity.setPublicContextKeys(domain.getPublicContextKeys() == null ? List.of() : new ArrayList<>(domain.getPublicContextKeys()));
        return entity;
    }

    private static CodexSvgIcon toSvgIcon(String source, String key) {
        if (source == null || source.isBlank() || key == null || key.isBlank()) return null;
        return new CodexSvgIcon(source.trim(), key.trim());
    }
}
