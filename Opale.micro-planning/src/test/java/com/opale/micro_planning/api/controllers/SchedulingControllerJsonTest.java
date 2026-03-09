package com.opale.micro_planning.api.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.opale.micro_planning.app.dtos.SchedulingRequest;
import com.opale.micro_planning.app.dtos.SchedulingResult;

import com.opale.micro_planning.app.services.ExcelExportService;
import com.opale.micro_planning.infra_json.services.JsonAccessDataService;
import com.opale.micro_planning.infra_json.services.JsonSchedulingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SchedulingController.class)
@ActiveProfiles("test")
class SchedulingControllerJsonTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JsonSchedulingService jsonSchedulingService;

    @MockBean
    private JsonAccessDataService jsonAccessDataService;

    @MockBean
    private ExcelExportService excelExportService;

    // Note: We don't need to mock SchedulingService since we're only testing JSON endpoints

    @Test
    void jsonSchedule_WithValidRequest_ReturnsSuccess() throws Exception {
        // Given
        SchedulingRequest request = new SchedulingRequest(
            UUID.fromString("22222222-2222-2222-2222-222222222221"), // ING1 promotion ID
            LocalDate.of(2024, 1, 8),
            LocalDate.of(2024, 1, 12)
        );

        SchedulingResult expectedResult = new SchedulingResult(
            UUID.randomUUID(),
            true,
            null,
            5,
            "Scheduling completed successfully"
        );

        when(jsonSchedulingService.schedulePromotion(any(SchedulingRequest.class))).thenReturn(expectedResult);

        // When & Then
        mockMvc.perform(post("/api/scheduling/json/schedule")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Scheduling completed successfully"));
    }

    @Test
    void jsonScheduleExport_WithValidRequest_ReturnsExcelFile() throws Exception {
        // Given
        SchedulingRequest request = new SchedulingRequest(
            UUID.fromString("22222222-2222-2222-2222-222222222221"),
            LocalDate.of(2024, 1, 8),
            LocalDate.of(2024, 1, 12)
        );

        SchedulingResult successfulResult = new SchedulingResult(
            UUID.randomUUID(),
            true,
            null,
            3,
            "Scheduling completed successfully"
        );

        byte[] excelData = "fake excel data".getBytes();

        when(jsonSchedulingService.schedulePromotion(any(SchedulingRequest.class))).thenReturn(successfulResult);
        when(excelExportService.exportScheduleToExcel(any(SchedulingResult.class), any(String.class)))
            .thenReturn(excelData);

        // When & Then
        mockMvc.perform(post("/api/scheduling/json/schedule/export")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(header().exists("Content-Disposition"))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("json_schedule")))
                .andExpect(header().string("Content-Type", "application/octet-stream"))
                .andExpect(content().bytes(excelData));
    }

    @Test
    void jsonScheduleExport_WithFailedScheduling_ReturnsBadRequest() throws Exception {
        // Given
        SchedulingRequest request = new SchedulingRequest(
            UUID.fromString("22222222-2222-2222-2222-222222222221"),
            LocalDate.of(2024, 1, 8),
            LocalDate.of(2024, 1, 12)
        );

        SchedulingResult failedResult = new SchedulingResult(
            null, false, null, 0, "No feasible schedule found");

        when(jsonSchedulingService.schedulePromotion(any(SchedulingRequest.class))).thenReturn(failedResult);

        // When & Then
        mockMvc.perform(post("/api/scheduling/json/schedule/export")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
