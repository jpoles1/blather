//Load in Mongoose Schemas
var domoMongo = require("../logic/domoMongo")
//Save Data to CSV
domoMongo.RoomLog.find({}, function(err, data){
  data  
}
//Hand off Data to Python Processing Pipeline
