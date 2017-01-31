/**
 * Created by Andreas on 22/01/2017.
 */
import * as trip from '../controllers/trip.controller';
import * as poi from '../controllers/poi.controller';
import * as user from '../controllers/user.controller';
import multipart from 'connect-multiparty';

/*const checkPermission = condition => (req,res,next) =>
  condition(req) ? next() :
    res.status(403).json({message: "You are not allowed to change somebody else's trip"});

const tripOwnerCondition = req => req.user.username === req.trip.creator.local.username;
const tripOwnerOrAdminCondition = req => tripOwnerCondition(req) || req.user.roles.includes('admin');*/

const multipartMiddleware = multipart();

const isOwner = (req,res,next) =>
  req.body.id === req.user.id ?
    next():
    res.status(403).json({message: "You are not allowed to change somebody else's User"})


export default (app, router, auth, admin) => {
  router.get('/user/search/:searchValue',auth,user.search);
  router.param('userID',user.load);
  router.get('/user/openFriendRequest',auth,user.openFriendRequest)
  router.get('/user/getFriends/:userID',auth,user.getUserFriends)
  router.get('/user/acceptRequest/:userID',auth,user.acceptFriendRequest)
  router.get('/user/rejectRequest/:userID',auth,user.rejectFriendRequest)
  router.get('/user/other/:userID',auth,user.getOtherUser,user.show)
  router.get('/user/:userID',user.show);
  router.patch('/user/:userID',auth, isOwner, user.update,user.show)
  router.post('/user/friendRequest',auth,user.friendRequest)
  router.get('/user/checkFriend/:userID',auth,user.checkFriend)
  router.get('/user/removeFriend/:userID',auth,user.removeFriend,user.checkFriend)
  router.post('/user/:userID/image',auth,multipartMiddleware,user.addImage);
 /* router.post('/trip/addpoi/:tripId',auth,checkPermission(tripOwnerCondition),poi.create,trip.addPOI,trip.show);
  router.patch('/trip/:tripId',auth,checkPermission(tripOwnerCondition),trip.update,trip.show);
  router.post('/trip',auth,trip.create,trip.show);
  router.get('/trip',auth,trip.list);
  router.param('tripId',trip.load);
  router.get('/trip/mine',auth,trip.mine);
  router.get('/trip/count',auth,trip.count);
  router.delete('/trip/:tripId',auth,checkPermission(tripOwnerOrAdminCondition),trip.remove);
  router.get('/trip/:tripId',trip.show);*/
}
