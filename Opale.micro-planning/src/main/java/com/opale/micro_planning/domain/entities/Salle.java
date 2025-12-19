package com.opale.micro_planning.domain.entities;

import com.opale.micro_planning.infra.models.TypeSalle;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Salle {
    private UUID id;
    private String nom;
    private TypeSalle type;
    private Integer capacite;
    private Integer etage;
    private List<EventShort> events;

    // Converter methods
    public com.opale.micro_planning.infra.models.Salle toInfra() {
        com.opale.micro_planning.infra.models.Salle infra = new com.opale.micro_planning.infra.models.Salle();
        infra.setId(this.id);
        infra.setNom(this.nom);
        infra.setType(this.type);
        infra.setCapacite(this.capacite);
        infra.setEtage(this.etage);
        return infra;
    }

    public static Salle fromInfra(com.opale.micro_planning.infra.models.Salle infra) {
        return Salle.builder()
                .id(infra.getId())
                .nom(infra.getNom())
                .type(infra.getType())
                .capacite(infra.getCapacite())
                .etage(infra.getEtage())
                .build();
    }
}
