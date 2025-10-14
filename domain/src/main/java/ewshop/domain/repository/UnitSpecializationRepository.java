package ewshop.domain.repository;

import ewshop.domain.entity.UnitSpecialization;

import java.util.List;

public interface UnitSpecializationRepository {

    UnitSpecialization save(UnitSpecialization unitSpecialization);

    void saveAll(List<UnitSpecialization> unitSpecializations);

    UnitSpecialization findByName(String name);

    List<UnitSpecialization> findAll();

    void deleteAll();
}
