var Annyang = require('annyang');

var annyang = new Annyang();


module.exports = function(app, domoLights, domoSerial, domoModes){
  annyang.init(commands);

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
  app.get("voice_command", function(req, res){
    annyang.trigger(req.query.cmd);
  })
}
