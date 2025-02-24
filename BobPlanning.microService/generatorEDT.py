from datetime import datetime, timedelta
import json
import math
from data import RequestData, CalendrierOutput, PromoCalendrierOutput, JourCalendrierOutput, CoursOutput
from typing import List, Dict
from ortools.sat.python import cp_model

jours_semaine = {
    "Monday": "Lundi",
    "Tuesday": "Mardi",
    "Wednesday": "Mercredi",
    "Thursday": "Jeudi",
    "Friday": "Vendredi",
    "Saturday": "Samedi",
    "Sunday": "Dimanche"
}

def extract_calendar_info(data: RequestData) -> Dict[str, List[JourCalendrierOutput]]:
    """
    Extrait les jours travaillés pour chaque promo et les formate en une structure claire.
    """
    promo_plannings = {promo.name: [] for promo in data.Promos}

    print("\n🔍 [DEBUG] Vérification des promotions et des matières")
    
    for promo in data.Promos:
        print(f"📌 Promo : {promo.name}")
        for course in promo.cours:
            total_hours = course.heure.total if course.heure and course.heure.total is not None else 0
            print(f"   📚 {course.name} - Volume horaire : {total_hours}h")
    
    print("\n📅 [DEBUG] Vérification des jours travaillés par promo")
    
    for cal in data.Calendrier:
        base_date = cal.dateDebut
        for promo_cal in cal.promos:
            jours_travailles = [jour for jour in promo_cal.semaine if jour.enCours]
            
            jours_travailles_output = [
                JourCalendrierOutput(
                    jour=jour.jour,
                    enCours=jour.enCours, 
                    message=jour.message, 
                    cours=[]  # On laisse vide pour être rempli après
                ) for jour in jours_travailles
            ]

            promo_plannings[promo_cal.name].extend(jours_travailles_output)

            # Affichage des jours travaillés
            jours_formates = [jour.jour for jour in jours_travailles_output]
            print(f"📌 Promo : {promo_cal.name} - Jours travaillés : {jours_formates if jours_formates else '⚠️ Aucun jour travaillé'}")

    return promo_plannings

def extract_courses_info(data: RequestData) -> Dict[str, List[Dict[str, float]]]:
    """
    Extrait les informations sur les cours et leur volume horaire total pour chaque promo.
    """
    promo_courses_info = {}
    for promo in data.Promos:
        courses_info = [
            {
                "cours": course.name,
                "volume_horaire": course.heure.total if course.heure and course.heure.total is not None else 0
            }
            
            for course in promo.cours
        ]
        promo_courses_info[promo.name] = courses_info
    return promo_courses_info

