package com.opale.micro_planning.domain.entities;

import com.opale.micro_planning.infra.models.TypeEvent;

import java.time.LocalDateTime;
import java.util.UUID;

public class EventShort {
    private String nom;
    private Integer numSemaine;
    private LocalDateTime datetimeStart;
    private LocalDateTime datetimeEnd;
    private Boolean showMacro;
    private Boolean showMicro;
    private Boolean isBlocking;
    private Boolean isExceptional;
    private Boolean isExternal;

}
