package com.opale.micro_planning.infra.repositories;

import com.opale.micro_planning.infra.models.Concerner;
import com.opale.micro_planning.infra.models.Event;
import com.opale.micro_planning.infra.models.Groupe;
import com.opale.micro_planning.infra.models.Promotion;
import com.opale.micro_planning.infra.models.Specialite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConcernerRepository extends JpaRepository<Concerner, java.util.UUID> {

    List<Concerner> findByEvent(Event event);

    List<Concerner> findByPromotion(Promotion promotion);

    List<Concerner> findByGroupe(Groupe groupe);

    List<Concerner> findBySpecialite(Specialite specialite);

    List<Concerner> findByEventId(java.util.UUID eventId);

    List<Concerner> findByPromotionId(java.util.UUID promotionId);

    List<Concerner> findByGroupeId(java.util.UUID groupeId);

    List<Concerner> findBySpecialiteId(java.util.UUID specialiteId);
}
