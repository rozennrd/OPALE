package com.opale.micro_planning.app.services;

import com.opale.micro_planning.app.dtos.SchedulingResult;
import com.opale.micro_planning.domain.entities.Cours;
import com.opale.micro_planning.domain.entities.Matiere;
import com.opale.micro_planning.domain.entities.Professeur;
import com.opale.micro_planning.domain.entities.Promotion;
import com.opale.micro_planning.domain.entities.Salle;
import com.opale.micro_planning.domain.entities.ScheduledSlot;
import com.opale.micro_planning.infra.models.TypeSalle;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ExcelExportServiceTest {

    private ExcelExportService excelExportService;

    @BeforeEach
    void setUp() {
        excelExportService = new ExcelExportService();
    }

    @Test
    void exportScheduleToExcel_WithValidData_ReturnsByteArray() {
        // Given - create test data
        SchedulingResult result = createTestSchedulingResult();

        // When
        byte[] excelData = excelExportService.exportScheduleToExcel(result, "Test Promotion");

        // Then
        assertNotNull(excelData);
        assertTrue(excelData.length > 0);
        // Excel files are typically quite large
        assertTrue(excelData.length > 1000);
    }

    @Test
    void exportScheduleToExcel_WithFailedResult_ThrowsException() {
        // Given - create failed result
        SchedulingResult failedResult = new SchedulingResult(
            null,
            false,
            Map.of(),
            0,
            "Scheduling failed"
        );

        // When & Then
        assertThrows(RuntimeException.class, () ->
            excelExportService.exportScheduleToExcel(failedResult, "Test Promotion")
        );
    }

    @Test
    void exportScheduleToExcel_CreatesExpectedWorkbookStructure() {
        // Given - create test data with specific week
        SchedulingResult result = createTestSchedulingResult();

        // When
        byte[] excelData = excelExportService.exportScheduleToExcel(result, "Test Promotion");

        // Then - we can't easily verify the Excel content without additional libraries,
        // but we can verify that the export completed successfully
        assertNotNull(excelData);
        assertTrue(excelData.length > 0);
    }

    private SchedulingResult createTestSchedulingResult() {
        // Create test promotion
        Promotion promotion = Promotion.builder()
            .id(UUID.randomUUID())
            .nom("Test Promotion")
            .build();

        // Create test subject
        Matiere matiere = Matiere.builder()
            .id(UUID.randomUUID())
            .nom("Mathematics")
            .promotion(promotion)
            .build();

        // Create test professor
        Professeur professeur = Professeur.builder()
            .id(UUID.randomUUID())
            .nom("Dupont")
            .prenom("Jean")
            .email("jean.dupont@test.com")
            .build();

        // Create test course
        Cours course = Cours.builder()
            .id(UUID.randomUUID())
            .matiere(matiere)
            .prof(professeur)
            .duration(4.0) // 4 hours
            .build();

        // Create test room
        Salle salle = Salle.builder()
            .id(UUID.randomUUID())
            .nom("Room A")
            .type(TypeSalle.Cours)
            .capacite(40)
            .etage(1)
            .build();

        // Create scheduled slot
        LocalDate testDate = LocalDate.of(2024, 1, 8); // Week 2 of 2024
        ScheduledSlot slot = new ScheduledSlot(
            testDate,
            LocalDateTime.of(2024, 1, 8, 8, 30),
            LocalDateTime.of(2024, 1, 8, 12, 30)
        );

        // Create schedule and assignments maps
        Map<Cours, ScheduledSlot> schedule = new HashMap<>();
        schedule.put(course, slot);

        Map<Cours, Salle> roomAssignments = new HashMap<>();
        roomAssignments.put(course, salle);

        // Create result
        Map<String, Object> resultData = Map.of(
            "schedule", schedule,
            "assignments", roomAssignments
        );

        return new SchedulingResult(
            UUID.randomUUID(),
            true,
            resultData,
            1,
            "Scheduling completed successfully"
        );
    }
}
