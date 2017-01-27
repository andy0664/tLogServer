import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

const commentSchema = Schema({
  creator: {
    type: Schema.ObjectId,
    required: true,
    ref: 'User'
  },
  trip: {
    type: Schema.ObjectId,
    required: true,
    ref: 'Trip'
  },
  comment:{
    type:String,
    required:true
  },
  createdAt: {
    type: Date,
    "default": Date.now
  }
});

commentSchema.index({
  loc: '2dsphere'
});


commentSchema.path('creator').validate(function(creator) {
  return creator != null;
}, 'creator cannot be blank');

commentSchema.path('trip').validate(function(trip) {
  return trip != null;
}, 'trip cannot be blank');

commentSchema.path('comment').validate(function(comment) {
  return comment != null;
}, 'comment cannot be blank');

commentSchema.statics.load = function(id) {
  return this.findOne({
    _id: id
  }).populate('creator','local.username').populate('trip','name');
};

export default mongoose.model('Comment',commentSchema);
