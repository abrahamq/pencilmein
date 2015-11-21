// config/auth.js
// expose our config directly to our application using module.exports

var getGoogleAuth = function(){
  bigObject = {} ;
  googleAuth = {}; 
  googleAuth.clientID = '356868225877-amoc4p9vjfodptcor4ohu7bgbqbapoh1.apps.googleusercontent.com';
  googleAuth.clientSecret =  '8eTO6hfH4qrQZ7MYWRcNT032'; 

  if( process.env.PRODUCTION){
    googleAuth.callbackURL = 'http://www.pencilmein.xyz/auth/google/callback'; 
  } else {
    googleAuth.callbackURL = 'http://localhost:3000/auth/google/callback'; 
  } 
  bigObject.googleAuth = googleAuth ; 
  return bigObject; 
}; 


module.exports = getGoogleAuth(); 


//{
//  getGoogleAuth() 
////    //TODO: Allow option for callbackurl to point to production server 
////    'googleAuth' : {
////        'clientID'      : '356868225877-amoc4p9vjfodptcor4ohu7bgbqbapoh1.apps.googleusercontent.com',
////        'clientSecret'  : '8eTO6hfH4qrQZ7MYWRcNT032',
////        'callbackURL'   : 'http://localhost:3000/auth/google/callback'
////    }
//};
