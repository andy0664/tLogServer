import User from '../models/user.model';
import Trip from '../models/trip.model';
import FriendRequest from '../models/friendRequest.model';
import Notification from '../models/notification.model';


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

export const update = (req, res, next) => {
  try {
    const user = Object.assign(req.specUser, req.body);
    console.log("SpecUser: "+JSON.stringify(user));
    console.log("Body: "+JSON.stringify(user));
    console.log("User: "+JSON.stringify(user));
    user.save()
      .then(user => User.load(user._id))
      .then(user => {
        req.specUser = user;
        next();
      })
      .catch(err => res.status(400).json({message: "This User could not be updated: " + err.message}));
  } catch (err) {
    res.status(500).json({message: err.message})
  }
};

export const getOtherUser = (req, res, next) => {
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
        .then(()=>User.update({_id:req.specUser._id},{$pull:{friends:req.user.id}}))
        .then(()=>next()))
      .catch(err => res.status(400).json({message: err.message}))
  }catch (err) {
    res.status(500).json({message: err.message})
  }
}

export const openFriendRequest = (req,res)=>{
  try{
    FriendRequest.find({userTo:req.user.id}).populate('userFrom','local.username')
      .then((data) => res.json(data))
      .catch(err => {console.log("UserError: ");res.status(400).json({message: err.message})})
  }catch (err) {
    res.status(500).json({message: err.message})
  }
}

export const acceptFriendRequest = (req,res)=>{
  try{
    User.update({_id:req.user.id},{$push:{friends:req.specUser._id}})
      .then(()=>User.update({_id:req.specUser._id},{$push:{friends:req.user.id}})
      .then(()=>FriendRequest.remove({userFrom:req.specUser._id,userTo:req.user.id})
        .then(()=>res.json({message: "friend added"}))))
      .catch(err => {console.log("UserError: ");res.status(400).json({message: err.message})})
  }catch (err) {
    res.status(500).json({message: err.message})
  }
}

export const rejectFriendRequest = (req,res)=>{
  try{
    FriendRequest.remove({userFrom:req.specUser._id,userTo:req.user.id})
      .then(()=>res.json({message: "request rejected"}))
      .catch(err => {console.log("UserError: ");res.status(400).json({message: err.message})})
  }catch (err) {
    res.status(500).json({message: err.message})
  }
}

export const getUserFriends = (req,res)=>{
  try{
    res.json(req.specUser.friends)
  }catch (err) {
    res.status(500).json({message: err.message})
  }
}

export const checkNotification = (req,res)=>{
  try{
    console.log("checkNotification");
    Notification.find({userTo:req.user.id, displayed:false}).sort('-createdAt')
      .populate('userFrom','local.username').populate('userTo','local.username').populate('trip','name')
      .then(data => res.json(data))
      .catch(err => res.status(400).json({message: err.message}))
  }catch(err) {
    res.status(500).json({message: err.message})
  }
}

export const updateReadNotification = (req,res)=> {
  try{
    Notification.findByIdAndUpdate(req.params.notificationID,{$set:{displayed:true}})
      .then(data => res.json({message:'displayed success'}))
      .catch(err => res.status(400).json({message: err.message}))
  }catch (err) {
    res.status(500).json({message: err.message})
  }
}

export const show = (req, res) => res.json(req.specUser);
