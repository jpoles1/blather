var mongoose = require("mongoose")
var domoMongo = {}
domoMongo.RoomStatus = mongoose.model("domo-status", {
  "time": Date,
  "pir": Number,
  "pirct": Number, //Variable used to store the number of PIR trips in the past X minutes.
  "temp": Number,
  "humid": Number,
  "outlets_on": Number
});
domoMongo.DomoEvent = mongoose.model("domo-event", {
  "time": Date,
  "event": String,
  "msg": String,
  "info": mongoose.Schema.Types.Mixed
})
domoMongo.logEvent = function(event_name, msg, info){
  domoMongo.DomoEvent({
    "time": new Date(),
    "event": event_name,
    "msg": msg,
    "info": info
  }).save();
}
domoMongo.DomoBehaviour = mongoose.model("domo-behaviour", {
  "time": Date,
  "actor": String,
  "actuator": String,
  "command_string": String,
  "info": mongoose.Schema.Types.Mixed
})
domoMongo.logBehaviour = function(actor, actuator, command, info){
  domoMongo.DomoBehaviour({
    "time": new Date(),
    "actor": actor,
    "actuator": actuator,
    "command_string": command,
    "info": info
  }).save();
}
module.exports = domoMongo;
