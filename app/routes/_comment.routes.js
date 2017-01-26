/**
 * Created by Andreas on 22/01/2017.
 */

import * as comment from '../controllers/comment.controller';
import * as poi from '../controllers/poi.controller';
import * as user from '../controllers/user.controller';

/*const checkPermission = condition => (req,res,next) =>
 condition(req) ? next() :
 res.status(403).json({message: "You are not allowed to change somebody else's trip"});

 const tripOwnerCondition = req => req.user.username === req.trip.creator.local.username;
 const tripOwnerOrAdminCondition = req => tripOwnerCondition(req) || req.user.roles.includes('admin');*/


export default (app, router, auth, admin) => {
  router.get('/comment/all/:tripID',auth,comment.allTripComments);
  router.post('/comment',auth,comment.createComment,comment.show);
  /*router.get('/user/search/:searchValue',auth,user.search);
  router.param('userID',user.load);
  router.get('/user/openFriendRequest',auth,user.openFriendRequest)
  router.get('/user/getFriends/:userID',auth,user.getUserFriends)
  router.get('/user/acceptRequest/:userID',auth,user.acceptFriendRequest)
  router.get('/user/rejectRequest/:userID',auth,user.rejectFriendRequest)
  router.get('/user/other/:userID',auth,user.getOtherUser,user.show)
  router.get('/user/:userID',user.show);
  router.post('/user/friendRequest',auth,user.friendRequest)
  router.get('/user/checkFriend/:userID',auth,user.checkFriend)
  router.get('/user/removeFriend/:userID',auth,user.removeFriend,user.checkFriend)*/

}
