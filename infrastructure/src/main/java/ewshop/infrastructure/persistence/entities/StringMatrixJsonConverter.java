package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.util.ArrayList;
import java.util.List;

@Converter
public class StringMatrixJsonConverter implements AttributeConverter<List<List<String>>, String> {
    private static final ObjectMapper OBJECT_MAPPER = new JsonMapper();
    private static final TypeReference<List<List<String>>> STRING_MATRIX = new TypeReference<>() {};

    @Override
    public String convertToDatabaseColumn(List<List<String>> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }

        try {
            return OBJECT_MAPPER.writeValueAsString(attribute);
        } catch (JacksonException ex) {
            throw new IllegalArgumentException("Unable to encode string matrix as JSON", ex);
        }
    }

    @Override
    public List<List<String>> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return new ArrayList<>();
        }

        try {
            return new ArrayList<>(OBJECT_MAPPER.readValue(dbData, STRING_MATRIX));
        } catch (JacksonException ex) {
            throw new IllegalArgumentException("Unable to decode JSON string matrix", ex);
        }
    }
}
