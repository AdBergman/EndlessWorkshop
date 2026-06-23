package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.ImportRunEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ImportRunJpaRepository extends JpaRepository<ImportRunEntity, Long> {

    Optional<ImportRunEntity> findFirstByStatusOrderByCompletedAtUtcDescIdDesc(String status);

    Optional<ImportRunEntity> findFirstByOrderByCompletedAtUtcDescIdDesc();
}
