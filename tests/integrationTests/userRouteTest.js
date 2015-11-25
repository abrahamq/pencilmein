var request = require('supertest'); 
var assert = require('assert'); 

var agent = request.agent('http://localhost:3000');
var request = request('http://localhost:3000'); 


describe('GET /', function(){
  it('respond with 200', function(done){
    request.get('/').expect(200, function(err){
      assert.equal(err, null); 
    }).expect(function(res) {
      assert.equal(res.text.indexOf('Sign in with Google') > -1, true); 
      done(); 
    }); 
  }); 
}); 

var getCsrfToken = function(res){
  var text = res.text;
  var tag = 'data-_csrf='; 
  var index = text.indexOf(tag); 
  var tokenLenght = 47;
  var csrfToken = text.slice(index + tag.length, index+47)  ;
  return csrfToken;
}; 

describe('GET /user after auth', function(){

  it('get authentication', function(done){
    //agent is the code that persist the cookie- must use agent from now on 
    agent.get('/test').expect(200).end(function(err, res){
      agent.get('/user').expect(200).expect('redirect', false).end(function(err, res){
        agent.get('/meeting').expect(200).expect('redirect', false).end(function(err, res){
          data = {}; 
          data.title = "PleaseWork"; 
          data.location = "no really";
          data._csrf  = getCsrfToken(res); 
          data.earliestStartTime = '11/26/2016 12:00 AM';
          data.latestEndTime = '12/26/2016 12:00 AM'; 
          data.duration = "30"; 
          data.invitees = ['pmi.test.email2@gmail.com'];
          agent.post('/meeting/create').send(data).end(function(err, res){
            console.log(res); 
            assert.equal(res.status, 200); 
            done(); 
          }); 
        });

      }); 
    }) ; 
  }); 


}); 
