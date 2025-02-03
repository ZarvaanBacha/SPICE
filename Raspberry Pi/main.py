import serial
import time

# Configure the serial connection (adjust the port accordingly)
ser = serial.Serial('/dev/ttyUSB0', 115200, timeout=1)  # Change to /dev/ttyAMA0 if using GPIO

def send_command(direction, steps):
    """ Send movement command to Arduino """
    command = f"{direction},{steps}\n"
    ser.write(command.encode())  # Send the command
    time.sleep(0.1)  # Small delay for stability

if __name__ == "__main__":
    while True:
        dir_input = input("Enter direction (1 = forward, 0 = backward): ")
        steps_input = input("Enter number of steps: ")
        
        if dir_input in ['0', '1'] and steps_input.isdigit():
            send_command(dir_input, steps_input)
        else:
            print("Invalid input, please enter 1/0 for direction and a valid number for steps.")
