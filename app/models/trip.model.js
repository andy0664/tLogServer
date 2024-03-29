/**
 * Created by salho on 17.10.16.
 */
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

const TripSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  begin: Date,
  end: Date,
  share:{
    type: Boolean,
    "default": false
  },
  createdAt: {
    type: Date,
    "default": Date.now
  },
  creator: {
    type: Schema.ObjectId,
    required: true,
    ref: 'User'
  },
  sumCoords: [{
    type:Number
  }],
  pois: [
    {
      type: Schema.Types.ObjectId,
      ref: 'POI'
    }
  ],
  likes:[
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  likeCount:
    {type:Number,
      "default": 0
    }
});


/**
 * Validations
 */

TripSchema.path('name').validate(function(name) {
  return name != null;
}, 'Name cannot be blank');

TripSchema.path('creator').validate(function(creator) {
  return creator != null;
}, 'Creator must be specified');

TripSchema.statics.load = function(id) {
  return this.findById(id).populate('creator', 'local.username').populate('pois').populate('likes','local.username');
};

export default mongoose.model('Trip',TripSchema);
