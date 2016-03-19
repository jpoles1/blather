//Import Libraries
#include <stdlib.h>
//Setup IR Blaster
#include <IRremote.h>
IRsend irsend;
//Setup RC Blaster
#include <RCSwitch.h>
RCSwitch mySwitch = RCSwitch();
//Setup Temp. Sensor
#include <dht11.h>
dht11 DHT11;
#define DHT11PIN 8
//Setup PIR Sensor
int pirPin = 6;
int pirState = -1;
int tempState = -1;
int humState = -1;
//Where we store serial data
String serdat = "";
int loopstate = 0;
void setup() {
  //Start serial comms
  Serial.begin(9600);
  pinMode(pirPin, INPUT);
  mySwitch.enableTransmit(10);
  mySwitch.setPulseLength(140);
  mySwitch.setRepeatTransmit(5);
  Serial.println("ready");
}
String checkPIR(){
  int pir_val = digitalRead(pirPin);
  if(pir_val != pirState){
    pirState = pir_val;
    return("PIR:"+String(pir_val)+";");
  }
  pirState = pir_val;
  return("");
}
double Fahrenheit(double celsius){
  return 1.8 * celsius + 32;
}
String checkTemp(){
  int chk = DHT11.read(DHT11PIN);
  int temp, hum;
  String resp = "";
  if(chk==DHTLIB_OK){
     temp = int(Fahrenheit(DHT11.temperature));
     hum = int(DHT11.humidity);
  }
  if(tempState!=temp){
    resp = resp+"temp:"+String(temp)+";";
    tempState = temp;
  }
  int bounds = 3; //Range to be exceeded for new value to be reported
  if(humState+bounds < hum || humState-bounds > hum){
    resp = resp+"humid:"+String(hum)+";";
    humState = hum;
  }
  return resp;
}
void loop() {
  int wait_time = 10; //In second
  if(loopstate>wait_time*2){
    String resp = "";
    resp = resp+checkPIR();
    resp = resp+checkTemp();
    if(resp!=""){
      Serial.println(resp);
    }
    loopstate = 0;
  }
  loopstate = loopstate+1;
  delay(500);
}
void sendIR(String serdat){
  char command_type = serdat[0];
    int retry = serdat[1] - '0';
    String command = serdat.substring(2);
    if(command_type == 'a'){
      
      unsigned long color = strtol(command.c_str(), NULL, 16);
      Serial.println("IR Blasting: "+command+"; "+color);     
      int i = 0;
      while(i<retry){
        irsend.sendNEC(color, 32);
        delay(100);
        i=i+1;
      }
    }
    if(command_type == 'b'){
      char com[25];
      command.toCharArray(com, 25);
      mySwitch.send(com);
      Serial.println("RC Blasting: "+command);     

    }
    serdat = "";
}
/*
  SerialEvent occurs whenever a new data comes in the
 hardware serial RX.  This routine is run between each
 time loop() runs, so using delay inside loop can delay
 response.  Multiple bytes of data may be available.
 */
void serialEvent() {
  while(Serial.available()) {
    serdat = Serial.readStringUntil('/');
    sendIR(serdat);
    delay(50);
    //serdat.trim();
  }
}


