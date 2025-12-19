package com.opale.micro_planning.app.services;

import com.opale.micro_planning.app.dtos.SchedulingRequest;
import com.opale.micro_planning.app.dtos.SchedulingResult;
import com.opale.micro_planning.app.mappers.InfrastructureToDomainMapper;
import com.opale.micro_planning.domain.Scheduler;
import com.opale.micro_planning.infra.services.JsonDataService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Service for scheduling using JSON mock data instead of database repositories
 * Same interface as SchedulingService but uses JsonDataService for data access
 */
@Service
public class JsonSchedulingService {

    private final JsonDataService jsonDataService;

    public JsonSchedulingService(JsonDataService jsonDataService) {
        this.jsonDataService = jsonDataService;
    }

    /**
     * Schedule courses for a promotion using JSON data
     */
    public SchedulingResult schedulePromotion(SchedulingRequest request) {
        try {
            System.out.println("=== DEBUG JsonSchedulingService ===");
            System.out.println("Promotion ID: " + request.getPromotionId());

            // 1. Get related data for this promotion from JSON
            var matieresInfra = jsonDataService.getMatieresByPromotion(request.getPromotionId());
            var infraEnseignements = jsonDataService.getEnseignementsByPromotion(request.getPromotionId());
            var infraSalles = jsonDataService.getAllSalles();

            System.out.println("Infra - Matieres: " + matieresInfra.size());
            System.out.println("Infra - Enseignements: " + infraEnseignements.size());
            System.out.println("Infra - Salles: " + infraSalles.size());

            // 2. Convert to domain entities
            var domainEnseignements = InfrastructureToDomainMapper.toDomainEnseignements(infraEnseignements);
            var domainSalles = InfrastructureToDomainMapper.toDomainSalles(infraSalles);

            System.out.println("Domain - Enseignements: " + domainEnseignements.size());
            System.out.println("Domain - Salles: " + domainSalles.size());

            // 3. Create domain scheduler
            var scheduler = new Scheduler(request.getStartDate(), request.getEndDate(), domainSalles);
            System.out.println("Created scheduler with " + domainSalles.size() + " rooms");

            // 4. Add courses to schedule
            scheduler.createCoursesToSchedule(new ArrayList<>(domainEnseignements));
            System.out.println("After createCoursesToSchedule");

            // 5. Run scheduling algorithm
            boolean success = scheduler.scheduleCourses();
            System.out.println("Scheduling result: " + success);
            System.out.println("Final schedule size: " + scheduler.getSchedule().size());
            System.out.println("Final room assignments size: " + scheduler.getRoomAssignments().size());

            // 6. Return result
            return new SchedulingResult(
                null, // No persistent ID yet
                success,
                Map.of("schedule", scheduler.getSchedule(), "assignments", scheduler.getRoomAssignments()),
                scheduler.getSchedule().size(),
                success ? "Scheduling completed successfully" : "No feasible schedule found"
            );

        } catch (Exception e) {
            System.err.println("Error in JsonSchedulingService: " + e.getMessage());
            e.printStackTrace();
            return new SchedulingResult(
                null,
                false,
                Map.of(),
                0,
                "Error during scheduling: " + e.getMessage()
            );
        }
    }
}
