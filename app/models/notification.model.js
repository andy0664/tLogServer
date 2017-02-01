/**
 * Created by Andreas on 01/02/2017.
 */


import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

const notificationSchema = Schema({

  userTo: {
    type: Schema.ObjectId,
    required: true,
    ref: 'User'
  },
  userFrom: {
    type: Schema.ObjectId,
    required: true,
    ref: 'User'
  },
  displayed:{
    type: Boolean,
    "default": false
  },
  trip: {
    type: Schema.ObjectId,
    required: true,
    ref: 'Trip'
  },
  createdAt: {
    type: Date,
    "default": Date.now
  }
});

notificationSchema.index({
  loc: '2dsphere'
});


notificationSchema.path('userTo').validate(function(userTo) {
  return userTo != null;
}, 'toUser cannot be blank');

notificationSchema.path('userFrom').validate(function(userFrom) {
  return userFrom != null;
}, 'userFrom cannot be blank');

notificationSchema.path('userFrom').validate(function(trip) {
  return trip != null;
}, 'trip cannot be blank');

notificationSchema.statics.load = function(id) {
  return this.findOne({
    _id: id
  }).populate('userFrom','local.username').populate('userTo','local.username').populate('trip','name');
};

export default mongoose.model('Notification',notificationSchema);
