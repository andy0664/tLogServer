/**
 * Created by salho on 13.10.16.
 */
import POI from '../models/poi.model';
import Trip from '../models/trip.model';
import mongoose from "mongoose";
import grid from "gridfs-stream";
import gm from "gm";
import fs from "fs";
grid.mongo = mongoose.mongo;


export const create = (req, res, next) => {
  const poi = new POI(req.body);
  poi.creator = req.user.id;
  poi.sumCoordinates = req.body.loc.coordinates[0] + req.body.loc.coordinates[1];
  if (req.trip._id) {
    poi.trip = req.trip._id;
    poi.share= req.trip.share;
  }
  poi.save()
    .then(poi => POI.load(poi._id))
    .then(poi => {
      req.poi = poi;
      next()
    })
    .catch(err => res.status(400).json({message: err.message}));
};

export const all = (req, res, next) => {
  try {
    let page = parseInt(req.query.page || '0');
    let size = parseInt(req.query.size || '10');
    POI.find()
      .sort('-createdAt')
      .skip(page * size)
      .limit(size)
      .populate('creator', 'local.username')
      .then((data) => res.json(data))
      .catch(err => res.status(500).json({message: err.message}))
  } catch (err) {
    res.status(500).json({message: err.message})
  }
};

export const load = (req, res, next, id) => {
  try {
    POI.load(id)
      .then(poi => {
        req.poi = poi;
        next()
      })
      .catch(err => res.status(400).json({message: "This POI could not be found"}));
  } catch (err) {
    res.status(500).json({message: err.message})
  }
};

export const show = (req, res) => res.json(req.poi);

export const update = (req, res, next) => {
  try {
    const poi = Object.assign(req.poi, req.body);
    poi.save()
      .then(poi => POI.load(poi._id))
      .then(poi => {
        req.poi = poi;
        next()
      })
      .catch(err => res.status(400).json({message: "This POI could not be updated: " + err.message}));
  } catch (err) {
    res.status(500).json({message: err.message})
  }
};

export const findByRange = (req, res,next) => {
  try {
    let longitude1 = parseFloat(req.query.longitude1);
    let latitude1 = parseFloat(req.query.latitude1);
    let longitude2 = parseFloat(req.query.longitude2);
    let latitude2 = parseFloat(req.query.latitude2);
    console.log("LatLng: "+longitude1+" "+latitude1+" "+longitude2+" "+latitude2);
    POI.aggregate([{$match:{share:true,loc: {$geoWithin:{$box:[[longitude1,latitude1],[longitude2,latitude2]]}}}},{$group:{_id:"$trip"}}])
      .then((data)=> {console.log("Data found: "+JSON.stringify(data));req.trips=data;next();})
      .catch(err => res.status(400).json({message: "Could not find Pois by Range: " + err.message}));
  } catch (err) {
    res.status(500).json({message: err.message})
  }
}

export const destroy = (req, res, next) => {
  try {
    console.log("Poi delete: "+JSON.stringify(req.poi));
    Trip.update({_id:req.poi.trip._id},{$pull:{pois:req.poi._id,summCoords:req.poi.sumCoordinates}})
      .then(req.poi.remove()
        .then(() => next()))
      .catch(err => res.status(500).json({message: "Could not delete this POI"}))
  } catch (err) {
    res.status(500).json({message: err.message})
  }
};

export const image = (req, res) => {
  try {
    const gfs = grid(mongoose.connection.db);
    console.log("id=" + req.params.imageId);
    let ObjectID = mongoose.mongo.ObjectID;
    gfs.createReadStream({_id: new ObjectID(req.params.imageId)}).pipe(res);
  } catch (err) {
    res.status(500).json({message: err.message})
  }
};

export const addImage = function (req, res) {
  try {
    const gfs = grid(mongoose.connection.db);
    const maxDimension = process.env.MAX_IMAGE_DIMENSION || 500;
    if (req.files.file == null) {
      res.status(400).json({
        message: "There needs to be an element called 'file' that contains the image"
      });
      return;
    }
    const file = req.files.file;
    const wStream = gfs.createWriteStream({
      mode: 'w',
      filename: file.name,
      content_type: file.type,
      metadata: {
        poi: req.poi._id,
        creator: req.user.id
      }
    });
    const s = gm(file.path).resize(maxDimension).stream().pipe(wStream);
    s.on('close', file => {
      const poi = req.poi;
      poi.images.push({
        description: req.body.description,
        id: file._id,
        uploaded: Date.now(),
        user: req.user.username
      });
      poi.save()
        .then(poi => res.json(file))
        .catch(err => res.status(500).send({
          message: "Could not add image to POI " + err.message
        }));
    });
    s.on('error', error => {
      res.status(500).send({
        message: "Could not save image"
      });
    });
  } catch (error) {
    console.log(error.stack);
    res.status(500).send({
      message: "Could not save image " + error.message
    });
  }
};



