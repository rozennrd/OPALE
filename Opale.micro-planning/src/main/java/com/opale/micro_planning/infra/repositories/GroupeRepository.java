package com.opale.micro_planning.infra.repositories;

import com.opale.micro_planning.infra.models.Groupe;
import com.opale.micro_planning.infra.models.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupeRepository extends JpaRepository<Groupe, java.util.UUID> {

    Optional<Groupe> findByPromotionAndNom(Promotion promotion, String nom);

    List<Groupe> findByPromotion(Promotion promotion);

    List<Groupe> findByPromotionId(java.util.UUID promotionId);

    boolean existsByPromotionAndNom(Promotion promotion, String nom);
}
