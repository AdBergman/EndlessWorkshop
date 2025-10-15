package ewshop.domain.repository;

import ewshop.domain.entity.UnitSkill;

import java.util.List;

public interface UnitSkillRepository {

    UnitSkill save(UnitSkill skill);

    void saveAll(List<UnitSkill> skills);

    UnitSkill findByName(String name);

    List<UnitSkill> findAll();

    void deleteAll();

    boolean existsByName(String name);
}
