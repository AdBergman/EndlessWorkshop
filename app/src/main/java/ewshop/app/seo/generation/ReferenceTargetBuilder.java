package ewshop.app.seo.generation;

import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class ReferenceTargetBuilder {

    public Map<String, ReferenceTarget> buildReferenceTargets(List<PageCandidate> candidates) {
        LinkedHashMap<String, ReferenceTarget> targetsByEntryKey = new LinkedHashMap<>();
        for (PageCandidate candidate : candidates) {
            String entryKey = trimToEmpty(candidate.entryKey());
            if (entryKey.isBlank()) {
                continue;
            }

            targetsByEntryKey.putIfAbsent(
                    entryKey,
                    new ReferenceTarget(
                            candidate.displayName(),
                            candidate.canonicalRoute()
                    )
            );
        }
        return Map.copyOf(targetsByEntryKey);
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