def generate_schedule(data: RequestData) -> List[CalendrierOutput]:
    print("✅ Fonction generate_schedule appelée avec les données :")
    
    model = cp_model.CpModel()  # Création du modèle de contraintes
    
    promo_calendar_info = extract_calendar_info(data)  # Jours travaillés
    promo_courses_info = extract_courses_info(data)  # Infos sur les cours
    
    # Créneaux horaires disponibles (1h chacun)
    creneaux_horaires = [f"{h}h-{h+1}h" for h in range(8, 18) if h != 12]
    
    # Dictionnaires de variables de décision
    heures_par_jour = {}  # Associe un nombre d'heures de cours par jour
    cours_par_creneau = {}  # Associe un créneau horaire à un cours donné
    
    # ✅ Définition des variables de décision pour chaque promo et matière
    for promo, courses in promo_courses_info.items():
        jours_travailles = promo_calendar_info[promo]
        
        for course in courses:
            course_name = course["cours"]
            total_heures = course["volume_horaire"]
            
            for jour_index, jour in enumerate(jours_travailles):
                # Variable pour suivre les heures de cours par jour
                var_heure_name = f"heures_{promo}_{course_name}_jour_{jour_index}"
                heures_par_jour[var_heure_name] = model.NewIntVar(0, math.ceil(total_heures), var_heure_name)
                
                for creneau_index, creneau in enumerate(creneaux_horaires):
                    # Variable binaire : 1 si le cours est placé dans ce créneau, 0 sinon
                    var_creneau_name = f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}"
                    cours_par_creneau[var_creneau_name] = model.NewBoolVar(var_creneau_name)
            
    # ✅ Contraintes : Volume horaire respecté
    for promo, courses in promo_courses_info.items():
        jours_travailles = promo_calendar_info[promo]
        
        for course in courses:
            course_name = course["cours"]
            total_heures = math.ceil(course["volume_horaire"])
            
            # Somme des heures allouées sur tous les jours == total demandé
            model.Add(sum(heures_par_jour[f"heures_{promo}_{course_name}_jour_{jour_index}"]
                         for jour_index in range(len(jours_travailles))) == total_heures)
            
            for jour_index in range(len(jours_travailles)):
                # Maximum 8h de cours par jour pour une matière
                model.Add(heures_par_jour[f"heures_{promo}_{course_name}_jour_{jour_index}"] <= 8)
    
    # ✅ Contraintes : Créneaux horaires
    for promo, jours_travailles in promo_calendar_info.items():
        for jour_index in range(len(jours_travailles)):
            # La somme des cours dans une journée ne doit pas dépasser 8h
            model.Add(sum(heures_par_jour[f"heures_{promo}_{course['cours']}_jour_{jour_index}"]
                          for course in promo_courses_info[promo]) <= 8)
    
            for course in promo_courses_info[promo]:
                course_name = course["cours"]
                total_heure_du_jour = sum(
                    cours_par_creneau[f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}"]
                    for creneau_index in range(len(creneaux_horaires))
                    if f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}" in cours_par_creneau
                )


                model.Add(total_heure_du_jour == heures_par_jour[f"heures_{promo}_{course_name}_jour_{jour_index}"])
            
    # ✅ Contraintes : Un seul cours par créneau (par promo)
    for promo, jours_travailles in promo_calendar_info.items():
        for jour_index in range(len(jours_travailles)):
            for creneau_index in range(len(creneaux_horaires)):
                # La somme des cours assignés à ce créneau pour une promo ne doit pas dépasser 1
                model.Add(
                    sum(
                        cours_par_creneau[f"creneau_{promo}_{course['cours']}_jour_{jour_index}_creneau_{creneau_index}"]
                        for course in promo_courses_info[promo]
                    ) <= 1
                )
    
    # ✅ Contraintes : Pas plus de 4 heures consécutives de cours
    for promo, jours_travailles in promo_calendar_info.items():
        for jour_index in range(len(jours_travailles)):
            for course in promo_courses_info[promo]:
                course_name = course["cours"]

                for start in range(len(creneaux_horaires) - 4):
                    # Somme des 5 créneaux consécutifs
                    model.Add(
                        sum(
                            cours_par_creneau[f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}"]
                            for creneau_index in range(start, start + 5)
                            if f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}" in cours_par_creneau
                        ) <= 4  # Maximum 4 créneaux consécutifs
                    )
    
    
    # Définition des variables pour les blocs de 4h, 3h et 2h
    bloc_4h, bloc_3h, bloc_2h = [], [], []

    for promo, jours_travailles in promo_calendar_info.items():
        for jour_index in range(len(jours_travailles)):
            for course in promo_courses_info[promo]:
                course_name = course["cours"]

                # 🔹 Blocs de 4h
                for start in range(len(creneaux_horaires) - 3):  # 3 car on veut 4 créneaux consécutifs
                    var_bloc = model.NewBoolVar(f"bloc_4h_{promo}_{course_name}_jour_{jour_index}_start_{start}")

                    model.Add(
                        sum(
                            cours_par_creneau[f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}"]
                            for creneau_index in range(start, start + 4)
                        ) == 4
                    ).OnlyEnforceIf(var_bloc)

                    model.Add(
                        sum(
                            cours_par_creneau[f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}"]
                            for creneau_index in range(start, start + 4)
                        ) < 4
                    ).OnlyEnforceIf(var_bloc.Not())

                    bloc_4h.append(var_bloc)

                # 🔹 Blocs de 3h
                for start in range(len(creneaux_horaires) - 2):  # 2 car on veut 3 créneaux consécutifs
                    var_bloc = model.NewBoolVar(f"bloc_3h_{promo}_{course_name}_jour_{jour_index}_start_{start}")

                    model.Add(
                        sum(
                            cours_par_creneau[f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}"]
                            for creneau_index in range(start, start + 3)
                        ) == 3
                    ).OnlyEnforceIf(var_bloc)

                    model.Add(
                        sum(
                            cours_par_creneau[f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}"]
                            for creneau_index in range(start, start + 3)
                        ) < 3
                    ).OnlyEnforceIf(var_bloc.Not())

                    bloc_3h.append(var_bloc)

                # 🔹 Blocs de 2h
                for start in range(len(creneaux_horaires) - 1):  # 1 car on veut 2 créneaux consécutifs
                    var_bloc = model.NewBoolVar(f"bloc_2h_{promo}_{course_name}_jour_{jour_index}_start_{start}")

                    model.Add(
                        sum(
                            cours_par_creneau[f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}"]
                            for creneau_index in range(start, start + 2)
                        ) == 2
                    ).OnlyEnforceIf(var_bloc)

                    model.Add(
                        sum(
                            cours_par_creneau[f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}"]
                            for creneau_index in range(start, start + 2)
                        ) < 2
                    ).OnlyEnforceIf(var_bloc.Not())

                    bloc_2h.append(var_bloc)
                    
                    
    score_jour = {}

    for promo, jours_travailles in promo_calendar_info.items():
        for jour_index, jour in enumerate(jours_travailles):
            score_jour[jour_index] = model.NewIntVar(0, len(creneaux_horaires), f"score_jour_{promo}_{jour_index}")

            model.Add(
                score_jour[jour_index] ==
                sum(
                    cours_par_creneau[f"creneau_{promo}_{course['cours']}_jour_{jour_index}_creneau_{creneau_index}"]
                    for course in promo_courses_info[promo]
                    for creneau_index in range(len(creneaux_horaires))
                    if f"creneau_{promo}_{course['cours']}_jour_{jour_index}_creneau_{creneau_index}" in cours_par_creneau
                )
            )

    # ✅ Objectif 1 : Privilégier les matinées
    # objectif_heure = sum(
    #     creneau_index * cours_par_creneau[f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}"]
    #     for promo, jours_travailles in promo_calendar_info.items()
    #     for jour_index in range(len(jours_travailles))
    #     for course in promo_courses_info[promo]
    #     for creneau_index in range(len(creneaux_horaires))
    #     if f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}" in cours_par_creneau
    # )

    # ✅ Objectif 2 : Éviter les trous entre créneaux d'un même cours
    # penalite_sauts = []
    # for promo, jours_travailles in promo_calendar_info.items():
    #     for jour_index in range(len(jours_travailles)):
    #         for course in promo_courses_info[promo]:
    #             course_name = course["cours"]

    #             for creneau_index in range(1, len(creneaux_horaires)):  # Comparer avec le créneau précédent
    #                 var_current = cours_par_creneau.get(f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}", None)
    #                 var_prev = cours_par_creneau.get(f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index - 1}", None)

    #                 if var_current is not None and var_prev is not None:

    #                     saut_detecte = model.NewBoolVar(f"saut_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}")
                        
    #                     # saut_detecte = 1 si var_current est actif mais var_prev est inactif
    #                     model.Add(var_current - var_prev <= saut_detecte)
    #                     model.Add(saut_detecte <= 1 - var_prev)
                        
    #                     penalite_sauts.append(saut_detecte)

    # ✅ Minimisation combinée des objectifs
    #model.Minimize(objectif_heure + 5 * sum(penalite_sauts))  # 5 = coefficient de pénalité pour les trous

    # Maximiser les blocs de cours consécutifs et remplir les premiers jours de la semaine

    penalite_sauts = []
    score_jour = {}

    for promo, jours_travailles in promo_calendar_info.items():
        for jour_index, jour in enumerate(jours_travailles):
            for course in promo_courses_info[promo]:
                course_name = course["cours"]

                for creneau_index in range(1, len(creneaux_horaires)):  # Comparer avec le créneau précédent
                    var_current = cours_par_creneau.get(f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}", None)
                    var_prev = cours_par_creneau.get(f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index - 1}", None)

                    if var_current is not None and var_prev is not None:
                        saut_detecte = model.NewBoolVar(f"saut_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}")
                        
                        # saut_detecté = 1 si var_current est actif mais var_prev est inactif
                        model.Add(var_current - var_prev <= saut_detecte)
                        model.Add(saut_detecte <= 1 - var_prev)

                        penalite_sauts.append(saut_detecte)

                # Assigner un score plus élevé aux jours plus tôt dans la semaine
                score_jour[jour_index] = model.NewIntVar(0, len(creneaux_horaires), f"score_jour_{promo}_{jour_index}")

                model.Add(
                    score_jour[jour_index] ==
                    sum(
                        cours_par_creneau[f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}"]
                        for creneau_index in range(len(creneaux_horaires))
                        if f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}" in cours_par_creneau
                    )
                )

    # ✅ Objectif : Maximiser les blocs et remplir le début de semaine
    # model.Maximize(
    #     sum(score_jour[jour_index] * (len(jours_travailles) - jour_index) for jour_index in range(len(jours_travailles)))  # Priorise le début de semaine
    #     - sum(penalite_sauts)  # Évite les trous
    # )
    
        # Maximisation de l'usage des blocs de 4h pour un même cours
    # model.Maximize(
    #     sum(score_jour[jour_index] * (len(jours_travailles) - jour_index) for jour_index in range(len(jours_travailles)))  # Priorise le début de semaine
    #     - sum(penalite_sauts)  # Évite les trous
    #     + sum(bloc_4h)  # Maximiser le nombre de blocs de 4h consécutifs
    # )

    model.Maximize(
        sum(score_jour[jour_index] * (len(jours_travailles) - jour_index) for jour_index in range(len(jours_travailles)))  # Priorise le début de semaine
         - sum(penalite_sauts)  # Évite les trous
         + 4 * sum(bloc_4h)  # Priorité aux blocs de 4h (coefficient 4)
        + 3 * sum(bloc_3h)  # Ensuite les blocs de 3h (coefficient 3)
        + 2 * sum(bloc_2h)  # Enfin les blocs de 2h (coefficient 2)
        
    )
    # model.Minimize(0)
    
    # ✅ Résolution du modèle
    solver = cp_model.CpSolver()
    
    solver.parameters.max_time_in_seconds = 20 # Limiter à 60 secondes pour éviter l'exécution infinie
    status = solver.Solve(model)
    
    calendrier_resultat = []
    
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        print("\n✅ Solution trouvée :")
        for promo, courses in promo_courses_info.items():
            print(f"\n📌 Promo : {promo}")
            for course in courses:
                course_name = course["cours"]
                print(f"  📚 {course_name}:")
                for jour_index, jour in enumerate(promo_calendar_info[promo]):
                    heures_assignees = solver.Value(heures_par_jour[f"heures_{promo}_{course_name}_jour_{jour_index}"])
                    if heures_assignees > 0:
                        print(f"    - {jour.jour}: {heures_assignees}h")
                        
                    # 🔹 Affichage des créneaux utilisés
                    creneaux_utilises = [
                        creneaux_horaires[creneau_index]
                        for creneau_index in range(len(creneaux_horaires))
                        if solver.Value(cours_par_creneau[f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}"]) == 1
                    ]
                    
                    print(f"      🕒 Créneaux assignés : {', '.join(creneaux_utilises)}")
                    
        for cal in data.Calendrier:
            promo_results = []

            for promo in data.Promos:
                jours_results = []

                for jour_index, jour in enumerate(promo_calendar_info[promo.name]):
                    if jour_index >= len(cal.promos[0].semaine):  # Empêcher d'ajouter des jours en trop
                        break

                    cours_results = []

                    for course in promo_courses_info[promo.name]:
                        course_name = course["cours"]
                        heures_assignees = solver.Value(heures_par_jour[f"heures_{promo.name}_{course_name}_jour_{jour_index}"])

                        if heures_assignees > 0:
                            # Déterminer les créneaux assignés
                            creneaux_assignes = [
                                creneaux_horaires[creneau_index]
                                for creneau_index in range(len(creneaux_horaires))
                                if solver.Value(cours_par_creneau[f"creneau_{promo.name}_{course_name}_jour_{jour_index}_creneau_{creneau_index}"]) == 1
                            ]

                            if creneaux_assignes:
                                grouped_creneaux = []
                                temp_group = [creneaux_assignes[0]]

                                for i in range(1, len(creneaux_assignes)):
                                    heure_precedente = int(temp_group[-1].split("h")[0])
                                    heure_actuelle = int(creneaux_assignes[i].split("h")[0])

                                    if heure_actuelle == heure_precedente + 1:  # Créneau consécutif
                                        temp_group.append(creneaux_assignes[i])
                                    else:
                                        grouped_creneaux.append(temp_group)
                                        temp_group = [creneaux_assignes[i]]

                                grouped_creneaux.append(temp_group)  # Ajouter le dernier groupe

                                for group in grouped_creneaux:
                                    cours_results.append(CoursOutput(
                                        matiere=course_name,
                                        heureDebut=group[0].split("-")[0],
                                        heureFin=group[-1].split("-")[1],
                                        professeur="Prof inconnu",
                                        salleDeCours="Salle inconnue"
                                    ))

                    # Construire la structure du jour
                    jours_results.append(JourCalendrierOutput(
                        jour=jour.jour,
                        enCours=jour.enCours,
                        message=jour.message,
                        cours=cours_results
                    ))

                # Construire la structure de la promo
                promo_results.append(PromoCalendrierOutput(
                    name=promo.name,
                    semaine=jours_results
                ))

            # Construire la structure de l'ensemble du calendrier
            calendrier_resultat.append(CalendrierOutput(
                dateDebut=cal.dateDebut,
                promos=promo_results
            ))

                    
    else:
        print("\n❌ Aucune solution trouvée.")
    
    return calendrier_resultat  
