package com.opale.micro_planning.infra_json.models;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    
    @JsonProperty("num_semaine")
    private Integer numSemaine;
    
    @JsonProperty("datetime_start")
    private LocalDateTime datetimeStart;
    
    @JsonProperty("datetime_end")
    private LocalDateTime datetimeEnd;
    
    @JsonProperty("show_macro")
    private Boolean showMacro;
    
    @JsonProperty("show_micro")
    private Boolean showMicro;
    
    @JsonProperty("is_blocking")
    private Boolean isBlocking;
    
    @JsonProperty("is_exceptional")
    private Boolean isExceptional;
    
    @JsonProperty("is_external")
    private Boolean isExternal;
}
