/**
 * Created by Andreas on 22/01/2017.
 */

import User from '../models/user.model';
import Trip from '../models/trip.model';
import FriendRequest from '../models/friendRequest.model';
import mongoose from "mongoose";


export const search = (req, res, next) => {
  try {
    User.find({'local.username': new RegExp(req.params.searchValue, 'i')}).select('_id local.username')
      .then(users => res.json(users))
      .catch(err => res.status(400).json({message: err.message}))
  } catch (err) {
    res.status(500).json({message: err.message})
  }
};

export const load = (req, res, next, id) => {
  try {
    User.load(id)
      .then((user) => {
        req.specUser = user;
        next()
      })
      .catch(err => res.status(400).json({message: `Could not load this User: ${err.message}`}))
  } catch (err) {
    res.status(500).json({message: err.message})
  }
};

export const getUser = (req, res, next) => {
  try {
    console.log("UserGet: " + JSON.stringify(req.specUser));
    let newUser = {
      '_id': req.specUser._id,
      'friends': req.specUser.friends,
      'username': req.specUser.local.username
    }
    req.specUser = newUser;
    Trip.find({'creator': req.specUser._id, 'share': true}).select('_id name')
      .then(trips => {
        req.specUser.trips = trips;
        next();
      })
      .catch(err => res.status(400).json({message: err.message}))
  } catch (err) {
    res.status(500).json({message: err.message})
  }
}

export const friendRequest = (req, res) => {
  try {
    let friendRequest = new FriendRequest(req.body);
    friendRequest.save()
      .then(fRequest => res.json("request saved"))
      .catch(err => res.status(400).json({message: err.message}))
  } catch (err) {
    res.status(500).json({message: err.message})
  }
}

export const checkFriend = (req,res)=>{
  try {
    FriendRequest.count({userFrom:req.user.id,userTo:req.specUser._id})
      .then(countReq => {User.count({_id:req.user.id,friends:req.specUser._id})
        .then(countFriends => res.json(countReq+countFriends))})
      .catch(err => res.status(400).json({message: err.message}))
  } catch (err) {
    res.status(500).json({message: err.message})
  }
}

//remove friend on other side
export const removeFriend = (req,res,next)=>{
  try{
    User.update({_id:req.user.id},{$pull:{friends:req.specUser._id}})
      .then(() => FriendRequest.remove({userFrom:req.user.id,userTo:req.specUser._id})
        .then(()=>next()))
      .catch(err => res.status(400).json({message: err.message}))
  }catch (err) {
    res.status(500).json({message: err.message})
  }
}

export const openFriendRequest = (req,res)=>{
  try{
    console.log("Hallo: ");
    FriendRequest.find({userTo:req.user.id})
      .then((data) => res.json(data))
      .catch(err => {console.log("UserError: ");res.status(400).json({message: err.message})})
  }catch (err) {
    res.status(500).json({message: err.message})
  }
}


export const show = (req, res) => res.json(req.specUser);
