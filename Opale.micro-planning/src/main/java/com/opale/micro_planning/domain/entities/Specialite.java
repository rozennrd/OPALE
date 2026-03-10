package com.opale.micro_planning.domain.entities;

import com.opale.micro_planning.infra.models.Groupe;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class Specialite {
    private UUID id;
    private Groupe groupe;
    private Promotion promotion;
    private String nom;
    private Integer effectifs;

    // Converter methods
    public com.opale.micro_planning.infra.models.Specialite toInfra() {
        com.opale.micro_planning.infra.models.Specialite infra = new com.opale.micro_planning.infra.models.Specialite();
        infra.setId(this.id);
        infra.setGroupe(this.groupe);
        infra.setPromotion(this.promotion != null ? this.promotion.toInfra() : null);
        infra.setNom(this.nom);
        infra.setEffectifs(this.effectifs);
        return infra;
    }

    public static Specialite fromInfra(com.opale.micro_planning.infra.models.Specialite infra) {
        return Specialite.builder()
            .id(infra.getId())
            .groupe(infra.getGroupe())
            .promotion(infra.getPromotion() != null ? Promotion.fromInfra(infra.getPromotion()) : null)
            .nom(infra.getNom())
            .effectifs(infra.getEffectifs())
            .build();
    }
}
