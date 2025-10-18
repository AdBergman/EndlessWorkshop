package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "tech_unlock")
public class TechUnlockEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tech_id")
    private TechEntity tech;

    // Optional relationships
    @ManyToOne
    @JoinColumn(name = "convertor_id")
    private ConvertorEntity convertor;

    @ManyToOne
    @JoinColumn(name = "unit_specialization_id")
    private UnitSpecializationEntity unitSpecialization;

    @ManyToOne
    @JoinColumn(name = "treaty_id")
    private TreatyEntity treaty;

    @ManyToOne
    @JoinColumn(name = "district_id")
    private DistrictEntity district;

    @ManyToOne
    @JoinColumn(name = "improvement_id")
    private ImprovementEntity improvement;

    @Column(name = "unlock_text")
    private String unlockText;

    public TechUnlockEntity() {}

    // Getters and Setters

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
}
