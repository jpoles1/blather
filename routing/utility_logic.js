var moment = require("moment")
module.exports = function(app, speak){
  app.get("/", function(req, res){
    res.render("mic.hbs", {})
  })
  app.get("/time", function(req,res){
    var datetime = new Date();
    var time_str = "It is "+datetime.toTimeString().substring(0,5);
    speak(time_str);
    res.send(time_str);
  })
  app.get("/date", function(req,res){
    var datetime = new Date();
    var date_str = "Today is "+moment().format('dddd MMMM Do YYYY');
    speak(date_str);
    res.send(date_str);
  })
}
