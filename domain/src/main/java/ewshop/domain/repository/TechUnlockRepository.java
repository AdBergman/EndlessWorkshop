package ewshop.domain.repository;

import ewshop.domain.entity.Tech;
import ewshop.domain.entity.TechUnlock;

import java.util.List;

/**
 * Domain port for managing TechUnlock entities.
 */
public interface TechUnlockRepository {

    /**
     * Replaces all existing unlocks for a given technology with a new set of unlocks.
     * This operation is transactional and idempotent.
     *
     * @param tech    The domain object of the tech to update.
     * @param unlocks A list of domain TechUnlock objects representing the new set of unlocks.
     */
    void updateUnlocksForTech(Tech tech, List<TechUnlock> unlocks);
}
