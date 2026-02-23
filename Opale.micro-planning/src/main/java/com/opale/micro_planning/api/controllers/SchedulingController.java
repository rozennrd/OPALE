package com.opale.micro_planning.api.controllers;

import com.opale.micro_planning.app.dtos.SchedulingRequest;
import com.opale.micro_planning.app.dtos.SchedulingResult;
import com.opale.micro_planning.app.services.SchedulingService;
import com.opale.micro_planning.app.services.ExcelExportService;
import com.opale.micro_planning.infra_json.services.JsonAccessDataService;
import com.opale.micro_planning.infra_json.services.JsonSchedulingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * REST Controller for scheduling operations and Excel export
 */
@RestController
@RequestMapping("/api/scheduling")
@CrossOrigin(origins = "*") // Configure as needed for your frontend
public class SchedulingController {

    private SchedulingService schedulingService;
    private final JsonSchedulingService jsonSchedulingService;
    private final JsonAccessDataService jsonAccessDataService;
    private final ExcelExportService excelExportService;

    @Autowired
    public SchedulingController(JsonSchedulingService jsonSchedulingService,
                              JsonAccessDataService jsonAccessDataService,
                              ExcelExportService excelExportService,
                              @Autowired(required = false) SchedulingService schedulingService) {
        this.jsonSchedulingService = jsonSchedulingService;
        this.jsonAccessDataService = jsonAccessDataService;
        this.excelExportService = excelExportService;
        this.schedulingService = schedulingService;
    }

    /**
     * Generate a schedule for a promotion and return it as JSON
     */
    @PostMapping("/schedule")
    public ResponseEntity<SchedulingResult> schedulePromotion(@RequestBody SchedulingRequest request) {
        if (schedulingService == null) {
            return ResponseEntity.status(503)
                .body(new SchedulingResult(null, false, null, 0, "Database scheduling service not available"));
        }
        SchedulingResult result = schedulingService.schedulePromotion(request);
        return ResponseEntity.ok(result);
    }

    /**
     * Generate a schedule for a promotion and export it as Excel file
     */
    @PostMapping("/schedule/export")
    public ResponseEntity<byte[]> scheduleAndExportPromotion(@RequestBody SchedulingRequest request) {
        if (schedulingService == null) {
            return ResponseEntity.status(503)
                .contentType(MediaType.APPLICATION_JSON)
                .body("Database scheduling service not available".getBytes());
        }
        // First, generate the schedule
        SchedulingResult result = schedulingService.schedulePromotion(request);

        // If scheduling failed, return error
        if (!result.isSuccess()) {
            return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body(result.getMessage().getBytes());
        }

        // Generate Excel export
        String promotionName = "Promotion_" + request.getPromotionId(); // You might want to get the actual name from DB
        byte[] excelData = excelExportService.exportScheduleToExcel(result, promotionName);

        // Generate filename with timestamp
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = String.format("schedule_%s_%s.xlsx", promotionName, timestamp);

        // Return Excel file as downloadable response
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(excelData.length))
            .body(excelData);
    }

    /**
     * Generate a schedule for a promotion using JSON mock data and return it as JSON
     */
    @PostMapping("/json/schedule")
    public ResponseEntity<SchedulingResult> schedulePromotionWithJson(@RequestBody SchedulingRequest request) {
        SchedulingResult result = jsonSchedulingService.schedulePromotion(request);
        return ResponseEntity.ok(result);
    }

    /**
     * Generate a schedule for a promotion using JSON mock data and export it as Excel file
     */
    @PostMapping("/json/schedule/export")
    public ResponseEntity<byte[]> scheduleAndExportPromotionWithJson(@RequestBody SchedulingRequest request) {
        // First, generate the schedule using JSON data
        SchedulingResult result = jsonSchedulingService.schedulePromotion(request);

        // If scheduling failed, return error
        if (!result.isSuccess()) {
            return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body(result.getMessage().getBytes());
        }

        // Generate Excel export
        String promotionName = "Promotion_" + request.getPromotionId();
        byte[] excelData = excelExportService.exportScheduleToExcel(result, promotionName);

        // Generate filename with timestamp
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = String.format("json_schedule_%s_%s.xlsx", promotionName, timestamp);

        // Return Excel file as downloadable response
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(excelData.length))
            .body(excelData);
    }

    /**
     * Test endpoint to check JSON data loading
     */
    @GetMapping("/json/test-data")
    public ResponseEntity<String> testJsonData() {
        try {
            var promotionId = UUID.fromString("22222222-2222-2222-2222-222222222221");
            var matieres = jsonAccessDataService.getMatieresByPromotion(promotionId);
            var enseignements = jsonAccessDataService.getEnseignementsByPromotion(promotionId);
            var salles = jsonAccessDataService.getAllSalles();

            return ResponseEntity.ok(String.format(
                "Matieres: %d, Enseignements: %d, Salles: %d",
                matieres.size(), enseignements.size(), salles.size()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Scheduling service is running");
    }
}
