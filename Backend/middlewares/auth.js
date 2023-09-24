const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
   try {
       // Vérifier si le token existe dans les en-têtes de la requête
       const token = req.headers.authorization.split(' ')[1];
       
       if (!token) {
           return res.status(401).json({ error: 'Token missing' });
       }

       // Vérifier et décoder le token
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');

       // Ajouter les informations de l'utilisateur au contexte de la requête
       req.auth = {
           userId: decodedToken.userId
       };

       // Passer à l'étape suivante du middleware
       next();
   } catch (error) {
       // En cas d'erreur lors de la vérification du token
       return res.status(403).json({ error: 'Invalid token' });
   }
};
