var Annyang = require('annyang');
module.exports = function(app, domoLights, domoSerial, domoModes, domoUtility){
  var annyang = new Annyang();
  function parseModes = function(tag){
    tag = tag.toLowerCase();
    if(["love", "sex", "sexy", "sexytime"].contains(tag)){
      domoModes.loveMode();
    }
    else if(["bed", "bedtime", "bed time", "serpentine"].contains(tag)){
      domoModes.bedtimeMode("user");
    }
    else if(["sleep"].contains(tag)){
      domoModes.sleepMode("user");
    }
    else if(["party"].contains(tag)){
      domoModes.partyMode();
    }
    else if(["wake", "week", "with"].contains(tag)){
      domoModes.wakeMode("user");
    }
    else if(["static"]){
      domoModes.whiteNoise("user");
    }
    else{
      console.log("Could not activate the mode:", tag)
    }
  }
  var commands = {
    "(what's) (what) (is) (on) (my) schedule (for) (on) :time": function(time) {
      domoGCal(time);
    },
    "(what's) (what) (is) (on) :time schedule": function(time) {
      time = time.split("'")[0]
      domoGCal(time);
    },
    "(what's) (what) (is) (on) (my) (today's) schedule (for) (today)": function() {
      domoGCal("today");
    },
    "(what's) (what) (is) (the) weather": function(){
      domoWeather("today");
    },
    "(what's) (what) (is) (the) weather (on) :day": function(day) {
      if(day == "in"){day="today"}
      domoWeather(day);
    },
    "(what's) (what) (is) (on) (my) to-do list": function() {
      domoGCal("todo");
    },
    "(what's) (what) (is) (the) time (is it)": function(){
      domoUtility.getTime()
    },
    "(what's) (what is) (the) (today's) date": function(){
      domoUtility.getDate();
    },
    'thank(s) (you)': function(){
      domoUtility.thanks();
    },
    'all off': function(){
      domoLights.allOff();
    },
    'all on': function(){
      domoLights.allOn();
    },
    '(shut up) (shutup)': function(){
        domoUtility.shutup();
    },
    '(set) (change) light(s) (to) *tag': function(tag) {
      domoLights.setStrip(tag);
    },
    '(set) (change) (desk) lamp (to) *tag': function(tag) {
      domoLights.setLamp(tag);
    },
    'all off': function(){
      domoLights.allOff();
    },
    'all on': function(){
      domoLights.allOn();
    },
    '(kill music) (end music) (stop music)': function(){
      domoModes.killMusic();
    },
    'get ready for :tag (time)': parseModes(tag),
    '(enter) (activate) (start) :tag mode': parseModes(tag)
  };
  annyang.init(commands);
  app.get("/voice", function(req, res){
    var cmd = req.query.cmd;
    if(annyang.trigger(cmd)){
      res.send("Command Received: "+cmd)
    }
    else{
      res.send("Command Failed: "+cmd)
    }

    try{
    }
    catch(e){
      res.send("No Command")
    }
  })
}
