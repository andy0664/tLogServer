// ```
// user.model.js
// (c) 2016 David Newman
// david.r.niciforovic@gmail.com
// user.model.js may be freely distributed under the MIT license
// ```

// */app/models/user.model.js*

// ## User Model

// Note: MongoDB will autogenerate an _id for each User object created

// Grab the Mongoose module
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

// Import library to hash passwords
import bcrypt from 'bcrypt-nodejs';

// Define the schema for the showcase item
let userSchema = mongoose.Schema({

  local : {

    username : { type : String, unique : true },

    password : String,

    email : { type : String, unique : true }
  },

  roles : { type : [String] },

  tripNotifications:{
    type:Boolean,
    "default": true
  },

  friends : [{
    type:Schema.Types.ObjectId,
    ref:'User'
  }],
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

// ## Methods

// ### Generate a hash
userSchema.methods.generateHash = function(password) {

  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// ### Check if password is valid
userSchema.methods.validPassword = function(password) {

  return bcrypt.compareSync(password, this.local.password);
};

userSchema.statics.load = function(id) {
  return this.findById(id).populate('friends','local.username');
};

// Create the model for users and expose it to the app
export default mongoose.model('User', userSchema);
