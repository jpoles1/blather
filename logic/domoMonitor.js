var mongoose = require("mongoose")
module.exports = function(app, room_status, domoSerial){
  mongoose.connect(process.env.MONGO_URI);
  domoMonitor = {};
  domoMonitor.lightTimeout = undefined;
  var RoomLog = mongoose.model("RoomLog", {
    "time": Date,
    "pir": Number,
    "pirct": Number, //Variable used to store the number of PIR trips in the past X minutes.
    "temp": Number,
    "humid": Number,
    "outlets_on": Number
  });
  domoMonitor.mongoLog = function(){
    RoomLog({
      "time": Date.now(),
      "pir": room_status["pir"],
      "pirct": room_status["pirct"], //Variable used to store the number of PIR trips in the past X minutes.
      "temp": room_status["temp"],
      "humid": room_status["humid"],
      "outlets_on": Object.keys(room_status["outlets"]).filter(function(x){return room_status["outlets"][x]=="on"}).length
    }).save();
  }
  domoMonitor.logSensors = function(rawdata){
    var sensors = rawdata.toLowerCase().substring(0, rawdata.length-1).split(";");
    sensors.forEach(function(elem){
      var keywords = elem.split(":")
      console.log(keywords)
      if(keywords[0]=="pir" && keywords[1]=="1"){
        /*clearTimeout(domoMonitor.lightTimeout)
        domoMonitor.lightTimeout = setTimeout(function(){

        })*/
        var now = Date.now();
        room_status["pirct"]+=1;
        room_status["lastpir"]= now;
        console.log("Detected Motion")
      }
      room_status[keywords[0]] = parseInt(keywords[1]);
    })
    console.log(room_status)
  }
  domoMonitor.fetchMongoLogs = function(res){
    RoomLog.find().sort('time').exec(function (err, logs) {
      if (err) return console.error(err);
      if(typeof res != "undefined"){
        res.render("charts.hbs", {logdata: JSON.stringify(logs)})
      }
    })
  }
  app.get("/charts", function(req, res){
    domoMonitor.fetchMongoLogs(res)
  })
  setInterval(domoMonitor.mongoLog, 60*1000)
  return domoMonitor;
}
