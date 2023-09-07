const express = require('express');
const app = express();
const mongoose = require('mongoose');
const books = require('./routes/books');
//const auth = require('./routes/user');
const user = require("./controllers/User");
const path = require('path');

app.use(express.json()); 
// Activer CORS avec le middleware cors
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

// Connexion à l'API MongoDB
mongoose.connect('mongodb+srv://newuser:MongoDB@cluster0.v4ebrt9.mongodb.net/?retryWrites=true&w=majority',  // voir pour sécuriser les données
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


  // Ajout des routes pour livres, authentification utilisateur et images statiques
  app.use('/api/books', books)
  app.use('/api/auth', user)
  app.use('/images', express.static(path.join(__dirname, 'images')));
  

module.exports = app;
