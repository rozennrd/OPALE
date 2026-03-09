package com.opale.micro_planning.app.services;

import com.opale.micro_planning.app.dtos.SchedulingRequest;
import com.opale.micro_planning.app.dtos.SchedulingResult;
import com.opale.micro_planning.app.exceptions.SchedulingException;
import com.opale.micro_planning.app.mappers.InfrastructureToDomainMapper;
import com.opale.micro_planning.domain.Scheduler;
import com.opale.micro_planning.infra.repositories.EnseignementRepository;
import com.opale.micro_planning.infra.repositories.MatiereRepository;
import com.opale.micro_planning.infra.repositories.SalleRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@ConditionalOnProperty(name = "spring.jpa.database", havingValue = "POSTGRESQL")
public class SchedulingService {

    private final EnseignementRepository enseignementRepository;
    private final MatiereRepository matiereRepository;
    private final SalleRepository salleRepository;

    public SchedulingService(EnseignementRepository enseignementRepository,
                           MatiereRepository matiereRepository,
                           SalleRepository salleRepository) {
        this.enseignementRepository = enseignementRepository;
        this.matiereRepository = matiereRepository;
        this.salleRepository = salleRepository;
    }

    /**
     * Main scheduling orchestration method
     */
    @Transactional(readOnly = true)
    public SchedulingResult schedulePromotion(SchedulingRequest request) {
        try {
            // 1. Fetch data from infra layer
            var matieres = matiereRepository.findByPromotionId(request.getPromotionId());
            
            var infraEnseignements = new ArrayList<com.opale.micro_planning.infra.models.Enseignement>();
            var infraSalles = salleRepository.findAll();

            // Get enseignements for all matieres of this promotion
            for (var matiere : matieres) {
                infraEnseignements.addAll(enseignementRepository.findByMatiere(matiere));
            }

            // 2. Convert to domain entities
            var domainEnseignements = InfrastructureToDomainMapper.toDomainEnseignements(infraEnseignements);
            var domainSalles = InfrastructureToDomainMapper.toDomainSalles(infraSalles);

            // 3. Create domain scheduler
            var scheduler = new Scheduler(request.getStartDate(), request.getEndDate(), domainSalles);

            // 4. Add courses to schedule
            scheduler.createCoursesToSchedule(new ArrayList<>(domainEnseignements));

            // 5. Run scheduling algorithm
            boolean success = scheduler.scheduleCourses();

            // 6. Return result
            return new SchedulingResult(
                null, // No persistent ID yet
                success,
                Map.of("schedule", scheduler.getSchedule(), "assignments", scheduler.getRoomAssignments()),
                scheduler.getSchedule().size(),
                success ? "Scheduling completed successfully" : "No feasible schedule found"
            );

        } catch (Exception e) {
            throw new SchedulingException("Failed to schedule promotion: " + e.getMessage(), e);
        }
    }
}
