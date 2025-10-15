//package ewshop.infrastructure.persistence.mappers;
//
//import ewshop.domain.entity.*;
//import ewshop.infrastructure.persistence.entities.*;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//
//import java.util.Collections;
//
//import static org.assertj.core.api.Assertions.assertThat;
//
//class TechUnlockMapperTest {
//
//    private TechUnlockMapper techUnlockMapper;
//
//    @BeforeEach
//    void setUp() {
//        // Manually create the full dependency chain for the unit test
//        var convertorMapper = new ConvertorMapper();
//        var unitSpecializationMapper = new UnitSpecializationMapper();
//        var treatyMapper = new TreatyMapper();
//        var districtMapper = new DistrictMapper();
//        var improvementMapper = new ImprovementMapper(new StrategicCostMapper());
//        this.techUnlockMapper = new TechUnlockMapper(convertorMapper, unitSpecializationMapper, treatyMapper, districtMapper, improvementMapper);
//    }
//
//    @Test
//    void toDomain_shouldMapAllFields() {
//        // Setup: Create an entity with all nested entities and lists properly initialized
//        TechUnlockEntity entity = new TechUnlockEntity();
//        entity.setUnlockText("Plain text unlock");
//
//        ConvertorEntity convertorEntity = new ConvertorEntity();
//        convertorEntity.setName("Test Convertor");
//        entity.setConvertor(convertorEntity);
//
//        UnitSpecializationEntity specEntity = new UnitSpecializationEntity();
//        specEntity.setName("Test Specialization");
//        entity.setUnitSpecialization(specEntity);
//
//        TreatyEntity treatyEntity = new TreatyEntity();
//        treatyEntity.setName("Test Treaty");
//        entity.setTreaty(treatyEntity);
//
//        // This was the source of the error. Initialize all lists to be non-null.
//        DistrictEntity districtEntity = new DistrictEntity();
//        districtEntity.setName("Test District");
//        districtEntity.setInfo(Collections.emptyList());
//        districtEntity.setTileBonus(Collections.emptyList());
//        districtEntity.setAdjacencyBonus(Collections.emptyList());
//        entity.setDistrict(districtEntity);
//
//        ImprovementEntity improvementEntity = new ImprovementEntity();
//        improvementEntity.setName("Test Improvement");
//        improvementEntity.setCost(Collections.emptyList());
//        improvementEntity.setEffects(Collections.emptyList());
//        entity.setImprovement(improvementEntity);
//
//        // Act: Map to domain
//        TechUnlock domain = techUnlockMapper.toDomain(entity);
//
//        // Assert: Check all fields, including all nested ones
//        assertThat(domain).isNotNull();
//        assertThat(domain.getUnlockText()).isEqualTo("Plain text unlock");
//        assertThat(domain.getConvertor()).isNotNull();
//        assertThat(domain.getConvertor().getName()).isEqualTo("Test Convertor");
//        assertThat(domain.getUnitSpecialization()).isNotNull();
//        assertThat(domain.getUnitSpecialization().getName()).isEqualTo("Test Specialization");
//        assertThat(domain.getTreaty()).isNotNull();
//        assertThat(domain.getTreaty().getName()).isEqualTo("Test Treaty");
//        assertThat(domain.getDistrict()).isNotNull();
//        assertThat(domain.getDistrict().getName()).isEqualTo("Test District");
//        assertThat(domain.getImprovement()).isNotNull();
//        assertThat(domain.getImprovement().getName()).isEqualTo("Test Improvement");
//    }
//
//    @Test
//    void toEntity_shouldMapAllFields() {
//        // Setup: Create a domain object with all nested objects populated
//        TechUnlock domain = TechUnlock.builder()
//                .unlockText("Plain text unlock")
//                .convertor(Convertor.builder().name("Test Convertor").build())
//                .unitSpecialization(UnitSpecialization.builder().name("Test Specialization").build())
//                .treaty(Treaty.builder().name("Test Treaty").build())
//                .district(District.builder().name("Test District").build())
//                .improvement(Improvement.builder().name("Test Improvement").build())
//                .build();
//
//        // Act: Map to entity
//        TechUnlockEntity entity = techUnlockMapper.toEntity(domain);
//
//        // Assert: Check all fields, including all nested ones
//        assertThat(entity).isNotNull();
//        assertThat(entity.getUnlockText()).isEqualTo("Plain text unlock");
//        assertThat(entity.getConvertor()).isNotNull();
//        assertThat(entity.getConvertor().getName()).isEqualTo("Test Convertor");
//        assertThat(entity.getUnitSpecialization()).isNotNull();
//        assertThat(entity.getUnitSpecialization().getName()).isEqualTo("Test Specialization");
//        assertThat(entity.getTreaty()).isNotNull();
//        assertThat(entity.getTreaty().getName()).isEqualTo("Test Treaty");
//        assertThat(entity.getDistrict()).isNotNull();
//        assertThat(entity.getDistrict().getName()).isEqualTo("Test District");
//        assertThat(entity.getImprovement()).isNotNull();
//        assertThat(entity.getImprovement().getName()).isEqualTo("Test Improvement");
//    }
//}
