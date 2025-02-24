from data import RequestData, CalendrierOutput, PromoCalendrierOutput, JourCalendrierOutput, CoursOutput
from typing import Dict, List
from ortools.sat.python import cp_model

class DebugCallback(cp_model.CpSolverSolutionCallback):
    """ Classe pour suivre les valeurs des variables pendant la résolution. """
    def __init__(self, creneau_occupe):
        cp_model.CpSolverSolutionCallback.__init__(self)
        self._creneau_occupe = creneau_occupe
        self._solution_count = 0

    def on_solution_callback(self):
        self._solution_count += 1
        print(f"\n🔎 [Solution {self._solution_count}] ---")
        for key, var in self._creneau_occupe.items():
            if self.Value(var) == 1:
                print(f"✅ {key} → Occupe")
                
                
def extract_courses_info(data: RequestData):
    promo_courses_info = {}
    for promo in data.Promos:
        courses_info = [
            {
                "cours": course.name,
                "volume_horaire": course.heure.total if course.heure and course.heure.total not in [0, None] else 
                                 course.heure.totalAvecProf if course.heure and course.heure.totalAvecProf not in [0, None] else 0,
                "prof": course.prof if course.prof else "Prof inconnu",
                "unique_id": f"{promo.name}_{index}"
            }
            for index,course in enumerate(promo.cours)
        ]
        promo_courses_info[promo.name] = courses_info
    return promo_courses_info

def extract_calendar_info(data: RequestData) -> Dict[str, List[Dict[str, List[str]]]]:
    promo_plannings = {promo.name: [] for promo in data.Promos}

    for calendrier in data.Calendrier:
        for prom in calendrier.promos:
            jours_travailles = []
            jours_vus = set()

            for jour in prom.semaine:
                if jour.enCours and jour.jour not in jours_vus:
                    jours_travailles.append(jour.jour)
                    jours_vus.add(jour.jour)

            if any(s["dateDebut"] == calendrier.dateDebut for s in promo_plannings[prom.name]):
                continue

            semaine_data = {
                "dateDebut": calendrier.dateDebut,
                "jours_travailles": jours_travailles
            }

            promo_plannings[prom.name].append(semaine_data)

    return promo_plannings

def generate_schedule_output(data: RequestData, solver, creneaux_horaires, creneau_occupe, promo_courses_info, calendar_info) -> List[CalendrierOutput]:
    output = []

    for calendrier in data.Calendrier:
        promos_output = []

        for prom in calendrier.promos:
            jours_results = []

            for semaine_index, semaine in enumerate(calendar_info[prom.name]):
                if semaine["dateDebut"] != calendrier.dateDebut:
                    continue  

                for jour_index, jour in enumerate(semaine["jours_travailles"]):
                    cours_results = []

                    for course in promo_courses_info[prom.name]:
                        course_name = course["cours"] 
                        unique_id = course["unique_id"]

                        creneaux_assignes = [
                            creneaux_horaires[creneau_index]
                            for creneau_index in range(len(creneaux_horaires))
                            if (prom.name, unique_id, semaine_index, jour_index, creneau_index) in creneau_occupe
                            if solver.Value(creneau_occupe[(prom.name, unique_id, semaine_index, jour_index, creneau_index)]) == 1
                        ]

                        if creneaux_assignes:
                            grouped_creneaux = []
                            temp_group = [creneaux_assignes[0]]

                            for i in range(1, len(creneaux_assignes)):
                                heure_precedente = int(temp_group[-1].split("h")[0])
                                heure_actuelle = int(creneaux_assignes[i].split("h")[0])

                                if heure_actuelle == heure_precedente + 1:
                                    temp_group.append(creneaux_assignes[i])
                                else:
                                    grouped_creneaux.append(temp_group)
                                    temp_group = [creneaux_assignes[i]]

                            grouped_creneaux.append(temp_group)

                            for group in grouped_creneaux:
                                cours_results.append(CoursOutput(
                                    matiere=course_name,
                                    heureDebut=group[0].split("-")[0],
                                    heureFin=group[-1].split("-")[1],
                                    professeur=course["prof"],
                                    salleDeCours="Salle inconnue"
                                ))

                    if cours_results:
                        jours_results.append(JourCalendrierOutput(
                            jour=jour,
                            enCours=True,
                            message="",
                            cours=cours_results
                        ))

            promo_output = PromoCalendrierOutput(
                name=prom.name,
                semaine=jours_results
            )

            promos_output.append(promo_output)

        output.append(CalendrierOutput(
            dateDebut=calendrier.dateDebut,
            promos=promos_output
        ))

    return output

