package com.opale.micro_planning.infra.repositories;

import com.opale.micro_planning.infra.models.Event;
import com.opale.micro_planning.infra.models.Salle;
import com.opale.micro_planning.infra.models.TypeSalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalleRepository extends JpaRepository<Salle, java.util.UUID> {

    Optional<Salle> findByNom(String nom);

    List<Salle> findByType(TypeSalle type);

    List<Salle> findByCapaciteGreaterThanEqual(Integer capacite);

    List<Salle> findByEtage(Integer etage);

    boolean existsByNom(String nom);

}
