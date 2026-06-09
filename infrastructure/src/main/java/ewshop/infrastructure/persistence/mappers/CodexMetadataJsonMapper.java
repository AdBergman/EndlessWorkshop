package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.CodexMetadataFact;
import ewshop.domain.model.CodexMetadataSection;
import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;

public final class CodexMetadataJsonMapper {

    private static final ObjectMapper OBJECT_MAPPER = new JsonMapper();
    private static final TypeReference<List<CodexMetadataFact>> FACT_LIST = new TypeReference<>() {};
    private static final TypeReference<List<CodexMetadataSection>> SECTION_LIST = new TypeReference<>() {};

    private CodexMetadataJsonMapper() {}

    public static String encodeFacts(List<CodexMetadataFact> facts) {
        return encode(facts, "facts");
    }

    public static String encodeSections(List<CodexMetadataSection> sections) {
        return encode(sections, "sections");
    }

    public static List<CodexMetadataFact> decodeFacts(String json) {
        return decode(json, FACT_LIST, "facts");
    }

    public static List<CodexMetadataSection> decodeSections(String json) {
        return decode(json, SECTION_LIST, "sections");
    }

    private static String encode(List<?> values, String label) {
        if (values == null || values.isEmpty()) return null;

        try {
            return OBJECT_MAPPER.writeValueAsString(values);
        } catch (JacksonException ex) {
            throw new IllegalArgumentException("Unable to encode codex " + label + " metadata", ex);
        }
    }

    private static <T> List<T> decode(String json, TypeReference<List<T>> type, String label) {
        if (json == null || json.isBlank()) return List.of();

        try {
            return List.copyOf(OBJECT_MAPPER.readValue(json, type));
        } catch (JacksonException ex) {
            throw new IllegalArgumentException("Unable to decode codex " + label + " metadata", ex);
        }
    }
}
