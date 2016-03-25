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
      "time": new Date(),
      "pir": room_status["pir"],
      "pirct": room_status["pirct"], //Variable used to store the number of PIR trips in the past X minutes.
      "temp": room_status["temp"],
      "humid": room_status["humid"],
      "outlets_on": numoutlets
    }).save();
  }
  domoMonitor.endInactive = function(){
    var powerTime = (Date.now()-room_status.inactive["start"])/(1000*60*60) // Divide millis to get hours
    var powerSaver = powerTime *60*room_status.inactive["outletct"] //Time x 60 watts x # outlets left on
    var msg = "Saved: "+String(powerSaver)+" Watts; Over";
    console.log(msg)
    domoMonitor.logEvent("PowerSaver", msg)
    if(typeof room_status["inactive"]["outlets"] != "undefined"){
      for(outlet in room_status.inactive["outlets"]){
        domoSerial.setOutlet(outlet, room_status.inactive["outlets"][outlet], "domo");
      }
    }
    room_status.inactive = undefined;
    room_status["auto_on"] = 1; //Log set in status that lights have been automatically enabled.
  }
  domoMonitor.parseSensors = function(rawdata){
    var sensors = rawdata.toLowerCase().substring(0, rawdata.length-1).split(";");
    sensors.forEach(function(elem){
      var keywords = elem.split(":")
      console.log(keywords)
      if(keywords[0]=="pir" && keywords[1]=="1"){
        if(typeof room_status.inactive != "undefined"){
          domoMonitor.endInactive();
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
      "time": new Date(),
      "event": event_name,
      "msg": msg,
      "info": info
    }).save();
  }
  domoMonitor.fetchMongoLogs = function(res){
    RoomLog.find({}, null, {sort: '-time'}).limit(750).exec(function (err, roomdata) {
      DomoStatus.find({}, null, {sort: '-time'}).limit(750).exec(function (err, eventdata) {
        domoSerial.DomoBehaviour.find().sort("-time").limit(10).exec(function(err, behaviourdata){
          if(typeof res != "undefined"){
            res.render("charts.hbs", {
              last_on: room_stats["lastpir"]
              behaviourdata: behaviourdata,
              roomdata: JSON.stringify(roomdata.reverse()),
              eventdata: JSON.stringify(eventdata.reverse())
            })
          }
        })
      });
    })
  }
  app.get("/charts", function(req, res){
    domoMonitor.fetchMongoLogs(res)
  })
  setInterval(domoMonitor.logRoom, 60*1000)
  return domoMonitor;
}
