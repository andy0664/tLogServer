/**
 * Created by salho on 17.10.16.
 */

import Trip from '../models/trip.model';

export const show = (req,res) => {
  try {
    res.json(req.trip);
  } catch(err) {res.status(500).json({message: `Could not send this Trip: ${err.message}`})}
};

export const create = (req,res,next) => {
  try {
    let trip = new Trip(req.body);
    trip.creator = req.user.id;
    trip.save()
      .then(trip => Trip.load(trip._id))
      .then((trip)=>{req.trip = trip; next()})
      .catch(err => res.status(400).json({message: `Could not create this Trip: ${err.message}`}))
  } catch(err) {res.status(500).json({message: `Could not create this Trip: ${err.message}`})}
};

export const list = (req,res,next) => {
  try {
    let page = parseInt(req.query.page || '0');
    let size = parseInt(req.query.size || '10');
    Trip.find()
      .sort('-createdAt')
      .skip(page * size)
      .limit(size)
      .populate('creator', 'local.username')
      .then((data) => res.json(data))
      .catch(err => res.json(500,{message:err.message}))
  } catch(err) {res.status(500).json({message: `Could not list Trips: ${err.message}`})}
};

export const load = (req,res,next,id) =>{
  try {
     Trip.load(id)
      .then((trip)=>{req.trip = trip; next()})
      .catch(err => res.status(400).json({message: `Could not load this Trip: ${err.message}`}))
  } catch(err) {res.status(500).json({message: err.message})}
};

export const mine = (req,res,next) =>{
  try {
    Trip.find({creator: req.user.id}).sort("-createdAt").populate('creator', 'local.username')
      .then(trips => res.json(trips))
      .catch(err => res.status(400).json({message: err.message}))
  } catch(err) {res.status(500).json({message: err.message})}
};

export const addPOI = (req,res,next) =>{
  try {
    req.trip.pois.push(req.poi);
    req.trip.sumCoords.push(req.poi.sumCoordinates);
    req.trip.save()
      .then(trip => Trip.load(trip._id))
      .then(trip => {req.trip=trip; next()})
      .catch(err => res.status(400).json({message: err.message}))
  } catch(err) {res.status(500).json({message: err.message})}
};

export const remove = (req,res,next) =>{
  try {
    Promise.all(req.trip.pois.map(poi=>poi.remove()))
      .then(req.trip.remove())
      .then(trip => res.status(200).json({message: `Trip was successfully deleted!`}))
      .catch(err => res.status(400).json({message: err.message}))
  } catch(err) {res.status(500).json({message: err.message})}
};

export const count = (req,res,next) =>{
  try {
    Trip.count({})
      .then(count => res.json(count))
      .catch(err => res.status(400).json({message: err.message}))
  } catch(err) {res.status(500).json({message: err.message})}
};

export const findByLocation = (req,res)=>{
  try{
    let startPoint = parseFloat(req.query.startPoint);
    let endPoint = parseFloat(req.query.endPoint);
    Trip.find({$and:[{sumCoords:{$gte:startPoint}},{sumCoords:{$lte:endPoint}},{share:true}]}).select('_id name')
      .then(data=>res.json(data))
      .catch(err => res.status(400).json({message:err.message}))
  }catch (err){
    res.status(500).json({message: err.message})
  }
}

export const update = (req,res,next) => {
  try {
  if (req.body._id && req.trip._id.toString() !== req.body._id) {
    res.status(400).json({message: 'Wrong trip id'});
  } else {
    const trip = Object.assign(req.trip,req.body);
    trip.save()
      .then(trip => Trip.load(trip._id))
      .then(trips => {req.trip = trip;next();})
      .catch(err => res.status(400).json({message: err.message}))
  }
  } catch(err) {res.status(500).json({message: err.message})}
};

export const search=(req,res,next)=>{
  try{
    Trip.find({'name':new RegExp(req.params.searchValue,'i'),share:true}).select('_id name')
      .then(trips => res.json(trips))
      .catch(err => res.status(400).json({message:err.message}))
  }catch (err){
    res.status(500).json({message: err.message})
  }
};

export const likeTrip=(req,res)=>{
  try{
    Trip.update({_id:req.params.tripID},{$push:{likes:req.user.id},$inc:{likeCount:1}})
      .then(()=>res.json("liked trip"))
      .catch(err => res.status(400).json({message:err.message}))
  }catch (err){
    res.status(500).json({message: err.message})
  }
};

export const unlikeTrip=(req,res)=>{
  try{
    Trip.update({_id:req.params.tripID},{$pull:{likes:req.user.id},$inc:{likeCount:-1}})
      .then(()=>res.json("unliked trip"))
      .catch(err => res.status(400).json({message:err.message}))
  }catch (err){
    res.status(500).json({message: err.message})
  }
};

export const checkLike = (req,res)=>{
  try{
    Trip.count({_id:req.params.tripID,likes:req.user.id})
      .then(count=>res.json(count))
      .catch(err => res.status(400).json({message:err.message}))
  }catch (err){
    res.status(500).json({message: err.message})
  }
};

export const topTenTrips = (req,res)=>{
  try{
    let startPoint = parseFloat(req.query.startPoint || '0.0');
    let endPoint = parseFloat(req.query.endPoint || '0.0');
    let dateFilter = req.query.dateFilter;

    if(startPoint===0.0 && endPoint===0.0)
      Trip.find({share:true, createdAt:{$gte:dateFilter}}).sort({likeCount:-1}).limit(10).select('_id name')
        .then(data=>res.json(data))
        .catch(err => res.status(400).json({message:err.message}));
    else
      Trip.find({$and:[{sumCoords:{$gte:startPoint}},{sumCoords:{$lte:endPoint}},{share:true},{createdAt:{$gte:dateFilter}}]})
        .sort({likeCount:-1}).limit(10).select('_id name')
        .then(data=>res.json(data))
        .catch(err => res.status(400).json({message:err.message}));
  }catch (err){
    res.status(500).json({message: err.message})
  }
}
