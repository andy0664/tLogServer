
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

const friendRequestSchema = Schema({
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
  createdAt: {
    type: Date,
    "default": Date.now
  }
});

friendRequestSchema.index({
  loc: '2dsphere'
});


friendRequestSchema.path('userTo').validate(function(userTo) {
  return userTo != null;
}, 'toUser cannot be blank');

friendRequestSchema.path('userFrom').validate(function(userFrom) {
  return userFrom != null;
}, 'userFrom cannot be blank');

friendRequestSchema.statics.load = function(id) {
  return this.findOne({
    _id: id
  }).populate('userFrom','local.username').populate('userTo','local.username');
};

export default mongoose.model('FriendRequest',friendRequestSchema);
