package ewshop.domain.command;

import java.util.List;

public final class DistrictImportSnapshot {

    private final String districtKey;
    private final String displayName;
    private final String category;
    private final List<String> descriptionLines;

    public DistrictImportSnapshot(
            String districtKey,
            String displayName,
            String category,
            List<String> descriptionLines
    ) {
        this.districtKey = districtKey;
        this.displayName = displayName;
        this.category = category;
        this.descriptionLines = descriptionLines;
    }

    public String districtKey() { return districtKey; }
    public String displayName() { return displayName; }
    public String category() { return category; }
    public List<String> descriptionLines() { return descriptionLines; }
}