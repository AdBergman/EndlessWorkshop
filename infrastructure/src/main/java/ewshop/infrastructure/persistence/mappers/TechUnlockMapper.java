package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.TechUnlock;
import ewshop.infrastructure.persistence.entities.TechUnlockEntity;
import org.springframework.stereotype.Component;

@Component
public class TechUnlockMapper {

    private final ConvertorMapper convertorMapper;
    private final UnitSpecializationMapper unitSpecializationMapper;
    private final TreatyMapper treatyMapper;
    private final DistrictMapper districtMapper;
    private final ImprovementMapper improvementMapper;

    // All mapper dependencies are now injected via the constructor
    public TechUnlockMapper(ConvertorMapper convertorMapper, UnitSpecializationMapper unitSpecializationMapper, TreatyMapper treatyMapper, DistrictMapper districtMapper, ImprovementMapper improvementMapper) {
        this.convertorMapper = convertorMapper;
        this.unitSpecializationMapper = unitSpecializationMapper;
        this.treatyMapper = treatyMapper;
        this.districtMapper = districtMapper;
        this.improvementMapper = improvementMapper;
    }

    public TechUnlock toDomain(TechUnlockEntity entity) {
        if (entity == null) return null;

        // Use injected mappers for all nested objects
        return TechUnlock.builder()
                .convertor(convertorMapper.toDomain(entity.getConvertor()))
                .unitSpecialization(unitSpecializationMapper.toDomain(entity.getUnitSpecialization()))
                .treaty(treatyMapper.toDomain(entity.getTreaty()))
                .district(districtMapper.toDomain(entity.getDistrict()))
                .improvement(improvementMapper.toDomain(entity.getImprovement()))
                .unlockText(entity.getUnlockText())
                .build();
    }

    public TechUnlockEntity toEntity(TechUnlock domain) {
        if (domain == null) return null;

        TechUnlockEntity entity = new TechUnlockEntity();
        // Use injected mappers for all nested objects
        entity.setConvertor(convertorMapper.toEntity(domain.getConvertor()));
        entity.setUnitSpecialization(unitSpecializationMapper.toEntity(domain.getUnitSpecialization()));
        entity.setTreaty(treatyMapper.toEntity(domain.getTreaty()));
        entity.setDistrict(districtMapper.toEntity(domain.getDistrict()));
        entity.setImprovement(improvementMapper.toEntity(domain.getImprovement()));
        entity.setUnlockText(domain.getUnlockText());
        return entity;
    }
}
