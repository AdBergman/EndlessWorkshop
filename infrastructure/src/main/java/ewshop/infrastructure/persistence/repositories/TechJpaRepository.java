package ewshop.infrastructure.persistence.repositories;

import ewshop.domain.entity.TechCoords;
import ewshop.domain.entity.enums.TechType;
import ewshop.infrastructure.persistence.entities.TechEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TechJpaRepository extends JpaRepository<TechEntity, Long> {
    Optional<TechEntity> findByName(String name);

    @EntityGraph(attributePaths = {"unlocks", "unlocks.unitSpecialization", "unlocks.improvement", "unlocks.district"})
    List<TechEntity> findAll();

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
    update TechEntity t
       set t.era = :era,
           t.techCoords = :coords
     where t.name = :name
       and t.type = :type
""")
    int updateEraAndCoordsByNameAndType(@Param("name") String name,
                                        @Param("type") TechType type,
                                        @Param("era") int era,
                                        @Param("coords") TechCoords coords);
}
