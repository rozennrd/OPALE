package com.opale.micro_planning.infra.repositories;

import com.opale.micro_planning.infra.models.Disponibilite;
import com.opale.micro_planning.infra.models.Professeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DisponibiliteRepository extends JpaRepository<Disponibilite, java.util.UUID> {

    Optional<Disponibilite> findByProfesseurAndNumSemaine(Professeur professeur, Integer numSemaine);

    List<Disponibilite> findByProfesseur(Professeur professeur);

    List<Disponibilite> findByNumSemaine(Integer numSemaine);

    List<Disponibilite> findByProfesseurId(java.util.UUID professeurId);

    boolean existsByProfesseurAndNumSemaine(Professeur professeur, Integer numSemaine);
}
