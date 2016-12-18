const path = require('path');
const SessionModel = require(path.join(global.appdir, 'models/user/sessionModel'));
const checkSession = function(req, res, next) {
  console.log("in check session middleware");
    if (!req.session.userId) {
        res.json({
            "message": "No session found."
        });
    } else {
        console.log("Session found for user id ", req.session);
        next();
    }
    //  let sessionIdFromHeader = req.get("sessionId");
    // SessionModel
    //     .find({
    //         sessionId: sessionIdFromHeader
    //     })
    //     .then(result => {
    //         if (!result || result.length === 0) {
    //             return Promise.reject("No session found!");
    //         }
    //         next();
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         res.status(400).json({});
    //     });
};

module.exports = checkSession;
