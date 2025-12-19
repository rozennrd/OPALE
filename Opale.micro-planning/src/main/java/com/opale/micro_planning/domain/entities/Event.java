package com.opale.micro_planning.domain.entities;

import com.opale.micro_planning.infra.models.TypeEvent;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class Event {
    private UUID id;
    private TypeEvent type;
    private String nom;
    private Integer numSemaine;
    private LocalDateTime datetimeStart;
    private LocalDateTime datetimeEnd;
    private Boolean showMacro;
    private Boolean showMicro;
    private Boolean isBlocking;
    private Boolean isExceptional;
    private Boolean isExternal;

    // Converter methods
    public com.opale.micro_planning.infra.models.Event toInfra() {
        com.opale.micro_planning.infra.models.Event infra = new com.opale.micro_planning.infra.models.Event();
        infra.setId(this.id);
        infra.setType(this.type);
        infra.setNom(this.nom);
        infra.setNumSemaine(this.numSemaine);
        infra.setDatetimeStart(this.datetimeStart);
        infra.setDatetimeEnd(this.datetimeEnd);
        infra.setShowMacro(this.showMacro);
        infra.setShowMicro(this.showMicro);
        infra.setIsBlocking(this.isBlocking);
        infra.setIsExceptional(this.isExceptional);
        infra.setIsExternal(this.isExternal);
        return infra;
    }

    public static Event fromInfra(com.opale.micro_planning.infra.models.Event infra) {
        return Event.builder()
            .id(infra.getId())
            .type(infra.getType())
            .nom(infra.getNom())
            .numSemaine(infra.getNumSemaine())
            .datetimeStart(infra.getDatetimeStart())
            .datetimeEnd(infra.getDatetimeEnd())
            .showMacro(infra.getShowMacro())
            .showMicro(infra.getShowMicro())
            .isBlocking(infra.getIsBlocking())
            .isExceptional(infra.getIsExceptional())
            .isExternal(infra.getIsExternal())
            .build();
    }
}

