// init database
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird')
mongoose.connect('mongodb://admin:test@ds013664.mlab.com:13664/diewdb')

module.exports = mongoose
