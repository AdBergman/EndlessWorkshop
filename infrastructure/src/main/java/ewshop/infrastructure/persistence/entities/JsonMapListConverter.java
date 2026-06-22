package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Converter
public class JsonMapListConverter implements AttributeConverter<List<Map<String, Object>>, String> {
    private static final ObjectMapper OBJECT_MAPPER = new JsonMapper();
    private static final TypeReference<List<Map<String, Object>>> MAP_LIST = new TypeReference<>() {};

    @Override
    public String convertToDatabaseColumn(List<Map<String, Object>> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }

        try {
            return OBJECT_MAPPER.writeValueAsString(attribute);
        } catch (JacksonException ex) {
            throw new IllegalArgumentException("Unable to encode JSON map list", ex);
        }
    }

    @Override
    public List<Map<String, Object>> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return new ArrayList<>();
        }

        try {
            return new ArrayList<>(OBJECT_MAPPER.readValue(dbData, MAP_LIST));
        } catch (JacksonException ex) {
            throw new IllegalArgumentException("Unable to decode JSON map list", ex);
        }
    }
}
