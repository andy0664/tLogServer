/**
 * Created by Andreas on 22/01/2017.
 */

import User from '../models/user.model';


export const search=(req,res,next)=>{
  try{
    User.find({'local.username':new RegExp(req.params.searchValue,'i')}).select('_id local.username')
      .then(users => res.json(users))
      .catch(err => res.status(400).json({message:err.message}))
  }catch (err){
    res.status(500).json({message: err.message})
  }
};

export const load = (req,res,next,id) =>{
  try {
    User.load(id)
      .then((user)=>{req.user = user; next()})
      .catch(err => res.status(400).json({message: `Could not load this User: ${err.message}`}))
  } catch(err) {res.status(500).json({message: err.message})}
};

export const show = (req, res) => res.json(req.user);
