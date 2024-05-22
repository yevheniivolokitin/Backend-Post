// authMiddleware.js
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
   const authHeader = req.headers["authorization"];
   const token = authHeader && authHeader.split(" ")[1]; // Ожидаем, что токен будет в заголовке Authorization в формате "Bearer TOKEN"

   if (!token) {
      return res.sendStatus(401); // Если токен отсутствует, возвращаем статус 401 (Unauthorized)
   }

   jwt.verify(token, "your_secret_key", (err, user) => {
      if (err) {
         return res.sendStatus(403); // Если токен недействителен, возвращаем статус 403 (Forbidden)
      }
      req.user = user;
      next(); // Если токен действителен, переходим к следующему middleware/маршруту
   });
};

module.exports = authenticateToken;
