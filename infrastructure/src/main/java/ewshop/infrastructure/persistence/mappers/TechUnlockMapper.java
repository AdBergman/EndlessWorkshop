package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.*;
import ewshop.domain.repository.entities.TechUnlockEntity;

public class TechUnlockMapper {

    public static TechUnlock toDomain(TechUnlockEntity entity) {
        if (entity == null) return null;

        return TechUnlock.builder()
                .convertor(ConvertorMapper.toDomain(entity.getConvertor()))
                .unitSpecialization(UnitSpecializationMapper.toDomain(entity.getUnitSpecialization()))
                .treaty(TreatyMapper.toDomain(entity.getTreaty()))
                .district(DistrictMapper.toDomain(entity.getDistrict()))
                .improvement(ImprovementMapper.toDomain(entity.getImprovement()))
                .unlockText(entity.getUnlockText())
                .build();
    }

    public static TechUnlockEntity toEntity(TechUnlock domain) {
        if (domain == null) return null;

        TechUnlockEntity entity = new TechUnlockEntity();
        entity.setConvertor(ConvertorMapper.toEntity(domain.getConvertor()));
        entity.setUnitSpecialization(UnitSpecializationMapper.toEntity(domain.getUnitSpecialization()));
        entity.setTreaty(TreatyMapper.toEntity(domain.getTreaty()));
        entity.setDistrict(DistrictMapper.toEntity(domain.getDistrict()));
        entity.setImprovement(ImprovementMapper.toEntity(domain.getImprovement()));
        entity.setUnlockText(domain.getUnlockText());
        return entity;
    }
}
