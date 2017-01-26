/**
 * Created by Andreas on 26/01/2017.
 */

import Comment from '../models/comment.model';

export const allTripComments = (req,res)=>{
  try{
    Comment.find({trip:req.params.tripID})
      .sort('-createdAt').populate('creator','local.username')
      .then(comments=>res.json(comments))
      .catch(err => res.json(500,{message:err.message}))
  }catch(err) {res.status(500).json({message: err.message})}
};

export const createComment = (req,res,next)=>{
  try{
    let comment = new Comment(req.body);
    comment.creator = req.user.id;
    comment.save()
      .then(comment => Comment.load(comment._id))
      .then((comment)=>{req.comment = comment; next()})
      .catch(err => res.status(400).json({message: `Could not create this comment: ${err.message}`}))
  }catch(err) {res.status(500).json({message: err.message})}
};

export const show = (req,res) => {
  try {
    res.json(req.comment);
  } catch(err) {res.status(500).json({message: `Could not send this Comment: ${err.message}`})}
};

