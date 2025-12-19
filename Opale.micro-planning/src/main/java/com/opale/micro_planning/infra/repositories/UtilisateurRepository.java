package com.opale.micro_planning.infra.repositories;

import com.opale.micro_planning.infra.models.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, java.util.UUID> {

    Optional<Utilisateur> findByLogin(String login);

    Optional<Utilisateur> findByEmail(String email);

    boolean existsByLogin(String login);

    boolean existsByEmail(String email);
}
