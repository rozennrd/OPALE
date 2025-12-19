package com.opale.micro_planning.infra_json.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * JSON DTO for Event - clean POJO without JPA annotations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventJson {
    private UUID id;
    private String type; // Will be converted to enum
    private String nom;
    private Integer numSemaine;
    private LocalDateTime datetimeStart; // camelCase
    private LocalDateTime datetimeEnd;
    private Boolean showMacro;
    private Boolean showMicro;
    private Boolean isBlocking;
    private Boolean isExceptional;
    private Boolean isExternal;
}
