-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le : mer. 29 jan. 2025 à 10:29
-- Version du serveur : 10.11.6-MariaDB
-- Version de PHP : 8.0.30

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
  `id` int(11) NOT NULL,
  `dateDeb` date DEFAULT NULL,
  `dateFin` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Déchargement des données de la table `calendrier`
--

INSERT INTO `calendrier` (`id`, `dateDeb`, `dateFin`) VALUES
(1, '2024-08-18', '2025-08-28');

-- --------------------------------------------------------

--
-- Structure de la table `promosData`
--

CREATE TABLE `promosData` (
  `id` int(11) NOT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Nombre` int(11) DEFAULT NULL,
  `Periode` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Déchargement des données de la table `promosData`
--

INSERT INTO `promosData` (`id`, `Name`, `Nombre`, `Periode`) VALUES
(1, 'ADI1', 4, '[{\"DateDebutP\":\"2025-09-03\",\"DateFinP\":\"2026-05-27\"}]'),
(2, 'ADI2', 3, '[{\"DateDebutP\":\"2025-09-02\",\"DateFinP\":\"2026-05-27\"}]'),
(3, 'CIR1', 3, '[{\"DateDebutP\":\"2025-09-02\",\"DateFinP\":\"2026-05-27\"}]'),
(4, 'CIR2', 2, '[{\"DateDebutP\":\"2025-09-02\",\"DateFinP\":\"2026-05-27\"}]'),
(5, 'AP3', 3, '[{\"DateDebutP\":\"2025-09-02\",\"nbSemaineP\":3,\"DateFinP\":\"2025-09-23\"}]'),
(6, 'AP4', 3, '[{\"DateDebutP\":\"2025-09-02\",\"nbSemaineP\":10,\"DateFinP\":\"2025-11-11\"},{\"DateDebutP\":\"2026-02-02\",\"nbSemaineP\":5,\"DateFinP\":\"2026-03-09\"}]'),
(7, 'AP5', 3, '[{\"DateDebutP\":\"2025-09-02\",\"DateFinP\":\"2025-11-11\",\"nbSemaineP\":10},{\"DateDebutP\":\"2026-02-02\",\"DateFinP\":\"2026-03-16\",\"nbSemaineP\":6}]'),
(8, 'ISEN3', 0, '[{\"DateDebutP\":\"2024-09-02\",\"DateFinP\":\"2025-05-27\"}]'),
(9, 'ISEN4', 0, '[{\"DateDebutP\":\"2024-09-02\",\"DateFinP\":\"2025-05-27\"}]'),
(10, 'ISEN5', 0, '[{\"DateDebutP\":\"2024-09-02\",\"DateFinP\":\"2025-05-27\"}]');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `calendrier`
--
ALTER TABLE `calendrier`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `promosData`
--
ALTER TABLE `promosData`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `calendrier`
--
ALTER TABLE `calendrier`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `promosData`
--
ALTER TABLE `promosData`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
