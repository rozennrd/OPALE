-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : mysql-database
-- Généré le : ven. 07 mars 2025 à 07:32
-- Version du serveur : 8.0.41
-- Version de PHP : 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `bobPlanning`
--

-- --------------------------------------------------------

--
-- Structure de la table `calendrier`
--

CREATE TABLE `calendrier` (
  `id` int NOT NULL,
  `dateDeb` date DEFAULT NULL,
  `dateFin` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `calendrier`
--

INSERT INTO `calendrier` (`id`, `dateDeb`, `dateFin`) VALUES
(1, '2025-09-01', '2026-08-28');

-- --------------------------------------------------------

--
-- Structure de la table `Cours`
--

CREATE TABLE `Cours` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `UE` varchar(255) NOT NULL,
  `Semestre` text NOT NULL,
  `Periode` int DEFAULT NULL,
  `Prof` int DEFAULT NULL,
  `typeSalle` enum('classique','electronique','informatique','projet') DEFAULT NULL,
  `heure` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ;

-- --------------------------------------------------------

--
-- Structure de la table `Professeurs`
--

CREATE TABLE `Professeurs` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('EXT','INT') NOT NULL,
  `dispo` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Structure de la table `promosData`
--

CREATE TABLE `promosData` (
  `id` int NOT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Nombre` int DEFAULT NULL,
  `Periode` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `promosData`
--

INSERT INTO `promosData` (`id`, `Name`, `Nombre`, `Periode`) VALUES
(1, 'ADI1', 1, '[{\"DateDebutP\":\"2025-09-03\",\"DateFinP\":\"2026-05-27\"}]'),
(2, 'ADI2', 0, '[{\"DateDebutP\":\"2025-09-02\",\"DateFinP\":\"2026-05-27\"}]'),
(3, 'CIR1', 1, '[{\"DateDebutP\":\"2025-09-02\",\"DateFinP\":\"2026-05-27\"}]'),
(4, 'CIR2', 1, '[{\"DateDebutP\":\"2025-09-02\",\"DateFinP\":\"2026-05-27\"}]'),
(5, 'AP3', 3, '[{\"DateDebutP\":\"2025-09-02\",\"nbSemaineP\":3,\"DateFinP\":\"2025-09-23\"}]'),
(6, 'AP4', 3, '[{\"DateDebutP\":\"2025-09-02\",\"nbSemaineP\":10,\"DateFinP\":\"2025-11-11\"},{\"DateDebutP\":\"2026-02-02\",\"nbSemaineP\":5,\"DateFinP\":\"2026-03-09\"}]'),
(7, 'AP5', 3, '[{\"DateDebutP\":\"2025-09-02\",\"DateFinP\":\"2025-11-11\",\"nbSemaineP\":10},{\"DateDebutP\":\"2026-02-02\",\"DateFinP\":\"2026-03-16\",\"nbSemaineP\":6}]'),
(8, 'ISEN3', 0, '[{\"DateDebutP\":\"2024-09-02\",\"DateFinP\":\"2025-05-27\"}]'),
(9, 'ISEN4', 0, '[{\"DateDebutP\":\"2024-09-02\",\"DateFinP\":\"2025-05-27\"}]'),
(10, 'ISEN5', 0, '[{\"DateDebutP\":\"2024-09-02\",\"DateFinP\":\"2025-05-27\"}]');

-- --------------------------------------------------------

--
-- Structure de la table `Salles`
--

CREATE TABLE `Salles` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('classique','electronique','informatique','projet') NOT NULL,
  `capacite` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `Salles`
--

INSERT INTO `Salles` (`id`, `name`, `type`, `capacite`) VALUES
(2, 'ClassLab', 'projet', 57),
(3, 'J107 - TP Hybride', 'projet', 30),
(4, 'J203', 'classique', 25);

-- --------------------------------------------------------

--
-- Structure de la table `Utilisateurs`
--

CREATE TABLE `Utilisateurs` (
  `IdUtilisateur` int NOT NULL,
  `Login` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Bloque` tinyint(1) DEFAULT NULL,
  `DateBlocage` datetime NOT NULL,
  `TentativesEchouees` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `Utilisateurs`
--

INSERT INTO `Utilisateurs` (`IdUtilisateur`, `Login`, `Email`, `Password`, `Bloque`, `DateBlocage`, `TentativesEchouees`) VALUES
(1, 'A', 'A', '43c1f76adf6d51952d6a20bbf8ddc93478d11aae84dbc37caa5e5c18b3c7f533', 0, '2025-01-29 00:00:00', 0),
(2, 'Daminou', 'Damien', '43c1f76adf6d51952d6a20bbf8ddc93478d11aae84dbc37caa5e5c18b3c7f533', 0, '2025-02-17 15:36:41', 0);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `calendrier`
--
ALTER TABLE `calendrier`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `Cours`
--
ALTER TABLE `Cours`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_profs` (`Prof`);

--
-- Index pour la table `Professeurs`
--
ALTER TABLE `Professeurs`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `promosData`
--
ALTER TABLE `promosData`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `Salles`
--
ALTER TABLE `Salles`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `Utilisateurs`
--
ALTER TABLE `Utilisateurs`
  ADD PRIMARY KEY (`IdUtilisateur`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `calendrier`
--
ALTER TABLE `calendrier`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `Cours`
--
ALTER TABLE `Cours`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `Professeurs`
--
ALTER TABLE `Professeurs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `promosData`
--
ALTER TABLE `promosData`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `Salles`
--
ALTER TABLE `Salles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `Utilisateurs`
--
ALTER TABLE `Utilisateurs`
  MODIFY `IdUtilisateur` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `Cours`
--
ALTER TABLE `Cours`
  ADD CONSTRAINT `fk_profs` FOREIGN KEY (`Prof`) REFERENCES `Professeurs` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
