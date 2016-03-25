var mongoose = require("mongoose")
var domoMongo = {}
domoMongo.RoomLog = mongoose.model("RoomLog", {
  "time": Date,
  "pir": Number,
  "pirct": Number, //Variable used to store the number of PIR trips in the past X minutes.
  "temp": Number,
  "humid": Number,
  "outlets_on": Number
});
domoMongo.DomoStatus = mongoose.model("DomoStatus", {
  "time": Date,
  "event": String,
  "msg": String,
  "info": mongoose.Schema.Types.Mixed
})
domoMongo.DomoBehaviour = mongoose.model("domo-behaviour", {
  "time": Date,
  "actor": String,
  "actuator": String,
  "command_string": String,
  "info": mongoose.Schema.Types.Mixed
})
module.exports = domoMongo;
