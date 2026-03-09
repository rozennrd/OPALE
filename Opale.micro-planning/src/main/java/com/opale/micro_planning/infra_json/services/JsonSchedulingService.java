package com.opale.micro_planning.infra_json.services;

import com.opale.micro_planning.app.dtos.SchedulingRequest;
import com.opale.micro_planning.app.dtos.SchedulingResult;
import com.opale.micro_planning.domain.Scheduler;
import com.opale.micro_planning.infra_json.mappers.JsonToDomainMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Map;

/**
 * Scheduling service that uses JSON infrastructure
 * Completely separate from database infrastructure
 */
@Service("infraJsonSchedulingService")
public class JsonSchedulingService {

    private final JsonAccessDataService jsonAccessDataService;

    public JsonSchedulingService(JsonAccessDataService jsonAccessDataService) {
        this.jsonAccessDataService = jsonAccessDataService;
    }

    /**
     * Schedule courses for a promotion using JSON data
     */
    public SchedulingResult schedulePromotion(SchedulingRequest request) {
        try {
            System.out.println("=== DEBUG JsonSchedulingService (NEW) ===");
            System.out.println("Promotion ID: " + request.getPromotionId());

            // 1. Get data from JSON infrastructure
            var infraEnseignements = jsonAccessDataService.getEnseignementsByPromotion(request.getPromotionId());
            var infraSalles = jsonAccessDataService.getAllSalles();

            System.out.println("JSON Infra - Enseignements: " + infraEnseignements.size());
            System.out.println("JSON Infra - Salles: " + infraSalles.size());

            // 2. Convert to domain entities using JSON mapper
            var domainEnseignements = JsonToDomainMapper.toDomainEnseignements(infraEnseignements);
            var domainSalles = JsonToDomainMapper.toDomainSalles(infraSalles);

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
            System.err.println("Error in NEW JsonSchedulingService: " + e.getMessage());
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
