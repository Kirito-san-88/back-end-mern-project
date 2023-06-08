const UserModel = require('../models/user.model');
const fs = require('fs');
const { promisify } = require('util');
const { uploadErrors } = require('../utils/errors.utils');

module.exports.uploadProfil = async (req, res) => {
  let fileName;
  try {
    if (
      req.file.mimetype !== 'image/jpg' &&
      req.file.mimetype !== 'image/png' &&
      req.file.mimetype !== 'image/jpeg'
    ) {
      const errors = { format: 'Format incompatible' };
      return res.status(400).json({ errors });
    }

    if (req.file.size > 500000) {
      const errors = { maxSize: 'Le fichier dépasse 500ko' };
      return res.status(400).json({ errors });
    }

    if (req.body.name) {
      fileName = req.body.name + '.jpg';
      console.log(fileName);
    } else {
      fileName = req.file.originalname;
      console.log(fileName);
    }

    const filePath = `${__dirname}/../client/public/uploads/profil/${fileName}`;

    await fs.promises.writeFile(filePath, req.file.buffer);

    try {
      const docs = await UserModel.findByIdAndUpdate(
        req.body.userId,
        { $set: { picture: './uploads/profil/' + fileName } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      res.status(200).json({ message: 'Image uploaded successfully', docs });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  } catch (err) {
    const errors = uploadErrors(err);
    return res.status(201).json({ errors });
  }
};
