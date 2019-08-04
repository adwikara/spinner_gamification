import serial
ser = serial.Serial('/dev/cu.usbserial-A50285BI', 115200, timeout=None, xonxoff=False, rtscts=False, dsrdtr=False)
ser.flushInput()
ser.flushOutput()
data_raw = ser.readline()
data_raw2=data_raw[:-2]
num=int.from_bytes(data_raw2,byteorder='big')
random_number = num % 101
print(random_number)
