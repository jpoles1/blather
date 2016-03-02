import sys, serial, time, glob
def sendSerial(comm_list):
	usbser_list = glob.glob('/dev/ttyUSB*')
	if len(usbser_list) > 0:
		ser = serial.Serial(usbser_list[0], 9600, timeout=5);
		rec =  ser.readline().strip();
		print "Received: "+rec
		for code in comm_list:
			rec = "ready";
			while rec in ["ready", ""]:
				ser.write(code);
				rec =  ser.readline().strip();
				print "Received: "+rec
		ser.close();
	else:
		time.sleep(2);
		raise Exception("USB disconnected.");
def main(argv):
	comm_list = []
	for color in argv:
		print color
		if(color in ["off", "toggle"]):
			color="on"
		if(color in ["dark"]):
			color="dim"
		if(color in ["light"]):
			color="bright"
		irsig={
			"on": "0xFF02FD",
			"red": "0xFF1AE5",
			"orange": "0xFF30CF",
			"pink": "0xFF2AD5",
			"blue": "0xFF9A65",
			"aqua": "0xFFF807",
			"purple": "0xFF38C7",
			"green": "0xFFA25D",
			"white": "0xFF22DD",
			"bright": "0xFF3AC5",
			"dim": "0xFFBA45",
			"strobe": "0xFFD02F",
			"fade": "0xFFE01F",
			"jump": "0xFF20DF",
			"slow": "0xFFC837",
			"fast": "0xFFE817"
		}
		comm_list.append(irsig[color])
	sendSerial(comm_list)
if __name__ == "__main__":
    main(sys.argv[1:])
