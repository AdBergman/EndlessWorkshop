package ewshop.facade.mapper;

import ewshop.domain.command.DistrictImportSnapshot;
import ewshop.facade.dto.importing.districts.DistrictImportDistrictDto;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public final class DistrictImportMapper {

    private DistrictImportMapper() {}

    public static DistrictImportSnapshot toSnapshot(DistrictImportDistrictDto dto) {
        if (dto == null) throw new IllegalArgumentException("District row is null");

        String key = trimToNull(dto.districtKey());
        if (key == null) throw new IllegalArgumentException("districtKey is missing");

        String name = trimToNull(dto.displayName());
        if (name == null) throw new IllegalArgumentException("displayName is missing for " + key);

        String category = trimToNull(dto.category());

        List<String> descriptionLines = cleanLines(dto.descriptionLines());

        return new DistrictImportSnapshot(key, name, category, descriptionLines);
    }

    private static String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static List<String> cleanLines(List<String> in) {
        if (in == null || in.isEmpty()) return List.of();

        List<String> out = new ArrayList<>(in.size());
        for (String line : in) {
            if (line == null) continue;
            String t = line.trim();
            if (t.isBlank()) continue;
            out.add(t);
        }
        return out;
    }
}