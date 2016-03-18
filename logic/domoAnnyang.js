var Annyang = require('annyang');

module.exports = function(app, domoLights, domoSerial, domoModes){
  var annyang = new Annyang();
  var commands = {
    '(set) (change) light(s) (to) *tag': function(tag) {
      domoLights.setStrip(tag);
    },
    '(set) (change) lamp (to) *tag': function(tag) {
      domoLights.setLamp(tag);
    },
    'all off': function(){
      domoSerial.allOff();
    },
    'all on': function(){
      domoSerial.allOn();
    },
    'kill music': function(){
      domoModes.killMusic();
    }
  };
  annyang.init(commands);
  app.get("/voice", function(req, res){
    try{
      var cmd = req.query.cmd;
      if(annyang.trigger(cmd)){
        res.send("Command Received: "+cmd)
      }
      else{
        res.send("Command Failed: "+cmd)
      }
    }
    catch(e){
      res.send("No Command")
    }
  })
}
