package ewshop.facade.mapper;

import ewshop.domain.command.TechPlacementUpdate;
import ewshop.domain.model.enums.TechType;
import ewshop.facade.dto.request.TechAdminDto;
import ewshop.facade.dto.response.TechCoordsDto;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TechAdminMapperTest {

    @Test
    void toDomain_shouldReturnNull_whenInputIsNull() {
        assertThat(TechAdminMapper.toDomain(null)).isNull();
    }

    @Test
    void toDomain_shouldMapValidDto_andNormalizeType() {
        TechAdminDto dto = TechAdminDto.builder()
                .techKey("Tech_Stonework")
                .name("Stonework")
                .era(2)
                .type("Defense")
                .coords(new TechCoordsDto(55.5, 66.6))
                .build();

        TechPlacementUpdate update = TechAdminMapper.toDomain(dto);

        assertThat(update).isNotNull();
        assertThat(update.techKey()).isEqualTo("Tech_Stonework");
        assertThat(update.name()).isEqualTo("Stonework");
        assertThat(update.era()).isEqualTo(2);
        assertThat(update.type()).isEqualTo(TechType.DEFENSE);
        assertThat(update.coords().getXPct()).isEqualTo(55.5);
        assertThat(update.coords().getYPct()).isEqualTo(66.6);
    }

    @Test
    void toDomain_shouldTrimName_viaDomainValidation() {
        TechAdminDto dto = TechAdminDto.builder()
                .techKey("Tech_Stonework")
                .name("   Stonework   ")
                .era(2)
                .type("Defense")
                .coords(new TechCoordsDto(1.0, 2.0))
                .build();

        TechPlacementUpdate update = TechAdminMapper.toDomain(dto);

        assertThat(update.name()).isEqualTo("Stonework");
    }

    @Test
    void toDomain_shouldAllowNullOrBlankName_forNow() {
        TechAdminDto nullName = TechAdminDto.builder()
                .techKey("Tech_Stonework")
                .name(null)
                .era(2)
                .type("Defense")
                .coords(new TechCoordsDto(1.0, 2.0))
                .build();

        TechAdminDto blankName = TechAdminDto.builder()
                .techKey("Tech_Stonework")
                .name("   ")
                .era(2)
                .type("Defense")
                .coords(new TechCoordsDto(1.0, 2.0))
                .build();

        TechPlacementUpdate u1 = TechAdminMapper.toDomain(nullName);
        TechPlacementUpdate u2 = TechAdminMapper.toDomain(blankName);

        assertThat(u1).isNotNull();
        assertThat(u1.techKey()).isEqualTo("Tech_Stonework");

        assertThat(u2).isNotNull();
        assertThat(u2.techKey()).isEqualTo("Tech_Stonework");
    }

    @Test
    void toDomain_shouldThrow_whenTechKeyIsNullOrBlank() {
        TechAdminDto nullKey = TechAdminDto.builder()
                .techKey(null)
                .name("Stonework")
                .era(2)
                .type("Defense")
                .coords(new TechCoordsDto(1.0, 2.0))
                .build();

        TechAdminDto blankKey = TechAdminDto.builder()
                .techKey("   ")
                .name("Stonework")
                .era(2)
                .type("Defense")
                .coords(new TechCoordsDto(1.0, 2.0))
                .build();

        assertThatThrownBy(() -> TechAdminMapper.toDomain(nullKey))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("TechPlacementUpdate.techKey is required");

        assertThatThrownBy(() -> TechAdminMapper.toDomain(blankKey))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("TechPlacementUpdate.techKey is required");
    }

    @Test
    void toDomain_shouldThrow_whenTypeIsNullOrBlank() {
        TechAdminDto nullType = TechAdminDto.builder()
                .techKey("Tech_Stonework")
                .name("Stonework")
                .era(2)
                .type(null)
                .coords(new TechCoordsDto(1.0, 2.0))
                .build();

        TechAdminDto blankType = TechAdminDto.builder()
                .techKey("Tech_Stonework")
                .name("Stonework")
                .era(2)
                .type("   ")
                .coords(new TechCoordsDto(1.0, 2.0))
                .build();

        assertThatThrownBy(() -> TechAdminMapper.toDomain(nullType))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("TechPlacementUpdate.type is required");

        assertThatThrownBy(() -> TechAdminMapper.toDomain(blankType))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("TechPlacementUpdate.type is required");
    }

    @Test
    void toDomain_shouldThrow_whenCoordsIsNull() {
        TechAdminDto dto = TechAdminDto.builder()
                .techKey("Tech_Stonework")
                .name("Stonework")
                .era(2)
                .type("Defense")
                .coords(null)
                .build();

        assertThatThrownBy(() -> TechAdminMapper.toDomain(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("TechPlacementUpdate.coords is required");
    }

    @Test
    void toDomain_shouldThrow_whenEraOutOfRange() {
        TechAdminDto tooLow = TechAdminDto.builder()
                .techKey("Tech_Stonework")
                .name("Stonework")
                .era(0)
                .type("Defense")
                .coords(new TechCoordsDto(1.0, 2.0))
                .build();

        TechAdminDto tooHigh = TechAdminDto.builder()
                .techKey("Tech_Stonework")
                .name("Stonework")
                .era(7)
                .type("Defense")
                .coords(new TechCoordsDto(1.0, 2.0))
                .build();

        assertThatThrownBy(() -> TechAdminMapper.toDomain(tooLow))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("TechPlacementUpdate.era must be between 1 and 6 (got: 0)");

        assertThatThrownBy(() -> TechAdminMapper.toDomain(tooHigh))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("TechPlacementUpdate.era must be between 1 and 6 (got: 7)");
    }

    @Test
    void toDomain_shouldThrow_whenTypeDoesNotMatchEnum() {
        TechAdminDto dto = TechAdminDto.builder()
                .techKey("Tech_Stonework")
                .name("Stonework")
                .era(2)
                .type("NotARealType")
                .coords(new TechCoordsDto(1.0, 2.0))
                .build();

        assertThatThrownBy(() -> TechAdminMapper.toDomain(dto))
                .isInstanceOf(IllegalArgumentException.class);
    }
}