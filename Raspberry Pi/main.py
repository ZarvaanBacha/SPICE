import serial
import time

# Adjust the serial port and baud rate to match your Arduino configuration.
ser = serial.Serial('/dev/ttyUSB0', 115200, timeout=1)
time.sleep(2)  # Allow time for the serial connection to initialize

def send_command(direction, steps, aggression, acceleration):
    """
    Send the command string to the Arduino in the format:
    DIRECTION,STEPS,AGGRESSION,ACCELERATION\n
    """
    command = f"{direction},{steps},{aggression},{acceleration}\n"
    ser.write(command.encode())
    print(f"Sent: {command.strip()}")
    time.sleep(0.1)  # Short delay between commands

if __name__ == "__main__":
    print("Stepper Motor Control")
    print("Enter the following values:")
    print(" - Direction: 1 for forward, 0 for reverse")
    print(" - Steps: Total number of steps to move")
    print(" - Aggression: 1 (slow) to 5 (fast) for target speed")
    print(" - Acceleration: Value (e.g., 1-10) for ramp smoothness (lower = slower ramp)")

    while True:
        try:
            # Get user input for each parameter.
            direction = input("Enter direction (1 or 0): ").strip()
            steps = input("Enter number of steps: ").strip()
            aggression = input("Enter aggression level (1-5): ").strip()
            acceleration = input("Enter acceleration value (e.g., 1-10): ").strip()

            # Validate the inputs:
            if direction not in ['0', '1']:
                print("Invalid direction. Use 1 for forward or 0 for reverse.")
                continue

            if not (steps.isdigit() and aggression.isdigit() and acceleration.isdigit()):
                print("Steps, aggression, and acceleration must be numeric values.")
                continue

            # Convert to integer values
            direction = int(direction)
            steps = int(steps)
            aggression = int(aggression)
            acceleration = int(acceleration)

            # Optionally, limit aggression and acceleration to expected ranges.
            if not (1 <= aggression <= 5):
                print("Aggression must be between 1 and 5.")
                continue

            if not (acceleration >= 1):
                print("Acceleration must be at least 1.")
                continue

            # Send the full command to the Arduino.
            send_command(direction, steps, aggression, acceleration)

        except KeyboardInterrupt:
            print("\nExiting.")
            break
