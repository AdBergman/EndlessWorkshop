package ewshop.infrastructure.persistence.entities;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StringJsonConverterTest {

    private final StringListJsonConverter listConverter = new StringListJsonConverter();
    private final StringMatrixJsonConverter matrixConverter = new StringMatrixJsonConverter();

    @Test
    void stringListConverter_writesNullForNullOrEmptyLists() {
        assertThat(listConverter.convertToDatabaseColumn(null)).isNull();
        assertThat(listConverter.convertToDatabaseColumn(List.of())).isNull();
    }

    @Test
    void stringListConverter_roundtripsStringsAndEscaping() {
        String dbValue = listConverter.convertToDatabaseColumn(List.of("plain", "quote \" value", "slash \\ value"));

        assertThat(dbValue).isEqualTo("[\"plain\",\"quote \\\" value\",\"slash \\\\ value\"]");
        assertThat(listConverter.convertToEntityAttribute(dbValue))
                .containsExactly("plain", "quote \" value", "slash \\ value");
    }

    @Test
    void stringListConverter_readsNullOrBlankAsEmptyList() {
        assertThat(listConverter.convertToEntityAttribute(null)).isEmpty();
        assertThat(listConverter.convertToEntityAttribute(" ")).isEmpty();
    }

    @Test
    void stringListConverter_rejectsInvalidJson() {
        assertThatThrownBy(() -> listConverter.convertToEntityAttribute("{not-json"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unable to decode JSON string list");
    }

    @Test
    void stringMatrixConverter_writesNullForNullOrEmptyLists() {
        assertThat(matrixConverter.convertToDatabaseColumn(null)).isNull();
        assertThat(matrixConverter.convertToDatabaseColumn(List.of())).isNull();
    }

    @Test
    void stringMatrixConverter_roundtripsNestedStringsAndEscaping() {
        String dbValue = matrixConverter.convertToDatabaseColumn(List.of(
                List.of("left", "right"),
                List.of("quote \" value", "slash \\ value")
        ));

        assertThat(dbValue).isEqualTo("[[\"left\",\"right\"],[\"quote \\\" value\",\"slash \\\\ value\"]]");
        assertThat(matrixConverter.convertToEntityAttribute(dbValue))
                .containsExactly(
                        List.of("left", "right"),
                        List.of("quote \" value", "slash \\ value")
                );
    }

    @Test
    void stringMatrixConverter_readsNullOrBlankAsEmptyList() {
        assertThat(matrixConverter.convertToEntityAttribute(null)).isEmpty();
        assertThat(matrixConverter.convertToEntityAttribute(" ")).isEmpty();
    }

    @Test
    void stringMatrixConverter_rejectsInvalidJson() {
        assertThatThrownBy(() -> matrixConverter.convertToEntityAttribute("{not-json"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unable to decode JSON string matrix");
    }
}
