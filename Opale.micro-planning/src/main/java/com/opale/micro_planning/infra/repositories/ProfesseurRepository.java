package com.opale.micro_planning.infra.repositories;

import com.opale.micro_planning.infra.models.Professeur;
import com.opale.micro_planning.infra.models.TypeProfesseur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfesseurRepository extends JpaRepository<Professeur, java.util.UUID> {

    Optional<Professeur> findByEmail(String email);

    List<Professeur> findByType(TypeProfesseur type);

    List<Professeur> findByDistanciel(Boolean distanciel);

    boolean existsByEmail(String email);
}
