package ewshop.domain.repository;

import ewshop.domain.model.Tech;
import ewshop.domain.model.TechUnlock;

import java.util.List;

public interface TechUnlockRepository {

    /**
     * Replaces all existing unlocks for a given technology with a new set of unlocks.
     */
    void updateUnlocksForTech(Tech tech, List<TechUnlock> unlocks);
}
