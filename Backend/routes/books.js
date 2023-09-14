// Opérations CRUD (Create, Read, Update, Delete)
const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer');

const booksCtrl = require('../controllers/book');
router.post('/', auth, multer, booksCtrl.createBook);
router.get('/bestrating', booksCtrl.bestRatingBook);
router.get('/', booksCtrl.getAllBooks);

router.get('/:id', booksCtrl.getOneBook);
router.put('/:id', auth, multer, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.post('/:id/rating', auth, booksCtrl.addRating);


module.exports = router;