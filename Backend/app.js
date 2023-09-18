require('dotenv').config()
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
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
mongoose.connect('mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASSWORD + '@' + process.env.DB_DOMAIN, 
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


  // Ajout des routes pour livres, authentification utilisateur et images statiques
  app.use('/images', express.static(path.join(__dirname, 'images')));
  app.use('/api/books', booksRoutes);
  app.use('/api/auth', userRoutes);


module.exports = app;
