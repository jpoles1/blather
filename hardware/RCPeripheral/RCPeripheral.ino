/*
  Example for different sending methods
  
  http://code.google.com/p/rc-switch/
  
*/

#include <RCSwitch.h>

RCSwitch mySwitch = RCSwitch();
String serdat = "";

void setup() {

  Serial.begin(9600);
  
  // Transmitter is connected to Arduino Pin #10  
  mySwitch.enableTransmit(10);

  // Optional set pulse length.
  mySwitch.setPulseLength(140);
  
  // Optional set protocol (default is 1, will work for most outlets)
  // mySwitch.setProtocol(2);
  
  // Optional set number of transmission repetitions.
  mySwitch.setRepeatTransmit(5);
  
}

void loop() {
  if(serdat != "") {
    char* com;
    serdat.toCharArray(com, 25);
    char* on = "0100000000010101001100110";
    char* off = "0100000000010101001111000";
    mySwitch.send(on);
    delay(500);  
    mySwitch.send(off);
    delay(500);
    serdat = "";
  }
}
void serialEvent() {
  if(Serial.available()) {
    serdat = Serial.readString();
    //serdat.trim();
  }
}

