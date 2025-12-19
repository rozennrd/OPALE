package com.opale.micro_planning.infra.repositories;

import com.opale.micro_planning.infra.models.Cours;
import com.opale.micro_planning.infra.models.Event;
import com.opale.micro_planning.infra.models.Matiere;
import com.opale.micro_planning.infra.models.Professeur;
import com.opale.micro_planning.infra.models.TypeCours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoursRepository extends JpaRepository<Cours, java.util.UUID> {

    Optional<Cours> findByEventAndProfesseurAndMatiereAndType(Event event, Professeur professeur, Matiere matiere, TypeCours type);

    List<Cours> findByEvent(Event event);

    List<Cours> findByProfesseur(Professeur professeur);

    List<Cours> findByMatiere(Matiere matiere);

    List<Cours> findByType(TypeCours type);

    List<Cours> findByIsDistanciel(Boolean isDistanciel);

    List<Cours> findByProfesseurId(java.util.UUID professeurId);

    List<Cours> findByMatiereId(java.util.UUID matiereId);
}
