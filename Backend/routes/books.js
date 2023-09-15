const express = require('express');
const router = express.Router();

// Middleware d'authentification
const auth = require('../middlewares/auth');

// Middleware Multer pour le traitement des fichiers
const multer = require('../middlewares/multer');

// Contrôleur pour la gestion des livres
const booksCtrl = require('../controllers/book');

// Route pour la création d'un nouveau livre (POST)
router.post('/', auth, multer, booksCtrl.createBook);

// Route pour obtenir les livres les mieux notés (GET)
router.get('/bestrating', booksCtrl.bestRatingBook);

// Route pour obtenir tous les livres (GET)
router.get('/', booksCtrl.getAllBooks);

// Route pour obtenir un livre par son ID (GET)
router.get('/:id', booksCtrl.getOneBook);

// Route pour mettre à jour un livre par son ID (PUT)
router.put('/:id', auth, multer, booksCtrl.modifyBook);

// Route pour supprimer un livre par son ID (DELETE)
router.delete('/:id', auth, booksCtrl.deleteBook);

// Route pour ajouter une évaluation à un livre par son ID (POST)
router.post('/:id/rating', auth, booksCtrl.addRating);

// Exporter le routeur
module.exports = router;
