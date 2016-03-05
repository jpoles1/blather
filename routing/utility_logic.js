var moment = require("moment")
module.exports = function(app, domoActuate){
  app.get("/", function(req, res){
    res.render("mic.hbs", {})
  })
  app.get("/time", function(req,res){
    var datetime = new Date();
    var time_str = "It is "+datetime.toTimeString().substring(0,5);
    domoActuate.speak(time_str);
    res.send(time_str);
  })
  app.get("/date", function(req,res){
    var datetime = new Date();
    var date_str = "Today is "+moment().format('dddd MMMM Do YYYY');
    domoActuate.speak(date_str);
    res.send(date_str);
  })
  app.get("/thanks", function(req, res){
    domoActuate.speak("You're welcome sir.");
    res.send("You're welcome sir.")
  });
}
