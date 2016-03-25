var mongoose = require("mongoose")
module.exports = function(app, room_status, domoSerial, domoMongo){
  mongoose.connect(process.env.MONGO_URI);
  var domoMonitor = {};
  domoMonitor.lightTimeout = undefined;
  domoMonitor.countOutlets = function(){
    return Object.keys(room_status["outlets"]).filter(function(x){return room_status["outlets"][x]=="on"}).length
  }
  domoMonitor.logRoom = function(){
    var numoutlets = domoMonitor.countOutlets();
    domoMongo.RoomLog({
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
        if(room_status.inactive["outlets"][outlet] != room_status["outlets"][outlet]){
          domoSerial.setOutlet(outlet, room_status.inactive["outlets"][outlet], "domo");
        }
      }
    }
    room_status.inactive = undefined;
    room_status["auto_on"] = 1; //Log set in status that lights have been automatically enabled.
  }
  domoMonitor.parseSensors = function(rawdata){
    var sensors = rawdata.toLowerCase().substring(0, rawdata.length-1).split(";");
    sensors.forEach(function(elem){
      var keywords = elem.split(":")
      if(keywords[0]=="pir" && keywords[1]=="1"){
        var now = new Date();
        room_status["pirct"]+=1;
        room_status["lastpir"]= now;
        if(typeof room_status.inactive != "undefined"){
          domoMonitor.endInactive();
        }
      }
      room_status[keywords[0]] = parseInt(keywords[1]);
    })
  }
  domoMonitor.logEvent = function(event_name, msg, info){
    domoMongo.DomoStatus({
      "time": new Date(),
      "event": event_name,
      "msg": msg,
      "info": info
    }).save();
  }
  domoMonitor.fetchMongoLogs = function(res){
    domoMongo.RoomLog.find({}, null, {sort: '-time'}).limit(750).exec(function (err, roomdata) {
      domoMongo.DomoStatus.find({}, null, {sort: '-time'}).limit(750).exec(function (err, eventdata) {
        domoMongo.DomoBehaviour.find().sort("-time").limit(10).exec(function(err, behaviourdata){
          if(typeof res != "undefined"){
            var last = new Date().toLocaleString();
            if(typeof room_status["lastpir"] != "undefined"){
              last = room_status["lastpir"].toLocaleString()
            }
            res.render("charts.hbs", {
              last_on: last,
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
  if(room_status["dev_mode"]==0){
    setInterval(domoMonitor.logRoom, 60*1000)
  }
  return domoMonitor;
}
