module.exports.signUpErrors = (err) => {
  let errors = { pseudo: '', email: '', password: '' };

  if (err.message.includes('pseudo')) {
    errors.pseudo = 'Pseudo incorrect ou déjà pris';
  }
  if (err.message.includes('email')) {
    errors.email = 'Email incorrect';
  }
  if (err.message.includes('password')) {
    errors.password = 'Le mot de passe doit faire 6 caractères minimum';
  }
  if (err.code === 11000 && Object.keys(err.keyValue)[0].includes('pseudo')) {
    errors.email = 'Ce pseudo est déjà pris';
  }
  if (err.code === 11000 && Object.keys(err.keyValue)[0].includes('email')) {
    errors.email = 'Cet email est déjà enregistré';
  }
  return errors;
};

module.exports.signInErrors = (err) => {
  let errors = { email: '', password: '' };
  if (err.message.includes('email')) errors.email = 'Email inconnu';
  if (err.message.includes('password'))
    errors.password = 'Mot de passe incorrect';
  return errors;
};

// module.exports.uploadErrors = (file) => {
//   //   let errors = {};

//   //   if (err && err.message && err.message.includes('invalid file format'))
//   //     errors.format = 'Format incompatible';

//   //   if (err && err.message && err.message.includes('file size exceeded'))
//   //     errors.maxSize = 'Le fichier dépasse 500ko';

//   //   return errors;
//   // };
//   const errors = {};

//   if (!file) {
//     errors.format = 'Format incompatible';
//     errors.maxSize = 'Le fichier dépasse 500ko';
//   }

//   return errors;
// };
