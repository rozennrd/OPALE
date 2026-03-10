package com.opale.micro_planning.domain.entities;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;

import java.util.UUID;

@Data
@Builder
public class Matiere {
    private UUID id;
    private String nom;
    private Double volumeHoraire;
    @Getter
    private Promotion promotion;
    private Specialite specialite;
    private Integer semestre;
    private Integer nbPartiels;
    private Integer nbEvalIntermediaire;
    private Integer heuresTd;
    private Integer heuresTp;

    // Converter methods
    public com.opale.micro_planning.infra.models.Matiere toInfra() {
        com.opale.micro_planning.infra.models.Matiere infra = new com.opale.micro_planning.infra.models.Matiere();
        infra.setId(this.id);
        infra.setNom(this.nom);
        infra.setVolumeHoraire(this.volumeHoraire);
        infra.setPromotion(this.promotion != null ? this.promotion.toInfra() : null);
        infra.setSpecialite(this.specialite != null ? this.specialite.toInfra() : null);
        infra.setSemestre(this.semestre);
        infra.setNbPartiels(this.nbPartiels);
        infra.setNbEvalIntermediaire(this.nbEvalIntermediaire);
        infra.setHeuresTd(this.heuresTd);
        infra.setHeuresTp(this.heuresTp);
        return infra;
    }

    public static Matiere fromInfra(com.opale.micro_planning.infra.models.Matiere infra) {
        return Matiere.builder()
            .id(infra.getId())
            .nom(infra.getNom())
            .volumeHoraire(infra.getVolumeHoraire())
            .promotion(infra.getPromotion() != null ? Promotion.fromInfra(infra.getPromotion()) : null)
            .specialite(infra.getSpecialite() != null ? Specialite.fromInfra(infra.getSpecialite()) : null)
            .semestre(infra.getSemestre())
            .nbPartiels(infra.getNbPartiels())
            .nbEvalIntermediaire(infra.getNbEvalIntermediaire())
            .heuresTd(infra.getHeuresTd())
            .heuresTp(infra.getHeuresTp())
            .build();
    }
}
