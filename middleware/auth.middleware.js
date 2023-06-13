// const jwt = require('jsonwebtoken');
// const UserModel = require('../models/user.model');

// module.exports.checkUser = (req, res, next) => {
//   const token = req.cookies.jwt;
//   if (token) {
//     jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
//       if (err) {
//         res.locals.user = null;
//         res.cookie('jwt', '', { maxAge: 1 });
//         next();
//       } else {
//         let user = await UserModel.findById(decodedToken.id);
//         res.locals.user = user;
//         console.log(res.locals.user);
//         next();
//       }
//     });
//   } else {
//     res.locals.user = null;
//     next();
//   }
// };

// module.exports.requireAuth = (req, res, next) => {
//   const token = req.cookies.jwt;
//   if (token) {
//     jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
//       if (err) {
//         console.log(err);
//         res.send(200).json('no token');
//       } else {
//         console.log(decodedToken.id);
//         next();
//       }
//     });
//   } else {
//     console.log('No token');
//     res.status(200).json('no token');
//   }
// };
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

module.exports.checkUser = async (req, res, next) => {
  const token = req.cookies.jwt;
  try {
    if (token) {
      const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
      const user = await UserModel.findById(decodedToken.id);
      res.locals.user = user;
    } else {
      res.locals.user = null;
    }
    next();
  } catch (err) {
    res.locals.user = null;
    next(err);
  }
};

module.exports.requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  try {
    if (token) {
      const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
      next();
    } else {
      res.status(401).json('No token');
    }
  } catch (err) {
    res.status(401).json('Invalid token');
  }
};
