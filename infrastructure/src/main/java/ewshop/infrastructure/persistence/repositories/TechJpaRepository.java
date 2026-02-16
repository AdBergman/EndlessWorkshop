package ewshop.infrastructure.persistence.repositories;

import ewshop.domain.model.TechCoords;
import ewshop.infrastructure.persistence.entities.TechEntity;
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

    Optional<TechEntity> findByTechKey(String techKey);

    List<TechEntity> findAllByTechKeyIn(List<String> techKeys);

    List<TechEntity> findAllByTechKeyNotIn(List<String> techKeys);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "update tech set excludes_id = null where excludes_id in (:ids)", nativeQuery = true)
    int clearExcludesRefsToTechIds(@Param("ids") List<Long> ids);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "update tech set prereq_id = null where prereq_id in (:ids)", nativeQuery = true)
    int clearPrereqRefsToTechIds(@Param("ids") List<Long> ids);

    @Query("""
        select distinct tech
          from TechEntity tech
          left join fetch tech.prereq
          left join fetch tech.excludes
          left join fetch tech.descriptionLines
          left join fetch tech.unlocks
    """)
    List<TechEntity> findAllForCache();

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        update TechEntity tech
           set tech.era = :era,
               tech.techCoords = :coords
         where tech.techKey = :techKey
    """)
    int updateEraAndCoordsByTechKey(@Param("techKey") String techKey,
                                    @Param("era") int era,
                                    @Param("coords") TechCoords coords);
}