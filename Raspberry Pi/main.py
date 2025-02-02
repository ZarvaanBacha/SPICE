import serial
import time

ser = serial.Serial('/dev/ttyUSB0', 115200, timeout=1)  # Adjust for actual port

def send_command(direction, steps, aggression):
    """ Send movement command to Arduino """
    command = f"{direction},{steps},{aggression}\n"
    ser.write(command.encode())  
    time.sleep(0.1)  

if __name__ == "__main__":
    while True:
        dir_input = input("Enter direction (1 = forward, 0 = backward): ")
        steps_input = input("Enter number of steps: ")
        aggression_input = input("Enter aggression level (1-5, 1 = slowest, 5 = fastest): ")

        if dir_input in ['0', '1'] and steps_input.isdigit() and aggression_input.isdigit():
            aggression = max(1, min(5, int(aggression_input)))  # Limit between 1-5
            send_command(dir_input, steps_input, aggression)
        else:
            print("Invalid input. Please enter correct values.")
