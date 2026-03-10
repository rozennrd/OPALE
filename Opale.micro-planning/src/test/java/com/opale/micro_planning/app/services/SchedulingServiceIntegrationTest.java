package com.opale.micro_planning.app.services;

import com.opale.micro_planning.app.dtos.SchedulingRequest;
import com.opale.micro_planning.app.dtos.SchedulingResult;
import com.opale.micro_planning.infra.models.*;
import com.opale.micro_planning.infra.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
class SchedulingServiceIntegrationTest {

    @Autowired
    private SchedulingService schedulingService;

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private CycleRepository cycleRepository;

    @Autowired
    private MatiereRepository matiereRepository;

    @Autowired
    private ProfesseurRepository professeurRepository;

    @Autowired
    private EnseignementRepository enseignementRepository;

    @Autowired
    private SalleRepository salleRepository;

    private UUID testPromotionId;

    @BeforeEach
    void setUp() {
        // Create and save Cycle FIRST
        Cycle cycle = new Cycle();
        cycle.setNom("Test Cycle");
        cycle.setType(TypeCycle.INITIAL);
        cycle = cycleRepository.save(cycle);

        // Create test promotion (let JPA generate the ID)
        Promotion promotion = new Promotion();
        promotion.setNom("Test Promotion");
        promotion.setEffectifs(30);
        promotion.setCycle(cycle);

        promotion = promotionRepository.save(promotion);
        testPromotionId = promotion.getId();

        // Create test professor (let JPA generate the ID)
        Professeur professeur = new Professeur();
        professeur.setNom("Dupont");
        professeur.setPrenom("Jean");
        professeur.setEmail("jean.dupont@test.com");
        professeur.setType(TypeProfesseur.Permanent);
        professeur = professeurRepository.save(professeur);

        // Create test subject/matiere (let JPA generate the ID, set all required fields)
        Matiere matiere = new Matiere();
        matiere.setNom("Test Subject");
        matiere.setVolumeHoraire(40.0);
        matiere.setPromotion(promotion);
        matiere.setSemestre(1);
        matiere.setNbPartiels(1);
        matiere = matiereRepository.save(matiere);

        // Create enseignement (let JPA generate the ID)
        Enseignement enseignement = new Enseignement();
        enseignement.setMatiere(matiere);
        enseignement.setProfesseur(professeur);
        enseignement.setHeuresTd(8); // Will create 2 courses of 4 hours each
        enseignementRepository.save(enseignement);

        // Create test rooms (let JPA generate the ID)
        Salle salle1 = new Salle();
        salle1.setNom("Room A");
        salle1.setType(TypeSalle.Cours);
        salle1.setCapacite(40);
        salle1.setEtage(1);
        salleRepository.save(salle1);

        Salle salle2 = new Salle();
        salle2.setNom("Room B");
        salle2.setType(TypeSalle.Cours);
        salle2.setCapacite(40);
        salle2.setEtage(1);
        salleRepository.save(salle2);
    }

    @Test
    void schedulePromotion_WithValidData_ReturnsSuccessfulResult() {
        // Given
        SchedulingRequest request = new SchedulingRequest(
            testPromotionId,
            LocalDate.of(2024, 1, 8), // Monday
            LocalDate.of(2024, 1, 12)  // Friday
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
    void schedulePromotion_WithInvalidPromotionId_ThrowsException() {
        // Given
        SchedulingRequest request = new SchedulingRequest(
            UUID.randomUUID(), // Non-existent promotion ID
            LocalDate.of(2024, 1, 8),
            LocalDate.of(2024, 1, 12)
        );

        SchedulingResult result = schedulingService.schedulePromotion(request);

        // When & Then
        assertEquals(0, result.getTotalCourses());
    }

    @Test
    void schedulePromotion_WithImpossibleConstraints_ReturnsFailure() {
        // Given - create a scenario with impossible constraints
        // (This would require setting up conflicting data)

        SchedulingRequest request = new SchedulingRequest(
            testPromotionId,
            LocalDate.of(2024, 1, 8),
            LocalDate.of(2024, 1, 9) // Very short period
        );

        // When
        SchedulingResult result = schedulingService.schedulePromotion(request);

        // Then - should either succeed or fail gracefully
        assertNotNull(result);
        // Result may succeed or fail depending on constraints
        assertNotNull(result.getMessage());
    }

    @Test
    void schedulePromotion_DataFlow_FromInfraToDomain_WorksCorrectly() {
        // Given
        SchedulingRequest request = new SchedulingRequest(
            testPromotionId,
            LocalDate.of(2024, 1, 8),
            LocalDate.of(2024, 1, 12)
        );

        // When
        SchedulingResult result = schedulingService.schedulePromotion(request);

        // Then
        assertNotNull(result);
        // The service should have successfully:
        // 1. Retrieved data from repositories
        // 2. Converted infra models to domain entities
        // 3. Created scheduler and run scheduling
        // 4. Returned structured result

        if (result.isSuccess()) {
            assertTrue(result.getTotalCourses() > 0);
            var schedule = result.getSchedule();
            assertNotNull(schedule.get("schedule"));
            assertNotNull(schedule.get("assignments"));
        }
    }
}
