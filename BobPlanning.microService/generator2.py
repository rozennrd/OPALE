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
            }
            for course in promo.cours
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

                        creneaux_assignes = [
                            creneaux_horaires[creneau_index]
                            for creneau_index in range(len(creneaux_horaires))
                            if solver.Value(creneau_occupe[(prom.name, course_name, semaine_index, jour_index, creneau_index)]) == 1
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
                                    professeur="Prof inconnu",
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

def generate_schedule(data: RequestData) -> List[CalendrierOutput]:
    model = cp_model.CpModel()

    promo_courses_info = extract_courses_info(data)
    calendar_info = extract_calendar_info(data)

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
            total_heures = course["volume_horaire"]
            
            print(f"🛠 Création variable: {promo} - {course_name} ({total_heures}h)")
            for semaine_index, semaine in enumerate(calendar_info[promo]):
                for jour_index, jour in enumerate(semaine["jours_travailles"]):
                    for creneau_index in range(len(creneaux_horaires)):
                        # Création d'une variable binaire qui indique si un créneau donné est utilisé par un cours
                        creneau_occupe[(promo, course_name, semaine_index, jour_index, creneau_index)] = model.NewBoolVar(
                            f"creneau_occupe_{promo}_{course_name}_semaine_{semaine_index}_jour_{jour_index}_creneau_{creneau_index}"
                        )

    # ✅ CONTRAINTE : Respect du volume horaire total pour chaque cours
    for promo, courses in promo_courses_info.items():
        print(f"\n🎯 [DEBUG] Promo: {promo}")
        
        for course in courses:
            course_name = course["cours"]
            total_heures = course["volume_horaire"]        
            print(f"🎯 [DEBUG] Cours: {course_name} ({total_heures}h)")
            constraint_expr = sum(
                creneau_occupe[(promo, course_name, semaine_index, jour_index, creneau_index)]
                for semaine_index, semaine in enumerate(calendar_info[promo])
                for jour_index in range(len(semaine["jours_travailles"]))
                for creneau_index in range(len(creneaux_horaires))
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
                    model.Add(
                        sum(
                            creneau_occupe[(promo, course["cours"], semaine_index, jour_index, creneau_index)]
                            for course in promo_courses_info[promo]
                        ) <= 1
                    )

    # ✅ CONTRAINTE : Ne pas dépasser 8 heures de cours par jour pour une promo
    for promo in promo_courses_info.keys():
        for semaine_index, semaine in enumerate(calendar_info[promo]):
            for jour_index in range(len(semaine["jours_travailles"])):
                model.Add(
                    sum(
                        creneau_occupe[(promo, course["cours"], semaine_index, jour_index, creneau_index)]
                        for course in promo_courses_info[promo]
                        for creneau_index in range(len(creneaux_horaires))
                    ) <= 8  # ⏳ Maximum 8 heures par jour
                )
                # print(f"✅ [CONTRAINTE] {promo} - Jour {jour_index} limité à 8h max")

    solver = cp_model.CpSolver()
    callback = DebugCallback(creneau_occupe)
    status = solver.Solve(model)
    if status != cp_model.OPTIMAL and status != cp_model.FEASIBLE:
        
        print("\n❌ Aucune solution trouvée.")
        return []

    output = generate_schedule_output(data, solver, creneaux_horaires, creneau_occupe, promo_courses_info, calendar_info)
    
    return output
