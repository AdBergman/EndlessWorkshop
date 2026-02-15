package ewshop.facade.mapper;

import ewshop.domain.model.Improvement;
import ewshop.facade.dto.response.ImprovementDto;

import java.util.List;

public class ImprovementMapper {

    public static ImprovementDto toDto(Improvement domain) {
        if (domain == null) return null;

        List<String> lines = (domain.getDescriptionLines() == null)
                ? List.of()
                : List.copyOf(domain.getDescriptionLines());

        return new ImprovementDto(
                domain.getConstructibleKey(),
                domain.getDisplayName(),
                domain.getCategory(),
                lines
        );
    }
}