import serial

SERIAL_PORT = "/dev/ttyUSB0"
BAUD_RATE = 115200

try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE)
    # print(f"Serial port {SERIAL_PORT} opened successfully.")
except Exception as e:
    # print(f"Error opening serial port {SERIAL_PORT}: {e}")
    ser = None

def send_serial_command(command):
    if ser:
        try:
            ser.write(f"{command}\n".encode())
            #print(f"Sent command: {command}")
        except Exception as e:
            print(f"Error sending serial command: {e}")
    else:
        print("Serial port not initialized.")

def close_serial():
    if ser:
        ser.close()
        #print("Serial port closed.")
