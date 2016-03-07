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
def main(command_type, argv):
	print command_type
	if(command_type=="strip"):
		comm_list = []
		for color in argv:
			print color
			if(color in ["off", "toggle"]):
				color="on"
			if(color in ["dark"]):
				color="dim"
			#The value preceding the 0x indicates the number of repeat signals to send
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
				"bright": "150xFF3AC5",
				"dim": "150xFFBA45",
				"strobe": "20xFFD02F",
				"fade": "20xFFE01F",
				"jump": "20xFF20DF",
				"slow": "70xFFC837",
				"fast": "70xFFE817"
			}
			comm_list.append(irsig[color])
		sendSerial("a"+comm_list)
	elif(command_type=="lamp"):
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
		sendSerial(["b4"+outlet_commands[argv[1]][argv[0]]])
if __name__ == "__main__":
	main(sys.argv[1], sys.argv[2:])
	'''try:
		main(sys.argv[1], sys.argv[2:])
	except:
		raise ValueError("Improper parameters")
		'''
