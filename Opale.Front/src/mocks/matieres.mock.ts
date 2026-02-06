// src/mocks/matieres.mock.ts
import { Matiere } from '../models/Matiere'

/**
 * Mock statique (liste "JSON") des matières.
 *
 * Convention: `id_promo` correspond au label de promotion (ex: "ADI 1")
 * pour pouvoir matcher facilement les promotions générées par `makePromotions()`.
 */
export const MATIERES_MOCK: Matiere[] = [
    // =====================
    // ADI 1
    // =====================
    {
        id: 'mat-adi1-algo',
        nom: 'Algorithmique',
        volume_horaire: 30,
        id_promo: 'ADI 1',
        id_specialite: 'spec-info',
        semestre: 1,
        nb_partiels: 1,
        nb_eval_intermediaire: 2,
        heures_td: 18,
        heures_tp: 12,
    },
    {
        id: 'mat-adi1-archi-si',
        nom: 'Architecture des SI',
        volume_horaire: 24,
        id_promo: 'ADI 1',
        id_specialite: 'spec-si',
        semestre: 1,
        nb_partiels: 1,
        nb_eval_intermediaire: 1,
        heures_td: 16,
        heures_tp: 8,
    },
    {
        id: 'mat-adi1-bdd',
        nom: 'Bases de données',
        volume_horaire: 28,
        id_promo: 'ADI 1',
        id_specialite: 'spec-info',
        semestre: 1,
        nb_partiels: 1,
        nb_eval_intermediaire: 1,
        heures_td: 16,
        heures_tp: 12,
    },

    // =====================
    // ADI 2
    // =====================
    {
        id: 'mat-adi2-web',
        nom: 'Développement Web',
        volume_horaire: 32,
        id_promo: 'ADI 2',
        id_specialite: 'spec-info',
        semestre: 2,
        nb_partiels: 1,
        nb_eval_intermediaire: 2,
        heures_td: 14,
        heures_tp: 18,
    },
    {
        id: 'mat-adi2-projet',
        nom: 'Gestion de projet',
        volume_horaire: 20,
        id_promo: 'ADI 2',
        semestre: 2,
        nb_partiels: 1,
        nb_eval_intermediaire: 1,
        heures_td: 12,
        heures_tp: 8,
    },
    {
        id: 'mat-adi2-python',
        nom: 'Python avancé',
        volume_horaire: 26,
        id_promo: 'ADI 2',
        id_specialite: 'spec-info',
        semestre: 2,
        nb_partiels: 1,
        nb_eval_intermediaire: 2,
        heures_td: 10,
        heures_tp: 16,
    },

    // =====================
    // SIR 1
    // =====================
    {
        id: 'mat-sir1-reseaux',
        nom: 'Réseaux',
        volume_horaire: 30,
        id_promo: 'SIR 1',
        id_specialite: 'spec-reseau',
        semestre: 1,
        nb_partiels: 1,
        nb_eval_intermediaire: 1,
        heures_td: 20,
        heures_tp: 10,
    },
    {
        id: 'mat-sir1-systemes',
        nom: 'Systèmes',
        volume_horaire: 26,
        id_promo: 'SIR 1',
        semestre: 1,
        nb_partiels: 1,
        nb_eval_intermediaire: 1,
        heures_td: 18,
        heures_tp: 8,
    },
    {
        id: 'mat-sir1-bdd',
        nom: 'Bases de données',
        volume_horaire: 24,
        id_promo: 'SIR 1',
        semestre: 1,
        nb_partiels: 1,
        nb_eval_intermediaire: 1,
        heures_td: 14,
        heures_tp: 10,
    },

    // =====================
    // SIR 2
    // =====================
    {
        id: 'mat-sir2-secu',
        nom: 'Sécurité informatique',
        volume_horaire: 28,
        id_promo: 'SIR 2',
        id_specialite: 'spec-secu',
        semestre: 2,
        nb_partiels: 1,
        nb_eval_intermediaire: 2,
        heures_td: 16,
        heures_tp: 12,
    },
    {
        id: 'mat-sir2-cloud',
        nom: 'Cloud computing',
        volume_horaire: 24,
        id_promo: 'SIR 2',
        semestre: 2,
        nb_partiels: 1,
        nb_eval_intermediaire: 1,
        heures_td: 14,
        heures_tp: 10,
    },
    {
        id: 'mat-sir2-devops',
        nom: 'DevOps',
        volume_horaire: 22,
        id_promo: 'SIR 2',
        semestre: 2,
        nb_partiels: 1,
        nb_eval_intermediaire: 1,
        heures_td: 12,
        heures_tp: 10,
    },

    // =====================
    // ISEN 1
    // =====================
    {
        id: 'mat-isen1-maths',
        nom: 'Mathématiques',
        volume_horaire: 36,
        id_promo: 'ISEN 1',
        semestre: 1,
        nb_partiels: 2,
        nb_eval_intermediaire: 1,
        heures_td: 36,
        heures_tp: 0,
    },
    {
        id: 'mat-isen1-physique',
        nom: 'Physique',
        volume_horaire: 30,
        id_promo: 'ISEN 1',
        semestre: 1,
        nb_partiels: 1,
        nb_eval_intermediaire: 1,
        heures_td: 20,
        heures_tp: 10,
    },

    // =====================
    // ISEN 2
    // =====================
    {
        id: 'mat-isen2-elec',
        nom: 'Électronique',
        volume_horaire: 28,
        id_promo: 'ISEN 2',
        semestre: 2,
        nb_partiels: 1,
        nb_eval_intermediaire: 2,
        heures_td: 16,
        heures_tp: 12,
    },
    {
        id: 'mat-isen2-prog-c',
        nom: 'Programmation C',
        volume_horaire: 26,
        id_promo: 'ISEN 2',
        semestre: 2,
        nb_partiels: 1,
        nb_eval_intermediaire: 1,
        heures_td: 12,
        heures_tp: 14,
    },

    // =====================
    // ISEN 3
    // =====================
    {
        id: 'mat-isen3-embarque',
        nom: 'Systèmes embarqués',
        volume_horaire: 32,
        id_promo: 'ISEN 3',
        semestre: 2,
        nb_partiels: 1,
        nb_eval_intermediaire: 1,
        heures_td: 14,
        heures_tp: 18,
    },
    {
        id: 'mat-isen3-java',
        nom: 'Développement Java',
        volume_horaire: 28,
        id_promo: 'ISEN 3',
        semestre: 2,
        nb_partiels: 1,
        nb_eval_intermediaire: 2,
        heures_td: 12,
        heures_tp: 16,
    },

    // =====================
    // FISEN 1
    // =====================
    {
        id: 'mat-fisen1-gestion',
        nom: 'Gestion industrielle',
        volume_horaire: 24,
        id_promo: 'FISEN 1',
        semestre: 1,
        nb_partiels: 1,
        nb_eval_intermediaire: 1,
        heures_td: 24,
        heures_tp: 0,
    },
    {
        id: 'mat-fisen1-qse',
        nom: 'QSE',
        volume_horaire: 18,
        id_promo: 'FISEN 1',
        semestre: 1,
        nb_partiels: 0,
        nb_eval_intermediaire: 2,
        heures_td: 18,
        heures_tp: 0,
    },

    // =====================
    // FISEN 2
    // =====================
    {
        id: 'mat-fisen2-qualite',
        nom: 'Qualité & Lean',
        volume_horaire: 20,
        id_promo: 'FISEN 2',
        semestre: 2,
        nb_partiels: 1,
        nb_eval_intermediaire: 1,
        heures_td: 20,
        heures_tp: 0,
    },
    {
        id: 'mat-fisen2-simu',
        nom: 'Simulation de flux',
        volume_horaire: 22,
        id_promo: 'FISEN 2',
        semestre: 2,
        nb_partiels: 1,
        nb_eval_intermediaire: 1,
        heures_td: 12,
        heures_tp: 10,
    },

    // =====================
    // FISEN 3
    // =====================
    {
        id: 'mat-fisen3-supply',
        nom: 'Supply Chain',
        volume_horaire: 26,
        id_promo: 'FISEN 3',
        semestre: 2,
        nb_partiels: 1,
        nb_eval_intermediaire: 2,
        heures_td: 18,
        heures_tp: 8,
    },
    {
        id: 'mat-fisen3-erp',
        nom: 'ERP',
        volume_horaire: 18,
        id_promo: 'FISEN 3',
        semestre: 2,
        nb_partiels: 1,
        nb_eval_intermediaire: 1,
        heures_td: 10,
        heures_tp: 8,
    },
];