def extract_profs_info(data: RequestData) -> Dict[str, Dict]:
    """
    Transforme la liste des profs en un dictionnaire indexé par ID.
    """
    return {prof.ID: {"name": prof.name, "type": prof.type, "dispo": set(prof.dispo)} for prof in data.Profs}



def is_prof_available(profs_info: Dict[str, Dict],  prof_id: str, jour: str, creneau_horaire: str) -> bool:
    """
    Vérifie si un prof est disponible à un créneau donné.
    """
    if prof_id not in profs_info:
        return False  # Si le prof n'existe pas dans la base

    periode = "matin" if int(creneau_horaire.split("h")[0]) < 12 else "aprem"
    return f"{jour.lower()}_{periode}" in profs_info[prof_id]["dispo"]

    
def generate_schedule(data: RequestData) -> List[CalendrierOutput]:
    model = cp_model.CpModel()

    promo_courses_info = extract_courses_info(data)
    calendar_info = extract_calendar_info(data)
    # Extraire les profs une seule fois
    profs_info = extract_profs_info(data)

    creneaux_horaires = [f"{h}h-{h+1}h" for h in range(8, 18) if h != 12]

# 📊 Vérification du volume horaire par promo
    print("\n📊 Vérification du volume horaire par promotion :")

    total_heures_demandes_global = 0
    total_heures_disponibles_global = 0

    for promo, courses in promo_courses_info.items():
        total_heures_demandes = sum(course["volume_horaire"] for course in courses)
        total_heures_disponibles = sum(
            len(semaine["jours_travailles"]) * 8 for semaine in calendar_info.get(promo, [])
        )

        total_heures_demandes_global += total_heures_demandes
        total_heures_disponibles_global += total_heures_disponibles

        print(f"\n📌 Promo : {promo}")
        print(f"   🔹 Heures demandées : {total_heures_demandes}h")
        print(f"   🔹 Heures disponibles : {total_heures_disponibles}h")

        if total_heures_demandes > total_heures_disponibles:
            print(f"   ❌ [PROBLÈME] Trop d'heures demandées par rapport aux créneaux disponibles pour {promo} !")
        elif total_heures_demandes < total_heures_disponibles:
            print(f"   ⚠️ [ATTENTION] Il reste des créneaux horaires disponibles non utilisés pour {promo}.")
        else:
            print(f"   ✅ [OK] L'équilibre est respecté pour {promo}.")



    creneau_occupe = {}

    # ✅ Création des variables binaires pour indiquer si un créneau est occupé par un cours
    for promo, courses in promo_courses_info.items():
        for course in courses:
            course_name = course["cours"]
            unique_id = course["unique_id"]
            prof_id = course["prof"]
            total_heures = course["volume_horaire"]
            
            print(f"🛠 Création variable: {promo} - {course_name} ({total_heures}h)")
            
            creneaux_valides = []
            for semaine_index, semaine in enumerate(calendar_info[promo]):
                for jour_index, jour in enumerate(semaine["jours_travailles"]):
                    for creneau_index in range(len(creneaux_horaires)):
                        if prof_id not in profs_info:
                            # print(f"⚠️ [ALERTE] Le prof {prof_id} n'existe pas dans la liste des profs.")
                            continue
                        if is_prof_available(profs_info, prof_id, jour, creneaux_horaires[creneau_index]):
                            creneaux_valides.append((semaine_index, jour_index, creneau_index))
                        if not creneaux_valides:
                            print(f"❌ ERREUR : Aucun créneau disponible pour {course_name} (Prof: {prof_id})")
                            continue     
                        # Création d'une variable binaire qui indique si un créneau donné est utilisé par un cours
                        for semaine_index, jour_index, creneau_index in creneaux_valides:
                            creneau_occupe[(promo, unique_id, semaine_index, jour_index, creneau_index)] = model.NewBoolVar(
                                f"creneau_occupe_{promo}_{course_name}_semaine_{semaine_index}_jour_{jour_index}_creneau_{creneau_index}"
                            )

    # ✅ CONTRAINTE : Respect du volume horaire total pour chaque cours
    for promo, courses in promo_courses_info.items():
        print(f"\n🎯 [DEBUG] Promo: {promo}")
        
        for course in courses:
            course_name = course["cours"]
            unique_id = course["unique_id"]
            total_heures = course["volume_horaire"]        
            print(f"🎯 [DEBUG] Cours: {course_name} ({total_heures}h)")
            constraint_expr = sum(
                creneau_occupe[(promo, unique_id, semaine_index, jour_index, creneau_index)]
                for semaine_index, semaine in enumerate(calendar_info[promo])
                for jour_index in range(len(semaine["jours_travailles"]))
                for creneau_index in range(len(creneaux_horaires))
                if (promo, unique_id, semaine_index, jour_index, creneau_index) in creneau_occupe
            )

            model.Add(constraint_expr == int(total_heures))
            # model.Add(constraint_expr >= max(0, int(total_heures) - 24))  # Minimum : total_heures - 20
            # model.Add(constraint_expr <= int(total_heures) + 24)  # Maximum : total_heures + 20

            

    # ✅ CONTRAINTE : Un seul cours par créneau dans une même promo
    for promo in promo_courses_info.keys():
        for semaine_index, semaine in enumerate(calendar_info[promo]):
            for jour_index in range(len(semaine["jours_travailles"])):
                for creneau_index in range(len(creneaux_horaires)):
                    # La somme des cours attribués à un même créneau horaire ne doit pas dépasser 1
                    # Cela empêche plusieurs cours de se chevaucher sur le même créneau pour une promo donnée
                    constraint_expr = sum(
                        creneau_occupe[(promo, course["unique_id"], semaine_index, jour_index, creneau_index)]
                        for course in promo_courses_info[promo]
                        if (promo, course["unique_id"], semaine_index, jour_index, creneau_index) in creneau_occupe
                    )
                    model.Add(constraint_expr <= 1)

    # ✅ CONTRAINTE : Ne pas dépasser 8 heures de cours par jour pour une promo
    for promo in promo_courses_info.keys():
        for semaine_index, semaine in enumerate(calendar_info[promo]):
            for jour_index in range(len(semaine["jours_travailles"])):
                constraint_expr = sum(
                    creneau_occupe[(promo, course["unique_id"], semaine_index, jour_index, creneau_index)]
                    for course in promo_courses_info[promo]
                    for creneau_index in range(len(creneaux_horaires))
                    if (promo, course["unique_id"], semaine_index, jour_index, creneau_index) in creneau_occupe
                )

                model.Add(constraint_expr <= 8)

    # Contrainte + objectif ; maximiser longs blocs 
    # ✅ Variables pour les blocs
    # ✅ Contrainte + objectif : maximiser les blocs longs
    bloc_4h_vars = []
    bloc_3h_vars = []
    bloc_2h_vars = []
    bloc_1h_vars = []

    for promo, courses in promo_courses_info.items():
        for course in courses:
            course_name = course["cours"]
            unique_id = course["unique_id"]
            for semaine_index, semaine in enumerate(calendar_info[promo]):
                for jour_index in range(len(semaine["jours_travailles"])):
                    for creneau_index in range(len(creneaux_horaires) - 3):  # Garantir un bloc de 4h possible

                        # Variables booléennes pour chaque bloc
                        bloc_4h_var = model.NewBoolVar(f"bloc_4h_{promo}_{course_name}_{semaine_index}_{jour_index}_{creneau_index}")
                        bloc_3h_var = model.NewBoolVar(f"bloc_3h_{promo}_{course_name}_{semaine_index}_{jour_index}_{creneau_index}")
                        bloc_2h_var = model.NewBoolVar(f"bloc_2h_{promo}_{course_name}_{semaine_index}_{jour_index}_{creneau_index}")
                        bloc_1h_var = model.NewBoolVar(f"bloc_1h_{promo}_{course_name}_{semaine_index}_{jour_index}_{creneau_index}")

                        # Vérifier l'existence des clés avant de construire les blocs
                        bloc_4h = [
                            creneau_occupe[(promo, unique_id, semaine_index, jour_index, creneau_index + i)]
                            for i in range(4)
                            if (promo, unique_id, semaine_index, jour_index, creneau_index + i) in creneau_occupe
                        ]
                        bloc_3h = [
                            creneau_occupe[(promo, unique_id, semaine_index, jour_index, creneau_index + i)]
                            for i in range(3)
                            if (promo, unique_id, semaine_index, jour_index, creneau_index + i) in creneau_occupe
                        ]
                        bloc_2h = [
                            creneau_occupe[(promo, unique_id, semaine_index, jour_index, creneau_index + i)]
                            for i in range(2)
                            if (promo, unique_id, semaine_index, jour_index, creneau_index + i) in creneau_occupe
                        ]
                        bloc_1h = [
                            creneau_occupe[(promo, unique_id, semaine_index, jour_index, creneau_index)]
                            if (promo, unique_id, semaine_index, jour_index, creneau_index) in creneau_occupe
                            else None
                        ]

                        # Vérifier que les blocs ne sont pas vides avant d'ajouter les contraintes
                        if len(bloc_4h) == 4:
                            model.Add(sum(bloc_4h) == 4).OnlyEnforceIf(bloc_4h_var)
                        if len(bloc_3h) == 3:
                            model.Add(sum(bloc_3h) == 3).OnlyEnforceIf(bloc_3h_var)
                        if len(bloc_2h) == 2:
                            model.Add(sum(bloc_2h) == 2).OnlyEnforceIf(bloc_2h_var)
                        if len(bloc_1h) == 1 and bloc_1h[0] is not None:
                            model.Add(sum(bloc_1h) == 1).OnlyEnforceIf(bloc_1h_var)

                        # Priorisation : Un bloc plus long empêche un bloc plus court sur les mêmes créneaux
                        model.Add(bloc_4h_var <= bloc_3h_var)
                        model.Add(bloc_3h_var <= bloc_2h_var)
                        model.Add(bloc_2h_var <= bloc_1h_var)

                    # Ajout des variables à la liste pour l'objectif
                    bloc_4h_vars.append(bloc_4h_var)
                    bloc_3h_vars.append(bloc_3h_var)
                    bloc_2h_vars.append(bloc_2h_var)
                    bloc_1h_vars.append(bloc_1h_var)


    # 🎯 Fonction objectif : maximiser les blocs longs
    model.Maximize(
        10 * sum(bloc_4h_vars) + 5 * sum(bloc_3h_vars) + 2 * sum(bloc_2h_vars) + sum(bloc_1h_vars)
    )

    #S1 avant S2 
    # ✅ Extraction des cours par semestre
    cours_S1 = {}  # Stocke les créneaux de chaque matière de S1
    cours_S2 = {}  # Stocke les créneaux de chaque matière de S2

    for promo, courses in promo_courses_info.items():
        for course in courses:
            course_name = course["cours"]
            semestre = course.get("semestre", [1])[0]  # Par défaut, considère que c'est S1 s'il n'y a pas d'info
            if semestre == 1:
                cours_S1.setdefault(promo, []).append(course_name)
            else:
                cours_S2.setdefault(promo, []).append(course_name)

    # ✅ CONTRAINTE : Tous les créneaux de S1 doivent être placés avant ceux de S2
    for promo in cours_S1.keys():
        for course_S1 in cours_S1[promo]:
            for course_S2 in cours_S2.get(promo, []):  # Vérifie si des cours S2 existent
                for semaine_index, semaine in enumerate(calendar_info[promo]):
                    for jour_index in range(len(semaine["jours_travailles"])):
                        for creneau_index in range(len(creneaux_horaires)):
                            # Le premier créneau de S2 doit être après le dernier créneau de S1
                            model.Add(
                                sum(
                                    creneau_occupe[(promo, course_S1, s, j, c)]
                                    for s in range(semaine_index + 1)
                                    for j in range(jour_index + 1)
                                    for c in range(creneau_index + 1)
                                )
                                >=
                                sum(
                                    creneau_occupe[(promo, course_S2, s, j, c)]
                                    for s in range(semaine_index)
                                    for j in range(jour_index)
                                    for c in range(creneau_index)
                                )
                            )

    
    # ✅ CONTRAINTE : Un prof ne peut enseigner que dans une seule promo à la fois
    for prof in {course["prof"] for courses in promo_courses_info.values() for course in courses}:
        for semaine_index in range(len(calendar_info[list(promo_courses_info.keys())[0]])):  # Nombre de semaines
            for jour_index in range(len(calendar_info[list(promo_courses_info.keys())[0]][0]["jours_travailles"])):  # Nombre de jours
                for creneau_index in range(len(creneaux_horaires)):

                    # On récupère toutes les variables qui concernent ce prof
                    prof_occupe = [
                        creneau_occupe[(promo, course["unique_id"], semaine_index, jour_index, creneau_index)]
                        for promo, courses in promo_courses_info.items()
                        for course in courses
                        if course["prof"] == prof
                        and (promo, course["unique_id"], semaine_index, jour_index, creneau_index) in creneau_occupe
                    ]

                    # Un prof ne peut pas être présent dans plus d'une promo en même temps
                    if prof_occupe:
                        model.Add(sum(prof_occupe) <= 1)

        
    solver = cp_model.CpSolver()
    
    solver.parameters.max_time_in_seconds = 600  # Stop après 10s de calcul
    solver.parameters.num_search_workers = 5  # Utilise 4 cœurs (modifiable selon ton PC)
    solver.parameters.log_search_progress = True  # Affiche l’avancement pour debug
    # ✅ Éviter la recherche d'optimalité extrême
    solver.parameters.optimize_with_core = False
    
    callback = DebugCallback(creneau_occupe)
    status = solver.Solve(model)
    if status != cp_model.OPTIMAL and status != cp_model.FEASIBLE:
        
        print("\n❌ Aucune solution trouvée.")
        return []

    output = generate_schedule_output(data, solver, creneaux_horaires, creneau_occupe, promo_courses_info, calendar_info)
    
    return output
