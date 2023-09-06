const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Book = require('./models/Book');

const app = express();

mongoose.connect('mongodb+srv://newuser:MongoDB@cluster0.v4ebrt9.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

  // Middleware pour gérer les requêtes JSON
app.use(express.json());
app.use((req, res, next) => {
    //CORS (Cross-Origin Resource Sharing)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(bodyParser.json());

app.post('/api/stuff', (req, res, next) => {
    delete req.body._id;
    const Book = new Book({
      ...req.body  //pour faire une copie de tous les éléments de req.body
    });
    Book.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => res.status(400).json({ error }));
  });

  app.use('/api/stuff', (req, res, next) => {
    Book.find()
      .then(Books => res.status(200).json(Books))
      .catch(error => res.status(400).json({ error }));
  });
  

module.exports = app;
