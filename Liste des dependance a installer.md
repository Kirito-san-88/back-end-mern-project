pour initialiser le projet lancer les commandes suivante :

Partie Back-end:

- npm init -y ( pour initaliser le package.json)
- npm i -s express nodemon dotenv ( pour installer express, nodemon et dotenv ( variable d'environnement))
- npm i -s mongoose ( pour installer mongodb dans le projet).
- creer un dossier config et dedans creer un fichier nommer .env et mettre PORT=5000
- modifier le package.json dans la section scripts ajouter une ligne : "start": "nodemon server" ( comme ça quand je fait npm start sa lance nodemon directement)
- ajouter un fichier .gitignore a la raçine du projet et mettre /node_modules et /config/.env ( les path mis dans ce fichier ne seront pas git)
- npm i -s body-parser ( pour installer bodyparser)
- npm i -s validator ( pour installer validator)
- npm i -s bcrypt ( pour installer bcrypt)
- npm i -s jsonwebtoken ( pour installer JWT pour genere un token a l'utilisateur)
- npm i -s cookie-parser ( pour recuperer les cookies)
- npm i -s multer ( pour installer l'upload d'image).
- npm i -s cors ( pour installer cors).
