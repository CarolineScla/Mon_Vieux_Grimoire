const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer');
const Book = require('../models/Book');
const fs = require('fs');

// Récupérer tous les livres
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Créer un nouveau livre
router.post('/', auth, multer, async (req, res) => {
  try {
    // Extraction des données JSON à partir de la requête
    const { title, author, year, genre, ratings } = JSON.parse(req.body.book);
    const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    
    // Création d'un nouvel objet Book
    const book = new Book({
      title,
      author,
      year,
      genre,
      ratings,
      imageUrl,
      userId: req.auth.userId,
      averageRating: ratings[0].grade
    });

    await book.save();
    res.status(201).json({ message: 'Livre enregistré !' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Récupérer un livre par son ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un livre
router.put('/:id', auth, multer, async (req, res) => {
  try {
    const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    // Vérification de l'autorisation de mise à jour du livre
    const book = await Book.findOne({ _id: req.params.id });
    if (book.userId != req.auth.userId) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    // Mise à jour du livre
    await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
    res.status(200).json({ message: 'Livre modifié !' });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Supprimer un livre
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (book.userId != req.auth.userId) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Suppression de l'image du livre
    const filename = book.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, async () => {
      // Suppression du livre de la base de données
      await Book.deleteOne({ _id: req.params.id });
      res.status(200).json({ message: 'Livre supprimé !' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour les évaluations d'un livre
router.post('/:id/rating', auth, async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
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
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les livres les mieux notés
router.get('/bestrating', async (req, res) => {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3);
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
