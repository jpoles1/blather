var fs = require("fs");
var mongoose = require("mongoose")
require('dotenv').config();
//Load in Mongoose Schemas
mongoose.connect(process.env.MONGO_URI);
var domoMongo = require("../logic/domoMongo")
var streams = {};
var status = {}
var mongoToJSON = function(ws, mongoQuery, taskName){
  status[taskName] = 0;
  ws.write("[")
  function transform(data){
      return JSON.stringify(data) + ",";
  }
  var dbStream = mongoQuery.lean().stream({'transform': transform});
  dbStream.on("end", function(){
      ws.write("{}]");
      ws.end();
      status[taskName] = 1;
      console.log(taskName+" transfer has been completed!")
      var done = Object.keys(status).every(function(key){
        return status[key] == 1;
      })
      if(done){process.exit()}
  });
  dbStream.pipe(ws);
}
fs.createWriteStream('data/room_log.json');
//Room Logs
var mongoQuery = domoMongo.RoomLog.find()
var room_stream = fs.createWriteStream('data/room_log.json');
var room_log = mongoToJSON(room_stream, mongoQuery, "Room log");
//Behaviour logs
var behaviour_stream = fs.createWriteStream('data/behaviour_log.json');
mongoQuery = domoMongo.DomoBehaviour.find()
var behaviour_log = mongoToJSON(behaviour_stream, mongoQuery, "Behaviour log");
//Hand off Data to Python Processing Pipeline
