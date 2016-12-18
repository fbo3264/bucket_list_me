const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');
const moment = require('moment');
const Promise = require('bluebird');

const urlEncodedParser = bodyParser.urlencoded({
    extended: false
});

// import models
const UserModel = require(path.join(global.appdir, 'models/user/userModel'));
const SessionModel = require(path.join(global.appdir, 'models/user/sessionModel'));
const BucketListModel = require(path.join(global.appdir, 'models/bucket_list/bucket_list_model'));

const sessionCheck = require(path.join(global.appdir, 'middlewares/session_check'));

// Define the home page route
router.get('/users', sessionCheck, function(req, res) {
    console.log("---in get /api/users");
    // dummy data
    let usr = [{
        "firstName": "Peter",
        "lastName": "Whisy",
        "id": 21
    }];
    res.json(usr);
});

// Define the about route
router.post('/user', urlEncodedParser, function(req, res) {
    console.log("in post users");
    if (!req.body.email || !req.body.password) {
        console.log(req);
        res.status(400).json({
            message: 'Not all necessary fields provided!'
        });
        return;
    }

    let newUser = UserModel({
        "firstName": req.body.firstName,
        "lastName": req.body.lastName,
        "email": req.body.email,
        "password": req.body.password
    });

    // save the user
    newUser.save()
        .then(function(result) {
            req.session.userId = result._id;
            res.send('User created!');
        }).catch(function(err) {
            res.status(400).json({
                "message": "User creation failed",
                "error": err
            });
        });
});

router.get('/user/bucketLists', sessionCheck, function(req, res) {
    console.log("-- in GET /bucketLists");
    BucketListModel
        .find({
            userId: req.session.userId
        })
        .then(mongoRes => {
            console.log(mongoRes);
            res.json(mongoRes);
        });
});

// Define post bucketlist request -> add new bucket list
router.post('/user/bucketlist', urlEncodedParser, sessionCheck, function(req, res) {
    console.log("-- in POST bucketlist");
    // create a new bucket list
    // get user-id from session
    let bucketList = BucketListModel({
        "name": req.body.name,
        "state": 0,
        "description": req.body.description,
        "entries": req.body.entries,
        "userId": req.session.userId,
        "createdAt": new Date()
    });

    bucketList
        .save()
        .then(mongoRes => {
            console.log(mongoRes);
            res.json({
                "message": "Bucket list successfully created!"
            });
        })
        .catch(err => {
            res.status(500).json({
                "message": "An error occured",
                "error": err
            })
        });
});

// updates a bucketlist with the given entries
router.patch('/user/bucketlist/:id', urlEncodedParser, sessionCheck, function(req, res) {
    console.log("-- in PATCH bucketlist");
    console.log("--BUcket list id ", req.params.id);
    console.log("--Payload ", req.body.payload);
    BucketListModel
        .findOneAndUpdate({
            userId: req.session.userId,
            _id: req.params.id
        }, {
            $set: req.body.payload
        }, {
            new: true
        })
        .then(mongoRes => {
            console.log(mongoRes);
            // create a new bucket list
            // get user-id from session
            res.send("asdf");
        });

});

// POST login
router.post('/login', function(req, res) {

    return new Promise((resolve, reject) => {
            if (req.session) {
                console.log("foudn session -> regenerating session");

                req.session.regenerate(err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }

                });
            } else {
                console.log("no session found  -> immediatly resolve Promise");
                resolve();
            }
        })
        .then(() => {
            // will have a new session here
            console.log("In POST login");
            let userObj;

            UserModel.findOne({
                    email: req.body.email
                })
                .then(user => {
                    userObj = user;
                    console.log("Result from mongo-db: ", user);
                    if (!user) {
                        console.log('No user found for given email address', req.body.email);
                        return Promise.reject({
                            "message": 'Email and password does not match',
                            "status": 400
                        });
                    }
                    // test a matching password
                    console.log("Calling compare password with", req.body.password);
                    return user.comparePassword(req.body.password)

                })
                .then(isMatch => {
                    console.log("in then of comparepassword, ", isMatch);
                    if (!isMatch) {
                        Promise.reject({
                            "message": 'Email and password does not match',
                            "status": 400
                        });
                    } else {
                        // const sessionId = crypto.randomBytes(16).toString("hex");
                        // const sessionModel = SessionModel({
                        //     "sessionId": sessionId,
                        //     "userId" : userObj._id
                        // });
                        // return sessionModel.save();
                        console.log("in then of comparepassword: userObj ", userObj);
                        console.log("session: ", req.session);
                        req.session.userId = userObj._id;
                        res.json({
                            "message": 'Login successful!'
                        });

                    }
                })
                .catch(err => {
                    res.status(err.status || 500).json({
                        "message": 'An error occured while handling the login-request',
                        "err": err
                    });
                });

        });
});

module.exports = router;
