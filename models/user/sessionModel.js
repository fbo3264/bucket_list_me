// grab the things we need
const mongoose = require(global.appdir + "/db.js");
const Schema = mongoose.Schema;
const moment = require('moment');

// create a schema
const sessionSchema = new Schema({

    sessionId: {
        type: String,
        required: true
    },
    validTo: {
        type: Date
    },
    createdAt: {
        type: Date

    },
    userId: String
});


// on every save, add the dates
sessionSchema.pre('save', function(next) {
    // get the current date
    const now = moment();

    // if created_at doesn't exist, add to that field
    if (!this.createdAt) {
        this.createdAt = now.toDate();
    }
    if (!this.validTo) {
        this.validTo = now.add(7, 'days').toDate();
    }
    next();

});
// we need to create a model using the schema
let Session = mongoose.model('Session', sessionSchema);

// make this available Node applications
module.exports = Session;
