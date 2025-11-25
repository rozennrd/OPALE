// src/utils/promoUtils.js

export const uid = (p = 'id') =>
    `${p}-${Math.random().toString(36).slice(2, 9)}`

export const makePromotions = (name, years) =>
    Array.from({ length: years }, (_, i) => ({
        id: uid('promo'),
        label: `${name} ${i + 1}`,
        students: 0,
        startDate: '',
        endDate: '',
        groups: [],
        specialties: [],
    }))

export const distributeEvenly = (total, items) => {
    if (!items.length) return items
    const safeTotal = Number(total) || 0
    if (safeTotal <= 0) {
        return items.map(it => ({ ...it, students: 0 }))
    }
    const base = Math.floor(safeTotal / items.length)
    let remainder = safeTotal % items.length

    return items.map((it, idx) => ({
        ...it,
        students: base + (idx < remainder ? 1 : 0),
    }))
}

// Calcul des totaux + flags pour une promo
export const computePromoTotals = (promo) => {
    if (!promo) {
        return {
            totalStudents: 0,
            groupsTotal: 0,
            specialtiesTotal: 0,
            groupsMismatch: false,
            specialtiesMismatch: false,
        }
    }

    const totalStudents = Number(promo.students) || 0
    const groups = promo.groups || []
    const specialties = promo.specialties || []

    const groupsTotal = groups.reduce(
        (sum, g) => sum + (Number(g.students) || 0),
        0
    )
    const specialtiesTotal = specialties.reduce(
        (sum, s) => sum + (Number(s.students) || 0),
        0
    )

    const groupsMismatch = groups.length > 0 && groupsTotal !== totalStudents
    const specialtiesMismatch =
        specialties.length > 0 && specialtiesTotal !== totalStudents

    return {
        totalStudents,
        groupsTotal,
        specialtiesTotal,
        groupsMismatch,
        specialtiesMismatch,
    }
}

// Pour afficher l'icône warning sur la ligne de promo
export const hasPromoMismatch = (promo) => {
    const {
        groupsMismatch,
        specialtiesMismatch,
    } = computePromoTotals(promo)

    return groupsMismatch || specialtiesMismatch
}