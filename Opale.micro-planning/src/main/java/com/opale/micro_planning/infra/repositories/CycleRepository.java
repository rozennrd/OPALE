package com.opale.micro_planning.infra.repositories;

import com.opale.micro_planning.infra.models.Cycle;
import com.opale.micro_planning.infra.models.TypeCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CycleRepository extends JpaRepository<Cycle, java.util.UUID> {

    Optional<Cycle> findByNomAndType(String nom, TypeCycle type);

    List<Cycle> findByType(TypeCycle type);

    boolean existsByNomAndType(String nom, TypeCycle type);
}
