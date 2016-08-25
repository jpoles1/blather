(function(exports){

// your code goes here
Array.prototype.contains = function(obj) {
  var i = this.length;
  while (i--) {
    if (this[i] === obj) {
      return true;
    }
  }
  return false;
}
exports.checkName = function(name){
  if(["rrad", "red", "brad", "rad", "rod", "ram", "fred", "brother", "bro", "bread", "grab"].contains(name)){name = "RRAD";}
  if(["domo", "dummy", "don't know", "dumbo", "don't", "donna", "demo", "mama", "there", "number", "toma"].contains(name)){name = "Domo";}
  return name;
}
exports.correctLEDCommand = function(tag){
  if(["weight"].contains(tag)){tag = "white";}
  if(["read"].contains(tag)){tag = "red";}
  if(["blew"].contains(tag)){tag = "blue";}
  if(["screen", "creen"].contains(tag)){tag = "green";}
  if(["right", "light"].contains(tag)){tag = "bright";}
  if(["paint"].contains(tag)){tag = "pink";}
  if(["people"].contains(tag)){tag = "purple";}
  if(["babe", "paid", "peed"].contains(tag)){tag = "fade";}
  if(["tim", "them"].contains(tag)){tag = "dim";}
  if(["ggle", "tuggle", "tyle"].contains(tag)){tag = "toggle";}
  if(["flow", "low", "slope"].contains(tag)){tag = "slow";}
  if(["past"].contains(tag)){tag = "fast";}
  var led_power = ["toggle", "on", "off"];
  var led_colors = ["red","orange","pink","blue","aqua","purple","green","white"];
  var led_settings = ["bright", "dark", "dim","slow","fast"];
  var led_modes = ["strobe","fade","jump"];
  var keywords = [].concat(led_power,led_colors,led_settings,led_modes)
  if(keywords.contains(tag)){
    return tag;
  }
  else{
   return "";
  }
}
exports.checkLEDTag = function(tag){
  var tagwords = [];
  tag.toLowerCase().split(" ").forEach(function(elem){
    var validated = exports.correctLEDCommand(elem);
    if(validated!=""){tagwords.push(validated)}
  });
  return tagwords;
}
exports.checkLampTag = function(tag){
  return ["on", "off"].contains(tag.toLowerCase());
}
exports.checkFanTag = function(tag){
  if(["nin"].contains(tag)){tag = "on";}
  if(["oss"].contains(tag)){tag = "off";}
  return ["on", "off"].contains(tag.toLowerCase()) ? tag : undefined;
}
/*exports.checkDevice = function(device, tag){
  var device_list = ["lamp", "lights", "fan"];
  var out = {};
  //correct device names
  if(["van"].contains(device)){device = "fan";}
  //ensure valid device
  if(!device_list.contains(device)){device=undefined}
  if(device){
    if(["oss"].contains(tag)){tag = "off";}
    if(["nin"].contains(tag)){tag = "on";}
  }
  return {device, tag}
}*/
})(typeof exports === 'undefined'? this['domoValidate']={}: exports);
