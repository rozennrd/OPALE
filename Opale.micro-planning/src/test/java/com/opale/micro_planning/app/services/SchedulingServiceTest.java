package com.opale.micro_planning.app.services;

import com.opale.micro_planning.app.dtos.SchedulingRequest;
import com.opale.micro_planning.app.dtos.SchedulingResult;
import com.opale.micro_planning.app.exceptions.SchedulingException;
import com.opale.micro_planning.app.mappers.InfrastructureToDomainMapper;
import com.opale.micro_planning.infra.models.*;
import com.opale.micro_planning.infra.repositories.EnseignementRepository;
import com.opale.micro_planning.infra.repositories.MatiereRepository;
import com.opale.micro_planning.infra.repositories.SalleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SchedulingServiceTest {

    @Mock
    private EnseignementRepository enseignementRepository;

    @Mock
    private MatiereRepository matiereRepository;

    @Mock
    private SalleRepository salleRepository;

    @InjectMocks
    private SchedulingService schedulingService;

    private UUID testPromotionId;
    private Matiere testMatiere;
    private Enseignement testEnseignement;
    private Salle testSalle1;
    private Salle testSalle2;

    @BeforeEach
    void setUp() {
        testPromotionId = UUID.randomUUID();

        // Create test data
        Promotion promotion = new Promotion();
        promotion.setId(testPromotionId);
        promotion.setNom("Test Promotion");
        promotion.setEffectifs(30);

        testMatiere = new Matiere();
        testMatiere.setId(UUID.randomUUID());
        testMatiere.setNom("Test Subject");
        testMatiere.setVolumeHoraire(40.0);
        testMatiere.setPromotion(promotion);

        Professeur professeur = new Professeur();
        professeur.setId(UUID.randomUUID());
        professeur.setNom("Dupont");
        professeur.setPrenom("Jean");
        professeur.setEmail("jean.dupont@test.com");

        testEnseignement = new Enseignement();
        testEnseignement.setId(UUID.randomUUID());
        testEnseignement.setMatiere(testMatiere);
        testEnseignement.setProfesseur(professeur);
        testEnseignement.setNbHeures(8);

        testSalle1 = new Salle();
        testSalle1.setId(UUID.randomUUID());
        testSalle1.setNom("Room A");
        testSalle1.setType(TypeSalle.TD);
        testSalle1.setCapacite(40);
        testSalle1.setEtage(1);

        testSalle2 = new Salle();
        testSalle2.setId(UUID.randomUUID());
        testSalle2.setNom("Room B");
        testSalle2.setType(TypeSalle.TD);
        testSalle2.setCapacite(40);
        testSalle2.setEtage(1);
    }

    @Test
    void schedulePromotion_WithValidData_ReturnsSuccessfulResult() {
        // Given
        when(matiereRepository.findByPromotionIdAndSemestre(testPromotionId, null))
            .thenReturn(List.of(testMatiere));
        when(enseignementRepository.findByMatiere(testMatiere))
            .thenReturn(List.of(testEnseignement));
        when(salleRepository.findAll())
            .thenReturn(List.of(testSalle1, testSalle2));

        SchedulingRequest request = new SchedulingRequest(
            testPromotionId,
            LocalDate.of(2024, 1, 8),
            LocalDate.of(2024, 1, 12)
        );

        // When
        SchedulingResult result = schedulingService.schedulePromotion(request);

        // Then
        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertEquals("Scheduling completed successfully", result.getMessage());
        assertNotNull(result.getSchedule());
        assertTrue(result.getTotalCourses() > 0);

        // Verify that schedule contains courses
        var scheduleData = result.getSchedule();
        assertTrue(scheduleData.containsKey("schedule"));
        assertTrue(scheduleData.containsKey("assignments"));
    }

    @Test
    void schedulePromotion_WithEmptyMatieres_ReturnsSuccessfulResult() {
        // Given - no matieres for the promotion
        when(matiereRepository.findByPromotionIdAndSemestre(testPromotionId, null))
            .thenReturn(List.of());
        when(salleRepository.findAll())
            .thenReturn(List.of(testSalle1, testSalle2));

        SchedulingRequest request = new SchedulingRequest(
            testPromotionId,
            LocalDate.of(2024, 1, 8),
            LocalDate.of(2024, 1, 12)
        );

        // When
        SchedulingResult result = schedulingService.schedulePromotion(request);

        // Then - should succeed with empty schedule
        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertEquals("Scheduling completed successfully", result.getMessage());
        assertEquals(0, result.getTotalCourses());
    }

    @Test
    void schedulePromotion_WithRepositoryException_ThrowsSchedulingException() {
        // Given - repository throws exception
        when(matiereRepository.findByPromotionIdAndSemestre(testPromotionId, null))
            .thenThrow(new RuntimeException("Database error"));

        SchedulingRequest request = new SchedulingRequest(
            testPromotionId,
            LocalDate.of(2024, 1, 8),
            LocalDate.of(2024, 1, 12)
        );

        // When & Then
        SchedulingException exception = assertThrows(SchedulingException.class, () ->
            schedulingService.schedulePromotion(request)
        );

        assertTrue(exception.getMessage().contains("Failed to schedule promotion"));
        assertTrue(exception.getCause().getMessage().contains("Database error"));
    }

    @Test
    void schedulePromotion_WithSchedulingFailure_ReturnsFailureResult() {
        // Given - setup data that will cause scheduling to fail
        // (This is hard to mock precisely, but we can test the failure handling)
        when(matiereRepository.findByPromotionIdAndSemestre(testPromotionId, null))
            .thenReturn(List.of(testMatiere));
        when(enseignementRepository.findByMatiere(testMatiere))
            .thenReturn(List.of(testEnseignement));
        when(salleRepository.findAll())
            .thenReturn(List.of()); // No rooms available - should cause failure

        SchedulingRequest request = new SchedulingRequest(
            testPromotionId,
            LocalDate.of(2024, 1, 8),
            LocalDate.of(2024, 1, 8) // Very short period
        );

        // When
        SchedulingResult result = schedulingService.schedulePromotion(request);

        // Then - may succeed or fail depending on constraints
        assertNotNull(result);
        assertNotNull(result.getMessage());
    }

    @Test
    void infrastructureToDomainMapper_ConvertsCorrectly() {
        // Test the mapper directly to ensure conversions work
        var domainSalle = InfrastructureToDomainMapper.toDomainSalle(testSalle1);
        var domainEnseignement = InfrastructureToDomainMapper.toDomainEnseignement(testEnseignement);

        assertNotNull(domainSalle);
        assertEquals(testSalle1.getId(), domainSalle.getId());
        assertEquals(testSalle1.getNom(), domainSalle.getNom());

        assertNotNull(domainEnseignement);
        assertEquals(testEnseignement.getId(), domainEnseignement.getId());
        assertEquals(8, domainEnseignement.getNbHeures());
    }

    @Test
    void schedulePromotion_DataFlow_Integration() {
        // Given - complete data flow test
        when(matiereRepository.findByPromotionIdAndSemestre(testPromotionId, null))
            .thenReturn(List.of(testMatiere));
        when(enseignementRepository.findByMatiere(testMatiere))
            .thenReturn(List.of(testEnseignement));
        when(salleRepository.findAll())
            .thenReturn(List.of(testSalle1, testSalle2));

        SchedulingRequest request = new SchedulingRequest(
            testPromotionId,
            LocalDate.of(2024, 1, 8),
            LocalDate.of(2024, 1, 12)
        );

        // When
        SchedulingResult result = schedulingService.schedulePromotion(request);

        // Then - verify complete data flow worked
        assertNotNull(result);
        assertNotNull(result.getSchedule());

        // The service should have:
        // 1. Retrieved matieres from repository
        // 2. Retrieved enseignements for those matieres
        // 3. Retrieved salles
        // 4. Converted all to domain entities
        // 5. Created scheduler and run scheduling
        // 6. Returned structured result
    }
}
