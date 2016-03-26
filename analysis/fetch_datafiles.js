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
//Room Logs
var mongoQuery = domoMongo.RoomStatus.find()
var status_stream = fs.createWriteStream('data/status_log.json');
var status_log = mongoToJSON(status_stream, mongoQuery, "Status log");
//Behaviour logs
var behaviour_stream = fs.createWriteStream('data/behaviour_log.json');
mongoQuery = domoMongo.DomoBehaviour.find()
var behaviour_log = mongoToJSON(behaviour_stream, mongoQuery, "Behaviour log");
//Status logs
var behaviour_stream = fs.createWriteStream('data/event_log.json');
mongoQuery = domoMongo.DomoEvent.find()
var behaviour_log = mongoToJSON(behaviour_stream, mongoQuery, "Event log");
//Hand off Data to Python Processing Pipeline
