package ewshop.facade.impl;

import ewshop.domain.command.TechImportSnapshot;
import ewshop.domain.service.TechImportService;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportTechDto;
import ewshop.facade.interfaces.ImportAdminFacade;
import ewshop.facade.mapper.TechImportMapper;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

public class TechImportAdminFacadeImpl implements ImportAdminFacade {

    private final TechImportService techImportService;

    public TechImportAdminFacadeImpl(TechImportService techImportService) {
        this.techImportService = techImportService;
    }

    @Override
    public void importTechs(TechImportBatchDto fileDto) {
        if (fileDto == null) {
            return;
        }

        List<TechImportTechDto> techDtos =
                fileDto.techs() == null ? List.of() : fileDto.techs();

        if (techDtos.isEmpty()) {
            return;
        }

        List<TechImportSnapshot> snapshots = techDtos.stream()
                .map(TechImportMapper::toDomain)
                .filter(Objects::nonNull)
                .toList();

        if (snapshots.isEmpty()) {
            return;
        }

        assertNoDuplicateTechKeys(snapshots);

        techImportService.importSnapshot(snapshots);
    }

    private static void assertNoDuplicateTechKeys(List<TechImportSnapshot> snapshots) {
        Set<String> seen = new HashSet<>();
        for (TechImportSnapshot s : snapshots) {
            String key = s.techKey();
            if (!seen.add(key)) {
                throw new IllegalArgumentException("Duplicate techKey in import file: " + key);
            }
        }
    }
}