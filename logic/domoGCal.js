var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var moment = require('moment')
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/tasks.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'domo_gcal_cred.json';
module.exports = function(domoActuate){
  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   *
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
      if (err) {
        return getNewToken(oauth2Client, callback);
      } else {
        oauth2Client.credentials = JSON.parse(token);
        return callback(oauth2Client);
      }
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   *
   * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback to call with the authorized
   *     client.
   */
  function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
      rl.close();
      oauth2Client.getToken(code, function(err, token) {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          return;
        }
        oauth2Client.credentials = token;
        storeToken(token);
        return callback(oauth2Client);
      });
    });
  }

  /**
   * Store token to disk be used in later program executions.
   *
   * @param {Object} token The token to store to disk.
   */
  function storeToken(token) {
    try {
      fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
      if (err.code != 'EEXIST') {
        throw err;
      }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
  }

  /**
   * Lists the next 10 events on the user's primary calendar.
   *
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  function listEvents(time, socket) {
    return function(auth){
      var calendar = google.calendar('v3');
      var tm;
      if(time=="today"){
        tm = moment()
      }
      else if(time=="tomorrow"){
        tm = moment().startOf("day").add(1, "day")
      }
      else{
        tm = moment().day(time).startOf("day")
      }
      var req_conf = {
        auth: auth,
        calendarId: 'primary',
        timeMin: tm.format("YYYY-MM-DDTHH:mm:ssZ"),
        timeMax: tm.endOf("day").format("YYYY-MM-DDTHH:mm:ssZ"),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
      };
      console.log(req_conf["timeMin"], req_conf["timeMax"])
      calendar.events.list(req_conf, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          domoActuate.speak("Sorry could not fetch "+time+"'s schedule", function(){
            try{
              socket.emit("ready")
            }
            catch(e){}
          });
          return;
        }
        var events = response.items;
        var breakphrase = "... then you have...";
        var event_string = "On "+time+"'s schedule you have...";
        var msg_string = "On "+time+"'s schedule you have:<div style='margin: 15px 0 15px ; display: flex; justify-content: space-around; align-items: center;'>";
        if (events.length == 0) {
          domoActuate.speak('No events left for '+time, function(){
            try{
              socket.emit("ready")
            }
            catch(e){}
          });
        } else {
          for (var i = 0; i < events.length; i++) {
            if(i!=0){event_string +=breakphrase}
            var event = events[i];
            var start = event.start.dateTime || event.start.date;
            console.log('%s - %s', start, event.summary);
            event_string += event.summary+" at "+moment(start).format("HH:mm")
            msg_string += "<div style='border: 1px solid #555; padding: 10px;'>"+event.summary+" at "+moment(start).format("HH:mm")+"</div>"
          }
          try{
            socket.emit("msg", msg_string+"</div>")
          }
          catch(e){}
          domoActuate.speak(event_string, function(){
            try{
              socket.emit("ready")
            }
            catch(e){}
          });
        }
      });
    }
  }
  function listTodo(socket){
    return function(auth){
      var service = google.tasks('v1');
      var req_conf = {
        auth: auth,
        tasklist: "@default",
        maxResults: 5,
        showCompleted: false
      };
      service.tasks.list(req_conf, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          domoActuate.speak("Sorry could not fetch your todo list.", function(){
            try{
              socket.emit("ready")
            }
            catch(e){}
          });
          return;
        }
        var items = response.items;
        if (items.length == 0) {
          domoActuate.speak('Nothing left on your todo list', function(){
            try{
              socket.emit("ready")
            }
            catch(e){}
          });
        }
        else {
          var event_string = ""
          console.log('Task lists:');
          for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if(item.title.replace(" ","")!=""){
              item.title = item.title.replace(/http(s)?:\/\/.+ /, "")
              if(event_string == ""){
                event_string = "Your todo list includes... "+item.title
              }
              else{
                var phrase_list = ["and", "as well as", "you also have to"]
                var phrase = phrase_list[Math.floor(Math.random() * phrase_list.length)]
                event_string+= "... "+phrase+" "+item.title
              }
            }
          }
          domoActuate.speak(event_string, function(){
            try{
              socket.emit("ready")
            }
            catch(e){}
          });
        }
      });
    }
  }
  return function getAgenda(time, socket){
    if(typeof time === 'undefined'){
      time = "today"
    }
    // Load client secrets from a local file.
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
      if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
      }
      // Authorize a client with the loaded credentials, then call the
      // Google Calendar API.
      if(time == "todo"){
        return authorize(JSON.parse(content), listTodo(socket));
      }
      else{
        return authorize(JSON.parse(content), listEvents(time, socket));
      }
    });
  }
}
