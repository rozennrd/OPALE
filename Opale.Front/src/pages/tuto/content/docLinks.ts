export type PageTutorialDeepLinkId =
    | 'promotions'
    | 'events'
    | 'teachers'
    | 'rooms'
    | 'matieres'

// Limitation connue : ces liens sont ouverts dans un nouvel onglet.
// Comme la session OPALE n'est pas encore restaurée automatiquement entre onglets,
// l'utilisateur peut être renvoyé vers /login puis, après reconnexion,
// redirigé vers la page par défaut (/planning) au lieu du tuto cible.
export const buildPageTutorialDeepLink = (tutorialId: PageTutorialDeepLinkId): string =>
    `/documentation?tab=pages&tutorial=${tutorialId}`
