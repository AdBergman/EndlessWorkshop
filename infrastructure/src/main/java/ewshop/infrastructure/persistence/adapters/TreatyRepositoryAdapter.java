package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.model.Treaty;
import ewshop.domain.repository.TreatyRepository;
import ewshop.infrastructure.persistence.entities.TreatyEntity;
import ewshop.infrastructure.persistence.mappers.TreatyMapper;
import ewshop.infrastructure.persistence.repositories.TreatyJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * The adapter that implements the domain's repository port using Spring Data JPA.
 */
@Repository
public class TreatyRepositoryAdapter implements TreatyRepository {

    private final TreatyJpaRepository treatyJpaRepository;
    private final TreatyMapper treatyMapper;

    public TreatyRepositoryAdapter(TreatyJpaRepository treatyJpaRepository, TreatyMapper treatyMapper) {
        this.treatyJpaRepository = treatyJpaRepository;
        this.treatyMapper = treatyMapper;
    }

    @Override
    public Treaty save(Treaty treaty) {
        TreatyEntity treatyEntity = treatyMapper.toEntity(treaty);
        TreatyEntity savedEntity = treatyJpaRepository.save(treatyEntity);
        return treatyMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Treaty> findByName(String name) {
        return treatyJpaRepository.findByName(name)
                .map(treatyMapper::toDomain);
    }
}
