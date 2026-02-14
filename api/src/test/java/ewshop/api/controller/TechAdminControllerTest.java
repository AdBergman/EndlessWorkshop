package ewshop.api.controller;

import ewshop.api.TestApplication;
import ewshop.facade.dto.request.TechAdminDto;
import ewshop.facade.dto.response.TechCoordsDto;
import ewshop.facade.interfaces.TechAdminFacade;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TechAdminController.class)
@ContextConfiguration(classes = TestApplication.class)
class TechAdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TechAdminFacade techAdminFacade;

    @Test
    void applyPlacementUpdates_returnsNoContent() throws Exception {
        TechAdminDto dto = new TechAdminDto(
                "Tech_Stonework",
                "Stonework",
                2,
                "DEFENSE",
                new TechCoordsDto(12.5, 42.0)
        );

        List<TechAdminDto> payload = List.of(dto);

        mockMvc.perform(post("/api/admin/techs/placements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isNoContent());

        verify(techAdminFacade).applyPlacementUpdates(payload);
    }
}