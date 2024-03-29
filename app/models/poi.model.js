/**
 * Created by salho on 13.10.16.
 */
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

const poiSchema = Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  loc: {
    type: {
      type: String,
      "default": "Point"
    },
    coordinates: {
      type: [Number]
    }
  },
  type:{
    type:String,
    'default': 'Point'
  },
  sumCoordinates:{
    type:Number
  },
  creator: {
    type: Schema.ObjectId,
    required: true,
    ref: 'User'
  },
  trip:{
    type: Schema.ObjectId,
    required: true,
    ref: 'Trip'
  },
  share:{
    type: Boolean,
    "default": false
  },
  createdAt: {
    type: Date,
    "default": Date.now
  },
  images: [
    {
      id: Schema.Types.ObjectId,
      description: String,
      uploaded: {
        type: Date,
        "default": Date.now
      },
      user: String
    }
  ]
});

poiSchema.index({
  loc: '2dsphere'
});

poiSchema.path('name').validate(function(name) {
  return name != null;
}, 'Name cannot be blank');

poiSchema.path('creator').validate(function(creator) {
  return creator != null;
}, 'Creator must be specified');

poiSchema.path('trip').validate(function(trip) {
  return trip != null;
}, 'Trip must be specified');

poiSchema.statics.load = function(id) {
  return this.findOne({
    _id: id
  }).populate('creator','local.username').populate('trip','name');
};

export default mongoose.model('POI',poiSchema);
