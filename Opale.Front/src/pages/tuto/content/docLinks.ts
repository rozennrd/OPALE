export type PageTutorialDeepLinkId =
    | 'promotions'
    | 'events'
    | 'teachers'
    | 'rooms'
    | 'matieres'

// Limitation connue: ces liens sont ouverts dans un nouvel onglet.
// Comme la session OPALE n est pas encore restauree automatiquement entre onglets,
// l utilisateur peut etre renvoye vers /login puis, apres reconnexion,
// redirige vers la page par defaut (/planning) au lieu du tuto cible.
export const buildPageTutorialDeepLink = (tutorialId: PageTutorialDeepLinkId): string =>
    `/documentation?tab=pages&tutorial=${tutorialId}`
