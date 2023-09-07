// Opérations CRUD (Create, Read, Update, Delete)
const express = require('express')
const router = express.Router()
const bookCont = require('../controllers/book')
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer');

router.route('/')
  .get(bookCont.getAllBooks)
  .post(auth, multer, bookCont.createBook);

router.get('/bestrating', bookCont.bestRatedBooks)

router.route('/:id')
      .get(bookCont.getOneBook)
      .put(auth, multer, bookCont.updateOneBook)
      .delete(auth, bookCont.deleteOneBook)

 
router.post('/:id/rating', auth, bookCont.updateRatings);



module.exports = router