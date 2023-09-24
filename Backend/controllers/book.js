const Book = require('../models/Book'); // Import du modèle de livre
const fs = require('fs'); // Module pour la gestion des fichiers

// Fonction pour créer un nouveau livre (POST)
exports.createBook = (req, res, next) => {
  if (!req.file) {
    res.status(400).json({
      field: 'image',
      reason: 'image is required'
    })
    return
  }
  const bookObject = JSON.parse(req.body.book);  // Analyser le corps de la requête pour obtenir les données du livre.
  delete bookObject._id;  // Supprimer les champs inutiles (_id et _userId) des données du livre.
  delete bookObject._userId;
  // Créer une nouvelle instance de modèle Book avec les données du livre et d'autres informations nécessaires.
  const book = new Book({
    ...bookObject, // Utilisation de la syntaxe spread pour copier toutes les propriétés du livre.
    userId: req.auth.userId, // Attribution de l'ID de l'utilisateur authentifié comme propriétaire du livre.
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // Construction de l'URL de l'image du livre en fonction de l'hôte et du nom de fichier téléchargé.
  });

  // Enregistrer le livre dans la base de données.
  book.save()
    .then(() => { 
      res.status(201).json({ message: 'Objet enregistré !' }); // Répondre avec un statut de succès (201) et un message de confirmation.
    })
    .catch(error => { 
      res.status(400).json({ error }); // En cas d'erreur, répondre avec un statut 400 et l'erreur rencontrée.
    });
};


// Fonction pour obtenir un livre par son ID (GET)
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

// Fonction pour obtenir tous les livres (GET)
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// Fonction pour mettre à jour un livre par son ID (PUT)
exports.modifyBook = (req, res, next) => {
  // Expression conditionnelle pour créer l'objet bookObject en fonction de la présence d'un fichier (req.file) dans la requête
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      }
    : { ...req.body };

  if (bookObject.title === '') {
    return res.status(400).json({
      field: 'title',
      reason: 'title must not be empty'
    })
  }

  // Rechercher le livre par son ID
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérifier si l'utilisateur authentifié est le propriétaire du livre
      if (book.userId != req.auth.userId) {
        // Si l'utilisateur n'est pas le propriétaire, renvoyer une réponse "Non autorisé" (status 403)
        res.status(403).json({ message: 'Requête non autorisée' });
      } else {
        // Récupérer le nom du fichier image actuel à partir de l'URL de l'image
        const oldImg = book.imageUrl.split('/images/')[1];

        // Si une nouvelle image est téléchargée, supprimer l'ancienne image du système de fichiers
        if (req.file) {
          fs.unlink(`images/${oldImg}`, (err) => {
            if (err) {
              // En cas d'erreur lors de la suppression de l'ancienne image, afficher une erreur dans la console
              console.error('Erreur lors de la suppression de l\'ancienne image:', err);
            }
          });
        }

        // Mettre à jour le livre dans la base de données avec les nouvelles informations
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => {
            // Si la mise à jour réussit, renvoyer une réponse indiquant que le livre a été modifié avec succès (status 200)
            res.status(200).json({ message: 'Livre modifié !' });
          })
          .catch((error) => {
            // En cas d'erreur lors de la mise à jour du livre, renvoyer une réponse avec l'erreur correspondante (status 401)
            res.status(401).json({ error });
          });
      }
    })
    .catch((error) => {
      // En cas d'erreur lors de la recherche du livre par son ID, renvoyer une réponse avec l'erreur correspondante (status 404)
      res.status(404).json({ error });
    });
};

// Fonction pour supprimer un livre par son ID 
exports.deleteBook = (req, res, next) => {
  // Chercher le livre par son ID
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérifier si l'utilisateur authentifié est le propriétaire du livre
      if (book.userId != req.auth.userId) {
        // Si l'utilisateur n'est pas le propriétaire, renvoyer une réponse "Non autorisé" (status 403)
        res.status(403).json({ message: 'Unauthorized request' });
      } else {
        // Récupérer le nom du fichier image à partir de l'URL de l'image
        const filename = book.imageUrl.split('/images/')[1];
        
        // Supprimer le fichier image du système de fichiers
        fs.unlink(`images/${filename}`, () => {
          // Une fois que le fichier image est supprimé, supprimer le livre de la base de données
          Book.deleteOne({ _id: req.params.id })
            .then(() => { 
              res.status(200).json({ message: 'Livre supprimé !' });
            })
            .catch(error => {
              // En cas d'erreur lors de la suppression du livre de la base de données, renvoyer une réponse avec erreur
              res.status(401).json({ error });
            });
        });
      }
    })
    .catch(error => {
      // En cas d'erreur lors de la recherche du livre par son ID, renvoyer une réponse avec l'erreur
      res.status(500).json({ error });
    });
};


// Fonction pour obtenir les livres les mieux notés (GET)
exports.bestRatingBook = (req, res, next) => {
  Book.find()
    .then(book => {
      book.sort((a,b) => b.averageRating - a.averageRating)
      const threeBooks = book.slice(0, 3);
      res.status(200).json(threeBooks);
    }
  )
    .catch(error => {
      res.status(400).json({ error });
    });
};

// Fonction pour ajouter une évaluation à un livre par son ID (POST)
exports.addRating = (req, res, next) => {
  const userId = req.auth.userId; // Récupération de l'ID de l'utilisateur authentifié.
  const { rating } = req.body; // Récupération de la note (rating) à partir du corps de la requête.
  const userRating = { userId, grade: rating }; // Création d'un objet représentant l'évaluation de l'utilisateur.

  // Recherche du livre par son ID et mise à jour de ses évaluations avec la nouvelle évaluation de l'utilisateur.
  Book.findByIdAndUpdate(
    { _id: req.params.id }, // ID du livre à mettre à jour.
    { $push: { ratings: userRating } }, // Ajouter la nouvelle évaluation à la liste des évaluations existantes.
    { new: true } // Renvoyer la nouvelle version du livre après la mise à jour.
  )
    .then((book) => {
      if (!book) {
        // Si le livre n'est pas trouvé, renvoyer une réponse avec un statut 404.
        return res.status(404).json({ message: "Livre non trouvé" });
      }

      // Calculer la note moyenne en additionnant toutes les notes et en les divisant par le nombre d'évaluations.
      const totalRatings = book.ratings.reduce((sum, r) => sum + r.grade, 0);
      const averageRating = totalRatings / book.ratings.length;

      // Mettre à jour la note moyenne du livre.
      book.averageRating = averageRating;

      // Enregistrer la mise à jour du livre dans la base de données.
      return book
        .save()
        .then(() =>
          res.status(201).json(book) // Répondre avec le livre mis à jour et un statut de succès (201).
        )
        .catch((error) => {
          res.status(400).json({ error }); // En cas d'erreur lors de la sauvegarde, renvoyer une réponse avec un statut 400 et l'erreur.
        });
    })
    .catch((error) => res.status(500).json({ error })); // En cas d'erreur lors de la recherche du livre, renvoyer une réponse avec un statut 500 et l'erreur.
};

