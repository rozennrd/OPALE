package com.opale.micro_planning.infra.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "professeur", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Professeur {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @Size(max = 255)
    @Column(name = "nom", nullable = false)
    private String nom;

    @NotNull
    @Size(max = 255)
    @Column(name = "prenom", nullable = false)
    private String prenom;

    @Email
    @Size(max = 255)
    @Column(name = "email")
    private String email;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TypeProfesseur type;

    @Column(name = "distanciel", nullable = false)
    private Boolean distanciel = false;
}
