var Annyang = require('annyang');

module.exports = function(app, domoLights, domoSerial, domoModes){
  var annyang = new Annyang();
  var commands = {
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
    'kill music': function(){
      domoModes.killMusic();
    }
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
