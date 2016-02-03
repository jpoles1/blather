import serial, sys, time
def main(argv):
	color = argv[0]
	irsig={"on": "0xFF02FD", "red": "0xFF1AE5", "green": "0xFF9A65","blue": "0xFFA25D", "white": "0xFF22DD"}
	ser = serial.Serial('/dev/ttyUSB0', 9600)
	time.sleep(.5);
	print(ser.name)
	ser.write(irsig[color])
	ser.close();
if __name__ == "__main__":
    main(sys.argv[1:])
