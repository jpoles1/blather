module.exports = function(ser){
  var domoSerial = {};
  var serial_active = 0;
  domoSerial.setOutlet = function(outlet, comm){
    outlet_commands = {
      "on": {
        "1": "0100000000010101001100110",
        "2": "0100000000010101110000110",
        "3": "0100000000010111000000110",
        "4": "0100000000011101000000110",
        "all": "0100000000110101000000110"
      },
      "off": {
        "1": "0100000000010101001111000",
        "2": "0100000000010101110011000",
        "3": "0100000000010111000011000",
        "4": "0100000000011101000011000",
        "all": "0100000000110101000011000"
      }
    }
    ser.write("b4"+outlet_commands[comm][outlet]+"\r")
  }
  domoSerial.setStrip = function(comms){
    var comm_list = "";
    comms.split(" ").forEach(function(comm){
      var color = comm;
      if(["off", "toggle"].contains(color)){
        color="on";
      }
      if(["dark"].contains(color)){
        color="dim";
      }
			//The value preceding the 0x indicates the number of repeat signals to send
			irsig={
				"on": "10xFF02FD",
				"red": "50xFF1AE5",
				"orange": "50xFF30CF",
				"pink": "50xFF2AD5",
				"blue": "50xFF9A65",
				"aqua": "50xFFF807",
				"purple": "50xFF38C7",
				"green": "50xFFA25D",
				"white": "50xFF22DD",
				"bright": "90xFF3AC5",
				"dim": "90xFFBA45",
				"strobe": "20xFFD02F",
				"fade": "20xFFE01F",
				"jump": "20xFF20DF",
				"slow": "70xFFC837",
				"fast": "70xFFE817"
			}
      if(comm_list == ""){
        comm_list = "a"+irsig[color]
      }
      else{
        comm_list += "/a"+irsig[color]
      }
    })
    console.log(typeof comm_list)
    ser.write(comm_list+"\r")
  }
  domoSerial.allOff = function(){
    ser.write("b40100000000110101000011000/a10xFF02FD")
  }
  domoSerial.allOn = function(){
    ser.write("b40100000000110101000000110/a10xFF02FD")
  }
  return domoSerial
}
