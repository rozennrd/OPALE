package com.opale.micro_planning.infra.repositories;

import com.opale.micro_planning.infra.models.Enseignement;
import com.opale.micro_planning.infra.models.Matiere;
import com.opale.micro_planning.infra.models.Professeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnseignementRepository extends JpaRepository<Enseignement, java.util.UUID> {

    Optional<Enseignement> findByMatiereAndProfesseur(Matiere matiere, Professeur professeur);

    List<Enseignement> findByMatiere(Matiere matiere);

    List<Enseignement> findByProfesseur(Professeur professeur);

    List<Enseignement> findByMatiereId(java.util.UUID matiereId);

    List<Enseignement> findByProfesseurId(java.util.UUID professeurId);

    boolean existsByMatiereAndProfesseur(Matiere matiere, Professeur professeur);
}
