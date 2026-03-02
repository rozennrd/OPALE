package com.opale.micro_planning.infra.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "salle", uniqueConstraints = @UniqueConstraint(columnNames = "nom"))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Salle {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @Size(max = 100)
    @Column(name = "nom", nullable = false)
    private String nom;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TypeSalle type;

    @Min(0)
    @Column(name = "capacite")
    private Integer capacite;

    @Column(name = "etage")
    private Integer etage;

    @Size(max = 255)
    @Column(name = "description")
    private String description;

    @Column(name = "utilisable", nullable = false)
    private Boolean utilisable = false;


    @ManyToMany
    @JoinTable(name="localisation",
            joinColumns = @JoinColumn(name = "id_salle"),
            inverseJoinColumns = @JoinColumn(name = "id_event")
    )
    List<Event> events;
}
