# Micro Planning
La planification micro est la planification heure par heure, semaine par semaine, pour chaque promo. 

À l'heure actuelle, ceci est une ébauche de micro planning. 

## Description
Voici la liste des routes actuellement supportées :
- api/scheduling/schedule : prépare l'emploi du temps 
- POST api/scheduling/schedule/export : exporte l'emploi du temps en xls
Ces deux endpoints sont liés à la base de données. 

Un problème s'est posé cependant : si la planification ne fonctionne pas, cela vient-il de la base de données ou de la logique du code ?
Pour répondre à cette question, on remplace l'infra par une infra qui récupère les données dans un json (infra-json)
- api/scheduling/json/schedule
- POST api/scheduling/json/schedule/export 

Ces deux endpoints offrent les mêmes fonctionnalités que les précédents, mais en se basant sur des données mockées, disponibles dans infra-json. 
Voici la commande bash pour utiliser l'endpoint (requête permettant d'accéder à la fonctionnalité avec les données mockées actuellement)
```bash
curl -X POST http://localhost:8080/api/scheduling/json/schedule/export 
\\n  -H "Content-Type: application/json" 
\\n  -d '{"promotionId": "22222222-2222-2222-2222-222222222221", "startDate": "2025-01-06", "endDate": "2025-01-31"}' 
\\n  --output schedule_ING1.xlsx\n
```
La requête est sensiblement la même pour api/scheduling/schedule/export. 

```bash
curl -X POST http://localhost:8080/api/scheduling/schedule/export 
\\n  -H "Content-Type: application/json" 
\\n  -d '{"promotionId": "9fd9e402-5a45-4b5b-ac88-837d8451af9e", "startDate": "2025-01-06", "endDate": "2025-01-31"}' 
\\n  --output schedule_ING1.xlsx\n
```
L'id promo ici correspond à AP3 (suivant le script d'initialisation de la BDD - voir database init script). Il faudra importer une maquette, assigner les professeurs aux matières pour le bon nombre d'heures, puis il sera possible d'utiliser cette requête.

## Architecture
L'architecture du service est inspirée de l'architecture hexagonale, parce que : 
- on a besoin de pouvoir brancher le json ou la BDD
- on prévoit un nombre important de contraintes
- on souhaite isoler le domaine pour qu'il soit le plus testable possible. 

## Contraintes
Les contraintes implémentées couvrent actuellement : 
- les cours doivent être de 8h à 18h max (contraintes dures)
- respect de la pause déjeuner (le cours termine le matin ou commence l'après midi)
- respect d'une heure de pause déjeuner
- les salles doivent être assez grandes pour pouvoir accueillir les promotions (capacité > effectifs de la promotion)
- une même salle ne peut pas accueillir deux cours en même temps
- un même professeur ne peut pas donner cours à deux classes en même temps (temporaire, il faudra ajouter la gestion des cours non-bloquants comme le projet : un professeur peut donner un cours et encadrer une séance de projet en même temps)
- une même promotion ne peut pas être dans deux cours en même temps.
