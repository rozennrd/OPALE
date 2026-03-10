package com.opale.micro_planning.domain.entities;

import com.opale.micro_planning.infra.models.Cycle;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class Promotion {
    private UUID id;
    private String nom;
    private Integer effectifs;
    private Cycle cycle;
    private LocalDate dateStart;
    private LocalDate dateEnd;
    private double dureeDefautCours;
    private double dureeDefautTD;

    // Converter methods
    public com.opale.micro_planning.infra.models.Promotion toInfra() {
        com.opale.micro_planning.infra.models.Promotion infra = new com.opale.micro_planning.infra.models.Promotion();
        infra.setId(this.id);
        infra.setNom(this.nom);
        infra.setEffectifs(this.effectifs);
        infra.setCycle(this.cycle);
        infra.setDateStart(this.dateStart);
        infra.setDateEnd(this.dateEnd);
        return infra;
    }

    public static Promotion fromInfra(com.opale.micro_planning.infra.models.Promotion infra) {
        return Promotion.builder()
            .id(infra.getId())
            .nom(infra.getNom())
            .effectifs(infra.getEffectifs())
            .cycle(infra.getCycle())
            .dateStart(infra.getDateStart())
            .dateEnd(infra.getDateEnd())
            .build();
    }
}
