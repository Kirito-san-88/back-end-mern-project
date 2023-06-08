const PostModel = require('../models/post.model');
const postModel = require('../models/post.model');
const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;
const fs = require('fs');
// const { promisify } = require('util');
// const { uploadErrors } = require('../utils/errors.utils');
// const pipeline = promisify(require('stream').pipeline);
// const path = require('path');

module.exports.readPost = async (req, res) => {
  try {
    const docs = await PostModel.find().sort({ createdAt: -1 });
    res.send(docs);
  } catch (err) {
    console.log('Error to get data : ' + err);
    res.status(500).send('An error occurred while retrieving data.');
  }
};
module.exports.createPost = async (req, res) => {
  try {
    let fileName = '';

    if (req.file) {
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

      fileName = req.body.posterId + '_' + Date.now() + '.jpg';

      const uploadPath = `${__dirname}/../client/public/uploads/posts`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      await new Promise((resolve, reject) => {
        const fileStream = fs.createReadStream(req.file.path);
        const writeStream = fs.createWriteStream(`${uploadPath}/${fileName}`);

        fileStream.pipe(writeStream);

        writeStream.on('error', (err) => reject(err));
        writeStream.on('finish', () => resolve());
      });

      fs.unlinkSync(req.file.path);
    }

    const newPost = new postModel({
      posterId: req.body.posterId,
      message: req.body.message,
      picture: req.file ? './uploads/posts/' + fileName : '',
      video: req.body.video,
      likers: [],
      comments: [],
    });

    const post = await newPost.save();
    return res.status(201).json(post);
  } catch (err) {
    console.log('Error while creating post: ', err);
    return res.status(500).send('An error occurred while creating the post.');
  }
};

// module.exports.createPost = async (req, res) => {
//   let fileName;

//   if (req.file !== null) {
//     try {
//       console.log('MIME Type:', req.file.mimetype);
//       if (
//         req.file.mimetype !== 'image/jpg' &&
//         req.file.mimetype !== 'image/png' &&
//         req.file.mimetype !== 'image/jpeg'
//       ) {
//         const errors = { format: 'Format incompatible' };
//         return res.status(400).json({ errors });
//       }

//       if (req.file.size > 500000) {
//         const errors = { maxSize: 'Le fichier dépasse 500ko' };
//         return res.status(400).json({ errors });
//       }

//       fileName = req.user._id + '_' + Date.now() + '.jpg';
//       console.log(req.user._id);
//       const uploadPath = `${__dirname}/../client/public/uploads/posts`;

//       if (!fs.existsSync(uploadPath)) {
//         fs.mkdirSync(uploadPath, { recursive: true });
//       }

//       await pipeline(
//         req.file.stream,
//         fs.createWriteStream(`${uploadPath}/${fileName}`)
//       );

//       // Supprime le fichier temporaire créé pour l'ID de l'utilisateur
//       if (req.file.fieldname === 'posterId') {
//         fs.unlinkSync(req.file.path);
//       }
//     } catch (err) {
//       const errors = uploadErrors(err);
//       return res.status(400).json({ errors });
//     }
//   }
//   // si je met :
//   // posterId: req.body.posterId,
//   // et plus haut dans le fileName a la ligne 40 : req.body.posterId + '_' + Date.now() + '.jpg';
//   // il m'upload 2 fichiers : 1 c'est l'image ( donc aucun problème) mais le second c'est un fichier qui correspond a l'id du posterId
//   // hors si je met tel que c'est actuellement il m'upload l'image mais me sort cette erreur en json dans postman :
//   // {
//   //   "errors": {
//   //     "format": "",
//   //     "maxSize": ""
//   // }

//   const newPost = new postModel({
//     posterId: req.user._id,
//     message: req.body.message,
//     picture: req.file !== null ? '/uploads/posts/' + fileName : '',
//     video: req.body.video,
//     likers: [],
//     comments: [],
//   });

//   try {
//     const post = await newPost.save();
//     return res.status(201).json(post);
//   } catch (err) {
//     return res.status(400).send(err);
//   }
// };
module.exports.updatePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID unknown : ' + req.params.id);
  const updatedRecord = {
    message: req.body.message,
  };
  try {
    await PostModel.findByIdAndUpdate(
      req.params.id,
      { $set: updatedRecord },
      { new: true }
    );
    res.status(200).json({ message: 'Successfully updated.' });
  } catch (err) {
    console.log('Update error : ', err.message);
    res.status(500).send('An error occurred while updating');
  }
};

module.exports.deletePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID unknown : ' + req.params.id);
  try {
    await PostModel.findByIdAndRemove(req.params.id);

    res.status(200).json({ message: 'Successfully deleted.' });
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'An error occurred while deleting.' });
  }
};

module.exports.likePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID unknown : ' + req.params.id);
  try {
    await PostModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likers: req.body.id } },
      { new: true }
    );
    await UserModel.findByIdAndUpdate(
      req.body.id,
      { $addToSet: { likes: req.params.id } },
      { new: true }
    );
    res.status(200).json({ message: 'Successfully liked.' });
  } catch (err) {
    return res.status(500).json({ message: 'An error occurred while liking.' });
  }
};
module.exports.unlikePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID unknown : ' + req.params.id);

  try {
    await PostModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { likers: req.body.id } },
      { new: true }
    );
    await UserModel.findByIdAndUpdate(
      req.body.id,
      { $pull: { likes: req.params.id } },
      { new: true }
    );

    res.status(200).json({ message: 'Successfully unliked.' });
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'An error occurred while unliking.' });
  }
};

module.exports.commentPost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID unknown : ' + req.params.id);
  try {
    const docs = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            commenterId: req.body.commenterId,
            commenterPseudo: req.body.commenterPseudo,
            text: req.body.text,
            timestamp: new Date().getTime(),
          },
        },
      },
      { new: true }
    );
    res.status(200).json(docs);
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'An error occurred while posting comments.' });
  }
};
module.exports.editCommentPost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID unknown : ' + req.params.id);
  try {
    const docs = await PostModel.findById(req.params.id);
    const theComment = docs.comments.find((comment) =>
      comment._id.equals(req.body.commentId)
    );
    if (!theComment) return res.status(404).send('Comment not found');
    theComment.text = req.body.text;
    await docs.save();
    res.status(200).send(docs);
  } catch (err) {
    return res.status(400).send('An error occurred while editing the comment');
  }
};
module.exports.deleteCommentPost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID unknown : ' + req.params.id);

  try {
    await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          comments: {
            _id: req.body.commentId,
          },
        },
      },
      { new: true }
    );
    res.status(200).json({ message: 'Successfully deleted the comment.' });
  } catch (err) {
    return res.status(400).send('An error occurred while deleting the comment');
  }
};
