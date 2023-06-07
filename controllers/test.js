const UserModel = require('../models/user.model');
const fs = require('fs');
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline);
const { uploadErrors } = require('../utils/errors.utils');

module.exports.uploadProfil = async (req, res) => {
  let fileName;
  try {
    if (
      req.file.mimetype !== 'image/jpg' &&
      req.file.mimetype !== 'image/png' &&
      req.file.mimetype !== 'image/jpeg'
    ) {
      throw new Error('Invalid file');
    }

    if (req.file.size > 500000) {
      throw new Error('File size exceeds limit');
    }

    const fileName = req.file.originalname;
    const filePath = `${__dirname}/../client/public/uploads/profil/${fileName}`;

    await fs.promises.writeFile(filePath, req.file.buffer);

    try {
      const docs = await UserModel.findByIdAndUpdate(
        req.body.userId,
        { $set: { picture: './uploads/profil/' + fileName } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
        (err, docs) => {
          if (!err)
            res.status(200).json({ message: 'Image uploaded successfully' });
          else return res.status(500).send({ message: 'Image not uploaded' });
        }
      );
      res.send(docs);
    } catch (err) {
      return res.status(500).send({ message: err });
    }
  } catch (err) {
    const errors = uploadErrors(err);
    return res.status(201).json({ errors });
  }

  await pipeline(
    req.file.buffer,
    fs.createWriteStream(
      `${__dirname}/../client/public/uploads/profil/${fileName}`
    )
  ).on('error', (err) => {
    console.error('Error writing file:', err);
    // Gérer l'erreur comme vous le souhaitez, par exemple, renvoyer une réponse d'erreur appropriée.
    return res.status(500).send({ message: 'Error writing file' });
  });
};
