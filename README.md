To run the project : 

Add a file .env at the root of the project that contains this : 
*--------Fichier .env--------*
  MYSQL_ROOT_PASSWORD=rootpassword
  MYSQL_DATABASE=bobPlanning
  MYSQL_USER=bob
  MYSQL_PASSWORD=thisIsBobPlanning!
  MYSQL_ROOT_HOST=%
  MYSQL_INITDB_SKIP_TZINFO=1
  MYSQL_TCP_PORT=3306
  MYSQL_WAIT_TIMEOUT=28800
  MYSQL_INTERACTIVE_TIMEOUT=28800
*--------------------------------*

 - For front : 
 Add this .env file in BobPlanning.front : 
 *--------Fichier .env--------*
  VITE_RACINE_FETCHER_URL=http://localhost:3000
 *--------------------------------*
 Go to BobPlanning.front --> cd .\BobPlanning.front
 Install library --> npm i
 Run the project --> npm run dev 

 - For back : 
 Ajouter un fichier db.conf dans src/database/config
 *--------Fichier db.conf--------*
    DB_HOST=Hôte
    DB_USER=User
    DB_PASSWORD=Password
    DB_NAME=nom_db
    DB_PORT=num_port
*--------------------------------*

 Go to BobPlanning.back --> cd .\BobPlanning.back
 Install library --> npm i
 Run the project --> npm run dev

 - For microService : 
 Go to BobPlanning.microService --> cd .\BobPlanning.microService
 Create a env mode for python --> python -m venv venv
 Go in env mode for python : 
   If you are a linux user --> source venv/bin/activate 
   If you are a Windows user --> .\venv\Scripts\activate
 Install library --> pip install -r requirements.txt
 Run the project --> uvicorn main:app --port 3001 --reload

 Pour mettre à jour les installations de lib --> pip freeze > requirements.txt