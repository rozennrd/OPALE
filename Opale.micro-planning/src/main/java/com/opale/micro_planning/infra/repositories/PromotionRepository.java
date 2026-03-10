package com.opale.micro_planning.infra.repositories;

import com.opale.micro_planning.infra.models.Cycle;
import com.opale.micro_planning.infra.models.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, java.util.UUID> {

    Optional<Promotion> findByNomAndCycle(String nom, Cycle cycle);

    List<Promotion> findByCycle(Cycle cycle);

    List<Promotion> findByCycleId(java.util.UUID cycleId);

    boolean existsByNomAndCycle(String nom, Cycle cycle);
}
