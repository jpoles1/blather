/*
  Example for different sending methods
  
  http://code.google.com/p/rc-switch/
  
*/

#include <RCSwitch.h>


RCSwitch mySwitch = RCSwitch();

void setup() {

  Serial.begin(9600);
  
  // Transmitter is connected to Arduino Pin #10  
  mySwitch.enableTransmit(10);

  // Optional set pulse length.
  mySwitch.setPulseLength(91);
  
  // Optional set protocol (default is 1, will work for most outlets)
  // mySwitch.setProtocol(2);
  
  // Optional set number of transmission repetitions.
  mySwitch.setRepeatTransmit(15);
  
}

void loop() {
  char* on = "0100000000010101001100110";
  char*  off = "0100000000010101001111000";
  Serial.println("TEST");
  /* See Example: TypeA_WithDIPSwitches */
  mySwitch.switchOn(on, 25);
  delay(1000);
  mySwitch.switchOn(off, 25);
  delay(1000);
}
