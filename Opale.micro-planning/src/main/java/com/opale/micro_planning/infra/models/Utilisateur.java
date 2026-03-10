package com.opale.micro_planning.infra.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "utilisateurs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id_utilisateur", updatable = false, nullable = false)
    private UUID idUtilisateur;

    @NotNull
    @Size(max = 255)
    @Column(name = "login", nullable = false)
    private String login;

    @NotNull
    @Email
    @Size(max = 255)
    @Column(name = "email", nullable = false)
    private String email;

    @NotNull
    @Size(max = 255)
    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "bloque", nullable = false)
    private Boolean bloque = false;

    @NotNull
    @Column(name = "date_blocage", nullable = false)
    private LocalDateTime dateBlocage;

    @NotNull
    @Min(0)
    @Column(name = "tentatives_echouees", nullable = false)
    private Integer tentativesEchouees = 0;
}
