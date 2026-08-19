package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.util.LinkedHashMap;
import java.util.Map;

@Converter
public class JsonMapConverter implements AttributeConverter<Map<String, Object>, String> {
    private static final ObjectMapper OBJECT_MAPPER = new JsonMapper();
    private static final TypeReference<Map<String, Object>> MAP = new TypeReference<>() {};

    @Override
    public String convertToDatabaseColumn(Map<String, Object> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }

        try {
            return OBJECT_MAPPER.writeValueAsString(attribute);
        } catch (JacksonException ex) {
            throw new IllegalArgumentException("Unable to encode JSON map", ex);
        }
    }

    @Override
    public Map<String, Object> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return new LinkedHashMap<>();
        }

        try {
            return new LinkedHashMap<>(OBJECT_MAPPER.readValue(dbData, MAP));
        } catch (JacksonException ex) {
            throw new IllegalArgumentException("Unable to decode JSON map", ex);
        }
    }
}
