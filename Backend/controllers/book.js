const Book = require('../models/Book');
const fs = require('fs');

// Récupérer tous les livres
exports.getAllBooks = (req, res) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(err => res.status(400).json({ error: err.message }));
};

// Créer un nouveau livre
exports.createBook = (req, res, next) => {
  // Extraction de données JSON à partir de la requête
  const bookObject = JSON.parse(req.body.book);

  // Création d'un nouvel objet Book
  const book = new Book({
    ...req.body,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    title: bookObject.title,
    author: bookObject.author,
    year: bookObject.year,
    genre: bookObject.genre,
    ratings: bookObject.ratings,
    averageRating: bookObject.ratings[0].grade
  });

  // Sauvegarde du livre dans la base de données
  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
    .catch(err => res.status(400).json({ error: err.message }));
};

// Récupérer un livre par son ID
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }
      res.status(200).json(book);
    })
    .catch(err => res.status(500).json({ error: err.message }));
};

// Mettre à jour un livre
exports.updateOneBook = (req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId;

  // Vérification de l'autorisation de mise à jour du livre
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        return res.status(401).json({ message: 'Non autorisé' });
      }

      // Mise à jour du livre
      Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre modifié !' }))
        .catch(err => res.status(401).json({ error: err.message }));
    })
    .catch(err => res.status(400).json({ error: err.message }));
};

// Supprimer un livre
exports.deleteOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      // Suppression de l'image du livre
      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        // Suppression du livre de la base de données
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
          .catch(err => res.status(401).json({ error: err.message }));
      });
    })
    .catch(err => res.status(500).json({ error: err.message }));
};

// Mettre à jour les évaluations d'un livre
exports.updateRatings = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      // Ajout d'une nouvelle évaluation au livre
      book.ratings.push({ userId: req.auth.userId, grade: req.body.rating });

      // Calcul de la nouvelle note moyenne
      let totalRating = 0;
      for (let i = 0; i < book.ratings.length; i++) {
        let currentRating = book.ratings[i].grade;
        totalRating += currentRating;
      }
      book.averageRating = totalRating / book.ratings.length;

      // Sauvegarde du livre mis à jour
      return book.save();
    })
    .then(book => res.status(201).json(book))
    .catch(err => res.status(500).json({ error: err.message }));
};

// Récupérer les livres les mieux notés
exports.bestRatedBooks = (req, res) => {
  Book.find().sort({ averageRating: -1 }).limit(3)
    .then(books => res.status(200).json(books))
    .catch(err => res.status(400).json({ error: err.message }));
};
