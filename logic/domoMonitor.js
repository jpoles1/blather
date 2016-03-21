var mongoose = require("mongoose")
module.exports = function(app, room_status, domoSerial){
  mongoose.connect(process.env.MONGO_URI);
  var domoMonitor = {};
  domoMonitor.lightTimeout = undefined;
  var RoomLog = mongoose.model("RoomLog", {
    "time": Date,
    "pir": Number,
    "pirct": Number, //Variable used to store the number of PIR trips in the past X minutes.
    "temp": Number,
    "humid": Number,
    "outlets_on": Number
  });
  var DomoStatus = mongoose.model("DomoStatus", {
    "time": Date,
    "event": String,
    "msg": String,
    "info": mongoose.Schema.Types.Mixed
  })
  domoMonitor.countOutlets = function(){
    return Object.keys(room_status["outlets"]).filter(function(x){return room_status["outlets"][x]=="on"}).length
  }
  domoMonitor.logRoom = function(){
    var numoutlets = domoMonitor.countOutlets();
    RoomLog({
      "time": Date.now(),
      "pir": room_status["pir"],
      "pirct": room_status["pirct"], //Variable used to store the number of PIR trips in the past X minutes.
      "temp": room_status["temp"],
      "humid": room_status["humid"],
      "outlets_on": numoutlets
    }).save();
  }
  domoMonitor.parseSensors = function(rawdata){
    var sensors = rawdata.toLowerCase().substring(0, rawdata.length-1).split(";");
    sensors.forEach(function(elem){
      var keywords = elem.split(":")
      console.log(keywords)
      if(keywords[0]=="pir" && keywords[1]=="1"){
        /*clearTimeout(domoMonitor.lightTimeout)
        domoMonitor.lightTimeout = setTimeout(function(){

        })*/
        if(typeof room_status.inactive != "undefined"){
          var powerSaver = (Date.Now()-room_status.inactive["start"])*60*room_status.inactive["outletct"] //Time in millis x 60 watts x # outlets left on
          var powerSaver = powerSaver/(1000*60*60) // Divide millis to get hours
          var msg = "Saved: "+String(powerSaver)+" Watts";
          console.log(msg)
          this.logEvent("PowerSaver", msg)
          room_status.inactive = undefined;
        }
        var now = Date.now();
        room_status["pirct"]+=1;
        room_status["lastpir"]= now;
      }
      room_status[keywords[0]] = parseInt(keywords[1]);
    })
  }
  domoMonitor.logEvent = function(event_name, msg, info){
    DomoStatus({
      "time": Date.now(),
      "event": event_name,
      "msg": msg,
      "info": info
    }).save();
  }
  domoMonitor.logUserInput = function(command, hardware_type){
    domoMonitor.logEvent("User Input", "Command: "+command, {
      "hardware": hardware_type,
      "command": command
    })
  }
  domoMonitor.fetchMongoLogs = function(res){
    RoomLog.find().limit(1400).sort('time').exec(function (err, roomdata) {
      if (err) return console.error(err);
      DomoStatus.find().sort('time').exec(function (err, eventdata) {
        if(typeof res != "undefined"){
          res.render("charts.hbs", {roomdata: JSON.stringify(roomdata), eventdata: JSON.stringify(eventdata)})
        }
      });
    })
  }
  app.get("/charts", function(req, res){
    domoMonitor.fetchMongoLogs(res)
  })
  domoMonitor.logEvent("Restarted")
  setInterval(domoMonitor.logRoom, 60*1000)
  return domoMonitor;
}
