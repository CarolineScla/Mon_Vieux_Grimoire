// Importer le module multer pour la gestion des fichiers téléchargés
const multer = require('multer');

// Définir les types MIME autorisés et leurs extensions associées
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  // Destination des fichiers téléchargés
  destination: (req, file, callback) => {
    // Le répertoire 'images' est utilisé pour stocker les fichiers téléchargés
    callback(null, 'images');
  },
  // Nom du fichier téléchargé
  filename: (req, file, callback) => {
    // Remplacer les espaces dans le nom du fichier par des underscores
    const name = file.originalname.split(' ').join('_');
    // Récupérer l'extension du fichier à partir du type MIME
    const extension = MIME_TYPES[file.mimetype];
    // Construire le nom du fichier avec un horodatage pour le rendre unique
    callback(null, name + Date.now() + '.' + extension);
  }
});

// Exporter un middleware Multer configuré pour traiter un seul fichier avec le champ 'image'
module.exports = multer({ storage: storage }).single('image');
