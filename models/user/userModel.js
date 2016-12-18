// grab the things we need
const mongoose = require(global.appdir + "/db.js");
const Schema = mongoose.Schema;
const Promise = require('bluebird');
const moment = require('moment');
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs')),
    SALT_WORK_FACTOR = 10;

// create a schema
const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    state: Number,
    last_login: Date,
    createdAt: Date
});


userSchema.pre('save', function(next) {

    var user = this;
    if(!user.createdAt){
      user.createdAt = moment().toDate();
    }

    if(!user.state) {
      user.state = 0; // not activated
    }

    // only hash the password if it has been modified (or is new)
    if (user.state === 0 || user.isModified('password')) {

        // generate a salt
        bcrypt.genSaltAsync(SALT_WORK_FACTOR)
            .then(salt => {
                // hash the password using our new salt
                return bcrypt.hashAsync(user.password, salt, null);
            })
            .then(hash => {
                // override the cleartext password with the hashed one
                user.password = hash;
                console.log("PW hashed: ",hash)
                next();
            });
    }
    
});


userSchema.methods.comparePassword = function(candidatePassword) {
    let user = this;
    return Promise.try(function() {
        console.log("---in schema compare password:", candidatePassword, user.password);
        return bcrypt.compareAsync(candidatePassword, user.password);
    });
    // .then(isMatch => {
    //   console.log("---in schema compare password: matching?",isMatch);
    //   return isMatch;
    // });
};

// we need to create a model using the schema
let User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
