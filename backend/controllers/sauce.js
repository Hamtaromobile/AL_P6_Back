//logique métier sauce

const Sauce = require("../models/sauce");
const fs = require("fs");
// fonction replace

//creation, route post
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce); // "form-data" parse en JSON
  delete sauceObject._id; //remove id de la req, remplacer par l'id de mongoDb
  delete sauceObject._userId; //remove _userId, protection contre mauvais id envoyé
  const newSauce = new Sauce({
    //créa new instance
    ...sauceObject, //copy champ de req.body
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: "",
    usersDisliked: "",
  });
  newSauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistré!" }))
    .catch((error) => res.status(400).json({ error }));
};

//recup. 1 sauce, route get
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

//recup. tous les sauces, route get
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  //modif. img
  let sauceObject = {};
  req.file
    ? // req.file existe ?
      //si oui
      (Sauce.findOne({
        _id: req.params.id,
      }).then((sauce) => {
        //supp. img
        fs.unlinkSync(`images/${sauce.imageUrl.split("/images/")[1]}`);
      }),
      (sauceObject = {
        //new  img
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }))
    : //si non
      (sauceObject = {
        ...req.body,
      });
  //maj sauce à modif., new sauce
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() =>
      res.status(200).json({
        message: "Objet modifié !",
      })
    )
    .catch((error) =>
      res.status(400).json({
        error,
      })
    );
};

//delete, route delete
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) //
    .then((sauce) => {
      //si user n'est pas le créateur
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Non authorisé" });
      } else {
        //delete img
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          //callback, delete sauce
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Sauce supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

//like, dislike route post
exports.likeDislike = (req, res, next) => {
  console.log("req.body.like:", req.body.like);
  //like
  if (req.body.like === 1) {
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $push: { usersLiked: req.body.userId },
        $inc: { likes: +1 },
      }
    )
      .then(() => res.status(200).json({ message: "like" }))
      .catch((error) => res.status(400).json({ error }));
  }
  //dislike
  if (req.body.like === -1) {
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $push: { usersDisliked: req.body.userId },
        $inc: { dislikes: +1 },
      }
    )
      .then(() => res.status(200).json({ message: "Dislike" }))
      .catch((error) => res.status(400).json({ error }));
  }
  //annuler like, dislike
  if (req.body.like === 0) {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        //annuler like
        if (sauce.usersLiked.includes(req.body.userId)) {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $pull: { usersLiked: req.body.userId },
              $inc: { likes: -1 },
            }
          )
            .then(() => res.status(200).json({ message: "remove Like" }))
            .catch((error) => res.status(400).json({ error }));
        }
        //annuler dislike
        if (sauce.usersDisliked.includes(req.body.userId)) {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $pull: { usersDisliked: req.body.userId },
              $inc: { dislikes: -1 },
            }
          )
            .then(() => res.status(200).json({ message: "remove Dislike" }))
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(404).json({ error }));
  }
};
