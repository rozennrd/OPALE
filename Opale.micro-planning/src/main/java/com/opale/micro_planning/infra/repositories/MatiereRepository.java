package com.opale.micro_planning.infra.repositories;

import com.opale.micro_planning.infra.models.Matiere;
import com.opale.micro_planning.infra.models.Promotion;
import com.opale.micro_planning.infra.models.Specialite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatiereRepository extends JpaRepository<Matiere, java.util.UUID> {

    Optional<Matiere> findByNomAndSemestreAndPromotionAndSpecialite(String nom, Integer semestre, Promotion promotion, Specialite specialite);

    List<Matiere> findByPromotion(Promotion promotion);

    List<Matiere> findBySpecialite(Specialite specialite);

    List<Matiere> findBySemestre(Integer semestre);

    List<Matiere> findByPromotionId(java.util.UUID promotionId);

    List<Matiere> findBySpecialiteIdAndSemestre(java.util.UUID specialiteId, Integer semestre);
}
