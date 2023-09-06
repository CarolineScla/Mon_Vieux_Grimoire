const express = require('express');
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



// routes a ajouter 
  

module.exports = app;
