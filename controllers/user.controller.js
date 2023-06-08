const UserModel = require('../models/user.model');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find().select('-password');
  res.status(200).json(users);
};

module.exports.userInfo = (req, res) => {
  console.log(req.params);
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).json({ message: 'ID unknown : ' + req.params.id });

  UserModel.findById(req.params.id)
    .select('-password')
    .then((docs) => {
      res.send(docs);
    })
    .catch((err) => {
      console.log('ID unknown : ' + err);
    });
};
module.exports.updateUser = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).json({ message: 'ID unknown : ' + req.params.id });

  try {
    const docs = await UserModel.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { bio: req.body.bio } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(docs);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports.deleteUser = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).json({ message: 'ID unknown : ' + req.params.id });
  try {
    await UserModel.deleteOne({ _id: req.params.id }).exec();
    res.status(200).json({ message: 'Successfully deleted.' });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports.follow = async (req, res) => {
  if (
    !ObjectId.isValid(req.params.id) ||
    !ObjectId.isValid(req.body.idToFollow)
  )
    return res.status(400).json({ message: 'ID unknown : ' + req.params.id });
  try {
    // add to the follower list
    const docs = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { following: req.body.idToFollow } },
      { new: true, upsert: true }
    );
    res.json(docs);
    await UserModel.findByIdAndUpdate(req.body.idToFollow, {
      $addToSet: { followers: req.params.id },
    });
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

module.exports.unfollow = async (req, res) => {
  if (
    !ObjectId.isValid(req.params.id) ||
    !ObjectId.isValid(req.body.idToUnFollow)
  )
    return res.status(400).json({ message: 'ID unknown : ' + req.params.id });
  try {
    const docs = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { following: req.body.idToUnFollow } },
      { new: true, upsert: true }
    );
    res.json(docs);
    await UserModel.findByIdAndUpdate(req.body.idToUnFollow, {
      $pull: { followers: req.params.id },
    });
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};
