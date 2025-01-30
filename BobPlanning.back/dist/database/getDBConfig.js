"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Fonction pour lire et parser le fichier db.conf
function getDBConfig() {
    const confPath = path.join(__dirname, 'config/db.conf');
    try {
        const fileContent = fs.readFileSync(confPath, 'utf-8');
        const config = {}; // Initialisation partielle pour éviter d'obliger tous les champs au début
        // Split le contenu par ligne et parse chaque ligne
        fileContent.split('\n').forEach((line) => {
            line = line.trim(); // Supprimer les espaces autour des lignes
            if (line && line[0] !== '#') { // Ignorer les lignes vides ou les commentaires
                const [key, value] = line.split('=');
                if (key && value) {
                    const trimmedKey = key.trim();
                    config[trimmedKey] = trimmedKey === 'DB_PORT' ? Number(value.trim()) : value.trim();
                }
            }
        });
        // Validation pour vérifier que toutes les propriétés sont bien définies
        if (!config.DB_HOST ||
            !config.DB_USER ||
            !config.DB_PASSWORD ||
            !config.DB_NAME ||
            !config.DB_PORT) {
            throw new Error('Une ou plusieurs variables de configuration sont manquantes dans db.conf');
        }
        // On retourne les variables en tant que DBConfig
        return config;
    }
    catch (err) {
        console.error('Erreur lors de la lecture du fichier db.conf:', err);
        throw err; // Relance l'erreur après l'affichage dans la console
    }
}
exports.default = getDBConfig;
