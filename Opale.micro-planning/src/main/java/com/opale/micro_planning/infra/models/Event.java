package com.opale.micro_planning.infra.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "event")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TypeEvent type;

    @NotNull
    @Size(max = 255)
    @Column(name = "nom", nullable = false)
    private String nom;

    @Size(max = 255)
    @Column(name = "description")
    private String description;

    @Min(1)
    @Column(name = "num_semaine")
    private Integer numSemaine;

    @NotNull
    @Column(name = "datetime_start", nullable = false)
    private LocalDateTime datetimeStart;

    @NotNull
    @Column(name = "datetime_end", nullable = false)
    private LocalDateTime datetimeEnd;

    @Column(name = "show_macro", nullable = false)
    private Boolean showMacro = true;

    @Column(name = "show_micro", nullable = false)
    private Boolean showMicro = true;

    @Column(name = "is_blocking", nullable = false)
    private Boolean isBlocking = false;

    @Column(name = "is_exceptional", nullable = false)
    private Boolean isExceptional = false;

    @Column(name = "is_external", nullable = false)
    private Boolean isExternal = false;
}
