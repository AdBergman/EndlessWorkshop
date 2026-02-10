package ewshop.facade.dto.importing.tech;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TechImportFileDto(
        String game,
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        List<TechImportTechDto> techs
) {}