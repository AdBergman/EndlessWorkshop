package ewshop.facade.mapper;

import ewshop.domain.model.SavedTechBuild;
import ewshop.domain.model.enums.MajorFaction;
import ewshop.facade.dto.request.CreateSavedTechBuildRequest;
import ewshop.facade.dto.response.SavedTechBuildDto;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class SavedTechBuildMapper {

    // Domain -> Response DTO
    public static SavedTechBuildDto toDto(SavedTechBuild entity) {
        if (entity == null) return null;

        List<String> techIds = entity.getTechIds() != null ? List.copyOf(entity.getTechIds()) : Collections.emptyList();

        return SavedTechBuildDto.builder()
                .uuid(entity.getUuid())
                .name(entity.getName())
                .selectedFaction(entity.getFaction())
                .techIds(techIds)
                .createdAt(entity.getCreatedAt())
                .build();
    }

    // Request DTO -> Domain
    public static SavedTechBuild toDomain(CreateSavedTechBuildRequest request) {
        if (request == null) return null;

        List<String> techIds = request.techIds() != null ? List.copyOf(request.techIds()) : Collections.emptyList();

        return SavedTechBuild.builder()
                .uuid(UUID.randomUUID()) // always generate new UUID
                .name(request.name() != null ? request.name() : "")
                .faction(MajorFaction.fromDisplayName(request.selectedFaction()))
                .techIds(techIds)
                .build();
    }
}
