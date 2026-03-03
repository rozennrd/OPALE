/** Police unique pour tout le classeur */
export const FONT_NAME = 'Arial';

// CHARTE COULEURS — BobPlanning / Export EDT Macro
// Format ARGB (ExcelJS) : 'FF' + hex sans #
// Format HEX standard   : '#RRGGBB'

export const COLOR = {
    /** Fond violet clair — N° de semaine + date du lundi */
    DATE_WEEK: 'FFB1A0C7',           // #B1A0C7

    /** Couleurs définies par cycle - (dégradé -15 % par année) */
    CYCLE_COLORS: [
        'FFB8D8BA',   // #B8D8BA  vert sauge doux        — cycle 1
        'FFF4A261',   // #F4A261  abricot pastel         — cycle 2
        'FF8ECAE6',   // #8ECAE6  bleu doux               — cycle 3
        'FFE9C46A',   // #E9C46A  jaune sable             — cycle 4
        'FFF28482',   // #F28482  corail pastel           — cycle 5
        'FF84A59D',   // #84A59D  vert gris bleuté        — cycle 6
    ] as string[],

    /** Fond beige — Évènements hors Junia (ICT / ISFEC / CAMPUS…) */
    EVENT_OTHER:    'FFF2E9D8',      // #F2E9D8

    /** Fond bleu vif — Évènements Junia hors cours (JPO / Puissance Alpha / Conférence…) */
    EVENT_JUNIA:    'FF2BA2FF',      // #2BA2FF

    /** Fond rouge clair — Partiels, Jury, Rattrapages, Soutenances */
    ALERT_RED:      'FFC22525',      // #C22525

    /** Fond rouge doux — Semaines thématiques (Séminaire, Jeu d'entreprise) */
    SEM_THEME:      'FFFF7070',      // #FF7070

    /** Fond jaune pâle — Vacances scolaires zone Bordeaux */
    VAC_BDX:        'FFFFDC99',      // #FFDC99

    /** Couleur de TEXTE rouge foncé — Jours fériés (texte dans la colonne holidays) */
    JOUR_FERIE_FG:  'FFD10000',      // #D10000

    /** Fond blanc — Période en entreprise (apprentissage) */
    ENTREPRISE:     'FFFFFFFF',      // #FFFFFF

    /** Fond rose très clair — Stage / Mobilité internationale / PFE en cours */
    STAGE_MOBILITY: 'FFFCE8E8',      // #FCE8E8

    /** Couleur de texte par défaut */
    TEXT_DEFAULT:   'FF000000',      // #000000  noir

    /** Couleur de texte sur fond rouge (Jours fériés) */
    TEXT_WHITE:     'FFFFFFFF',      // #FFFFFF  blanc

} as const;

// ══════════════════════════════════════════════════════════════
// HELPER — Dégradé par année dans le cycle
// ══════════════════════════════════════════════════════════════

/**
 * Retourne la couleur ARGB d'une promo en fonction de son cycle et de son année.
 *
 * @param cycleIndex   Index du cycle parmi les cycles distincts (1, 2…)
 * @param yearInCycle  Position de la promo dans son cycle, triée par date_start
 */
export function getCycleColor(cycleIndex: number, yearInCycle: number): string {
    const base = COLOR.CYCLE_COLORS[cycleIndex % COLOR.CYCLE_COLORS.length];
    const r = parseInt(base.slice(2, 4), 16);
    const g = parseInt(base.slice(4, 6), 16);
    const b = parseInt(base.slice(6, 8), 16);

    const factor = Math.min(0.75, yearInCycle * 0.20);
    const nr = Math.round(r + (255 - r) * factor);
    const ng = Math.round(g + (255 - g) * factor);
    const nb = Math.round(b + (255 - b) * factor);

    return (
        'FF' +
        nr.toString(16).padStart(2, '0').toUpperCase() +
        ng.toString(16).padStart(2, '0').toUpperCase() +
        nb.toString(16).padStart(2, '0').toUpperCase()
    );
}