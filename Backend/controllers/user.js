const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Fonction de gestion de l'inscription
exports.signup = (req, res, next) => {
    // Hachage du mot de passe reçu dans la requête (req.body.password)
    bcrypt.hash(req.body.password, 10) // Nombre d'itérations que la fonction de hachage bcrypt effectue
        .then(hash => {
            // Création d'un nouvel utilisateur avec l'email et le mot de passe haché
            const user = new User({
                email: req.body.email,
                password: hash
            });
            // Enregistrement de l'utilisateur dans la base de données
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

// Fonction de gestion de la connexion
exports.login = (req, res, next) => {
    // Recherche de l'utilisateur dans la base de données par son email
    User.findOne({ email: req.body.email })
        .then(user => {
            // Vérification si l'utilisateur existe
            if (!user) {
                return res.status(401).json({ message: 'Login ou mot de passe erronné' });
            }
            // Comparaison du mot de passe reçu avec le mot de passe haché de l'utilisateur
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    // Vérification de la validité du mot de passe
                    if (!valid) {
                        return res.status(401).json({ message: 'Login ou mot de passe erronné' });
                    }
                    // Si le mot de passe est valide, génération d'un token JWT pour l'authentification
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET', // Clé secrète pour la création du token (à remplacer par une clé sécurisée)
                            { expiresIn: '48h' } // Durée de validité du token
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};
