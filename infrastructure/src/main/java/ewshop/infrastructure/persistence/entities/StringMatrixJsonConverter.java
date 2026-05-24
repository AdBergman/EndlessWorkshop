package ewshop.infrastructure.persistence.entities;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Converter
public class StringMatrixJsonConverter implements AttributeConverter<List<List<String>>, String> {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final TypeReference<List<List<String>>> STRING_MATRIX = new TypeReference<>() {};

    @Override
    public String convertToDatabaseColumn(List<List<String>> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }

        try {
            return OBJECT_MAPPER.writeValueAsString(attribute);
        } catch (JsonProcessingException ex) {
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
        } catch (IOException ex) {
            throw new IllegalArgumentException("Unable to decode JSON string matrix", ex);
        }
    }
}
