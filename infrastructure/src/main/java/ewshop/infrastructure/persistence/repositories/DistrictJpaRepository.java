package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.DistrictEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DistrictJpaRepository extends JpaRepository<DistrictEntity, Long> {

    Optional<DistrictEntity> findByDistrictKey(String districtKey);

    List<DistrictEntity> findAllByDistrictKeyIn(List<String> districtKeys);

    List<DistrictEntity> findAllByDistrictKeyNotIn(List<String> districtKeys);

    @Modifying
    @Query("delete from DistrictEntity d where d.districtKey not in :keepKeys")
    int deleteByDistrictKeyNotIn(@Param("keepKeys") List<String> keepKeys);
}