package com.opale.micro_planning.infra.repositories;

import com.opale.micro_planning.infra.models.Groupe;
import com.opale.micro_planning.infra.models.Promotion;
import com.opale.micro_planning.infra.models.Specialite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpecialiteRepository extends JpaRepository<Specialite, java.util.UUID> {

    Optional<Specialite> findByGroupeAndNom(Groupe groupe, String nom);

    List<Specialite> findByGroupe(Groupe groupe);

    List<Specialite> findByPromotion(Promotion promotion);

    List<Specialite> findByGroupeId(java.util.UUID groupeId);

    List<Specialite> findByPromotionId(java.util.UUID promotionId);
}
