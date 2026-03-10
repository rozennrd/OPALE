package com.opale.micro_planning.api.controllers;

import com.opale.micro_planning.app.dtos.SchedulingRequest;
import com.opale.micro_planning.app.dtos.SchedulingResult;
import com.opale.micro_planning.app.services.SchedulingService;
import com.opale.micro_planning.infra_json.services.JsonSchedulingService;
import com.opale.micro_planning.app.services.ExcelExportService;
import com.opale.micro_planning.infra_json.services.JsonAccessDataService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SchedulingControllerTest {

    @Mock
    private SchedulingService schedulingService;

    @Mock
    private JsonSchedulingService jsonSchedulingService;

    @Mock
    private JsonAccessDataService jsonAccessDataService;

    @Mock
    private ExcelExportService excelExportService;

    private SchedulingController controller;

    @BeforeEach
    void setUp() {
        controller = new SchedulingController(jsonSchedulingService, jsonAccessDataService, excelExportService, schedulingService);
    }

    @Test
    void schedulePromotion_WithValidRequest_ReturnsSuccess() {
        // Given
        SchedulingRequest request = createTestRequest();
        SchedulingResult expectedResult = createSuccessfulResult();

        when(schedulingService.schedulePromotion(request)).thenReturn(expectedResult);

        // When
        ResponseEntity<SchedulingResult> response = controller.schedulePromotion(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedResult, response.getBody());
    }

    @Test
    void scheduleAndExportPromotion_WithValidRequest_ReturnsExcelFile() {
        // Given
        SchedulingRequest request = createTestRequest();
        SchedulingResult successfulResult = createSuccessfulResult();
        byte[] excelData = "fake excel data".getBytes();

        when(schedulingService.schedulePromotion(request)).thenReturn(successfulResult);
        when(excelExportService.exportScheduleToExcel(eq(successfulResult), any(String.class)))
            .thenReturn(excelData);

        // When
        ResponseEntity<byte[]> response = controller.scheduleAndExportPromotion(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().length > 0);
        String contentDisposition = response.getHeaders().getFirst("Content-Disposition");
        assertTrue(contentDisposition.startsWith("attachment; filename=\"schedule_Promotion_" + request.getPromotionId()));
        assertTrue(contentDisposition.contains(".xlsx\""));
        assertEquals("application/octet-stream", response.getHeaders().getContentType().toString());
    }

    @Test
    void scheduleAndExportPromotion_WithFailedScheduling_ReturnsBadRequest() {
        // Given
        SchedulingRequest request = createTestRequest();
        SchedulingResult failedResult = new SchedulingResult(
            null, false, null, 0, "Scheduling failed");

        when(schedulingService.schedulePromotion(request)).thenReturn(failedResult);

        // When
        ResponseEntity<byte[]> response = controller.scheduleAndExportPromotion(request);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void health_ReturnsOkResponse() {
        // When
        ResponseEntity<String> response = controller.health();

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Scheduling service is running", response.getBody());
    }

    private SchedulingRequest createTestRequest() {
        return new SchedulingRequest(
            UUID.randomUUID(),
            LocalDate.of(2024, 1, 8),
            LocalDate.of(2024, 1, 12)
        );
    }

    private SchedulingResult createSuccessfulResult() {
        return new SchedulingResult(
            UUID.randomUUID(),
            true,
            null, // Simplified for test
            5,
            "Scheduling completed successfully"
        );
    }
}
