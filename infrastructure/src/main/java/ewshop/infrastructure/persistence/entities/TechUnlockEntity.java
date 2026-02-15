package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "tech_unlock")
public class TechUnlockEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tech_id", nullable = false)
    private TechEntity tech;

    // Legacy – replaced by unlock_type / unlock_category / unlock_element_name
    @ManyToOne
    @JoinColumn(name = "convertor_id")
    private ConvertorEntity convertor;

    // Legacy – replaced by unlock_type / unlock_category / unlock_element_name
    @ManyToOne
    @JoinColumn(name = "unit_specialization_id")
    private UnitSpecializationEntity unitSpecialization;

    // Legacy – replaced by unlock_type / unlock_category / unlock_element_name
    @ManyToOne
    @JoinColumn(name = "treaty_id")
    private TreatyEntity treaty;

    // Legacy – replaced by unlock_type / unlock_category / unlock_element_name
    @ManyToOne
    @JoinColumn(name = "district_id")
    private DistrictEntity district;

    // Legacy – replaced by unlock_type / unlock_category / unlock_element_name
    @ManyToOne
    @JoinColumn(name = "improvement_id")
    private ImprovementEntity improvement;

    // Legacy – replaced by unlock_type / unlock_category / unlock_element_name
    @Column(name = "unlock_text")
    private String unlockText;

    @Column(name = "unlock_type")
    private String unlockType;

    @Column(name = "unlock_category")
    private String unlockCategory;

    @Column(name = "unlock_element_name")
    private String unlockElementName;

    public TechUnlockEntity() {}

    public Long getId() {
        return id;
    }

    public TechEntity getTech() {
        return tech;
    }

    public void setTech(TechEntity tech) {
        this.tech = tech;
    }

    public ConvertorEntity getConvertor() {
        return convertor;
    }

    public void setConvertor(ConvertorEntity convertor) {
        this.convertor = convertor;
    }

    public UnitSpecializationEntity getUnitSpecialization() {
        return unitSpecialization;
    }

    public void setUnitSpecialization(UnitSpecializationEntity unitSpecialization) {
        this.unitSpecialization = unitSpecialization;
    }

    public TreatyEntity getTreaty() {
        return treaty;
    }

    public void setTreaty(TreatyEntity treaty) {
        this.treaty = treaty;
    }

    public DistrictEntity getDistrict() {
        return district;
    }

    public void setDistrict(DistrictEntity district) {
        this.district = district;
    }

    public ImprovementEntity getImprovement() {
        return improvement;
    }

    public void setImprovement(ImprovementEntity improvement) {
        this.improvement = improvement;
    }

    public String getUnlockText() {
        return unlockText;
    }

    public void setUnlockText(String unlockText) {
        this.unlockText = unlockText;
    }

    public String getUnlockType() {
        return unlockType;
    }

    public void setUnlockType(String unlockType) {
        this.unlockType = unlockType;
    }

    public String getUnlockCategory() {
        return unlockCategory;
    }

    public void setUnlockCategory(String unlockCategory) {
        this.unlockCategory = unlockCategory;
    }

    public String getUnlockElementName() {
        return unlockElementName;
    }

    public void setUnlockElementName(String unlockElementName) {
        this.unlockElementName = unlockElementName;
    }
}