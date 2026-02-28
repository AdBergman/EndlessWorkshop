package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.Codex;
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
                .descriptionLines(entity.getDescriptionLines() == null ? List.of() : List.copyOf(entity.getDescriptionLines()))
                .referenceKeys(entity.getReferenceKeys() == null ? List.of() : List.copyOf(entity.getReferenceKeys()))
                .build();
    }

    public CodexEntity toEntity(Codex domain) {
        if (domain == null) return null;

        CodexEntity entity = new CodexEntity();
        entity.setExportKind(domain.getExportKind());
        entity.setEntryKey(domain.getEntryKey());
        entity.setDisplayName(domain.getDisplayName());
        entity.setDescriptionLines(domain.getDescriptionLines() == null ? List.of() : new ArrayList<>(domain.getDescriptionLines()));
        entity.setReferenceKeys(domain.getReferenceKeys() == null ? List.of() : new ArrayList<>(domain.getReferenceKeys()));
        return entity;
    }
}