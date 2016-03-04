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
exports.correctLEDCommand = function(tag){
  if(["read"].contains(tag)){tag = "red";}
  if(["blew"].contains(tag)){tag = "blue";}
  if(["screen", "creen"].contains(tag)){tag = "green";}
  if(["right"].contains(tag)){tag = "bright";}
  if(["paint"].contains(tag)){tag = "pink";}
  if(["people"].contains(tag)){tag = "purple";}
  if(["babe", "paid", "peed"].contains(tag)){tag = "fade";}
  if(["tim", "them"].contains(tag)){tag = "dim";}
  if(["ggle"].contains(tag)){tag = "toggle";}
  if(["flow", "low", "slope"].contains(tag)){tag = "slow";}
  if(["past"].contains(tag)){tag = "fast";}
  var led_power = ["toggle", "on", "off"];
  var led_colors = ["red","orange","pink","blue","aqua","purple","green","white"];
  var led_settings = ["bright","dim","slow","fast"];
  var led_modes = ["strobe","fade","jump"];
  var keywords = [].concat(led_power,led_colors,led_settings,led_modes)
  if(keywords.contains(tag)){
    return tag;
  }
  else{
   return "";
  }
}
exports.fixLEDTag = function(tag){
  var tagwords = [];
  tag.split(" ").forEach(function(elem){
    var validated = exports.correctLEDCommand(elem);
    if(validated!=""){tagwords.push(validated)}
  });
  return tagwords;
}
})(typeof exports === 'undefined'? this['domoValidate']={}: exports);
