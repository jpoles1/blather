var moment = require("moment")
module.exports = function(app, domoActuate, domoMonitor){
  var domoUtility = {};
  app.get("/", function(req, res){
    res.render("mic.hbs", {})
  })
  domoUtility.getDate = function(socket){
    var datetime = new Date();
    var date_str = "Today is "+moment().format('dddd MMMM Do YYYY');
    domoActuate.speak(date_str, function(){domoActuate.socketReply(socket, "ready")} );
    domoActuate.socketReply(socket, "msg", date_str);
  }
  domoUtility.thanks = function(socket){
    domoActuate.speak("You're welcome sir.", function(){
      domoActuate.socketReply(socket, "unready")
    });
    domoActuate.socketReply(socket, "msg", "You're welcome sir.");
  }
  domoUtility.shutup = function(socket){
    domoActuate.runSysCommand("pkill", "espeak")
    domoActuate.socketReply(socket, "msg", "Killed Espeak")
  }
  domoUtility.getTime = function(socket){
    var datetime = new Date();
    var time_str = "It is: "+datetime.toTimeString().substring(0,5);
    domoActuate.speak(time_str, function(){domoActuate.socketReply(socket, "ready")});
    domoActuate.socketReply(socket, "msg", time_str);
  }
  domoUtility.getRoomTemp = function(socket){
    var temp_str = "It is: "+domoMonitor.room_status["temp"]+" degrees with "+domoMonitor.room_status["humid"]+" percent humidity.";
    domoActuate.speak(temp_str, function(){domoActuate.socketReply(socket, "ready")});
    domoActuate.socketReply(socket, "msg", temp_str);
  }
  return domoUtility;
}
