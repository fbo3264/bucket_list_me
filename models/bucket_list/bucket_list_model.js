// grab the things we need
const mongoose = require(global.appdir + "/db.js");
const Schema = mongoose.Schema;
const Promise = require('bluebird');


// create a schema
const bucketListSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    state: Number,
    createdAt: {
        type: Date,
        required: true
    },
    updatedAt: Date,
    entries: [{
        content: String,
        active: Boolean
    }],
    userId: {
        type: String,
        required: true
    }
});


// on every save, add the date
bucketListSchema.pre('save', function(next) {
    console.log("in save middleware of bucket list");
    console.log(this);
    // get the current date
    let currentDate = new Date();

    this.state = this.state || 0;

    // change the updated_at field to current date
    this.updated_at = currentDate;

    // if created_at doesn't exist, add to that field
    if (!this.created_at) {
        this.created_at = currentDate;
    }
    next();
});


// we need to create a model using the schema
let BucketList = mongoose.model('BucketList', bucketListSchema);

// make this available to our users in our Node applications
module.exports = BucketList;
