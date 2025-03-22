from qr_alignment import QRAlignment
import cv2
import time
import serial
import threading
import re

# Set the correct serial port and baud rate
SERIAL_PORT = "/dev/ttyUSB0"  # Change if needed (e.g., /dev/ttyACM0)
BAUD_RATE = 115200

try:
    # Initialize serial communication
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE)
    print(f"Serial port {SERIAL_PORT} opened successfully.")
except Exception as e:
    print(f"Error opening serial port {SERIAL_PORT}: {e}")
    ser = None

# Initialize the QR alignment class with a tolerance value
qr_alignment = QRAlignment(tolerance=20)

# Live feed toggle
show_live_feed = False

# Global camera object (shared between live feed and centering)
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Error: Could not open camera.")
    exit()

def calculate_steps(distance, pixels_per_step=5, max_steps=80):
    """
    Calculate the number of motor steps based on the distance from center.
    :param distance: Distance from center in pixels.
    :param pixels_per_step: How many pixels correspond to one motor step.
    :param max_steps: Maximum number of motor steps to take in one move.
    :return: Number of steps to move.
    """
    steps = int(round(distance / pixels_per_step))
    steps = min(max(steps, 1), max_steps)  # Clamp the steps
    return steps

def send_serial_command(command):
    """
    Send a serial command to the motor.
    :param command: The command string to send.
    """
    if ser:
        try:
            ser.write(f"{command}\n".encode())
            print(f"Sent command: {command}")
        except Exception as e:
            print(f"Error sending serial command: {e}")
    else:
        print("Serial port not initialized.")

def handle_move_command(command):
    """
    Handles the move command of the format 'move(int, int)'.
    :param command: The input command string.
    """
    move_match = re.match(r"move\((\d+),\s*(\d+)\)", command)
    if move_match:
        int1 = move_match.group(1)
        int2 = move_match.group(2)
        formatted_command = f"move({int1}, {int2})"
        send_serial_command(formatted_command)
        print(f"Executed move command: {formatted_command}")
    else:
        print("Invalid move command format. Use 'move(int, int)'.")

def live_feed():
    """
    Continuously show the live feed if enabled, in fullscreen mode.
    """
    print("Live feed started.")

    # Create a fullscreen window
    cv2.namedWindow("Live Feed (Rotated)", cv2.WND_PROP_FULLSCREEN)
    cv2.setWindowProperty("Live Feed (Rotated)", cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)

    while show_live_feed:
        ret, frame = cap.read()
        if not ret:
            print("Failed to capture frame.")
            continue

        # Rotate the frame 90 degrees clockwise for live feed display
        rotated_frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)

        # Display the rotated live feed
        cv2.imshow("Live Feed (Rotated)", rotated_frame)

        # Check for user interrupt (ESC key)
        if cv2.waitKey(1) & 0xFF == 27:
            print("Live feed interrupted by user.")
            break

    print("Live feed stopped.")
    cv2.destroyAllWindows()


def centreContainer():
    """
    Continuously check the alignment and move the container until centered.
    """
    print("Starting centering process...")
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to capture frame.")
            break

        # Rotate the frame 90 degrees clockwise for alignment calculation
        rotated_frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)

        # Get alignment direction and distance from the QR alignment object
        direction, distance = qr_alignment.compute_alignment(rotated_frame)
        print(f"Direction: {direction}, Distance: {distance} pixels")

        # Calculate the number of steps to move
        steps = calculate_steps(distance)
        print(f"Calculated Steps: {steps}")

        # Send the appropriate command if not centered
        if direction == "move_left":
            send_serial_command(f"step(cw, {steps}, 0, 1)")
        elif direction == "move_right":
            send_serial_command(f"step(ccw, {steps}, 0, 1)")
        elif direction == "centered":
            print("Container is centered!")
            break

        # Wait 2 seconds to allow for physical movement before the next check
        time.sleep(2)


print("QR Alignment Program Ready.")
print("Commands:")
print("  center       - Start centering process")
print("  live_on      - Enable continuous live feed")
print("  live_off     - Disable continuous live feed")
print("  move(x, y)   - Send move command with two integers")
print("  exit         - Quit the program")

while True:
    command = input("Enter command: ").strip().lower()

    # Handle the move(int, int) command
    if command.startswith("move("):
        handle_move_command(command)

    elif command == "center":
        centreContainer()
    
    elif command == "360":
        send_serial_command("360")
    
    elif command == "live_on":
        if not show_live_feed:
            show_live_feed = True
            threading.Thread(target=live_feed, daemon=True).start()
        else:
            print("Live feed is already running.")
    elif command == "live_off":
        show_live_feed = False
    elif command == "exit":
        show_live_feed = False
        print("Exiting program...")
        break
    else:
        print("Invalid command. Type 'center', 'live_on', 'live_off', 'move(x, y)', or 'exit'.")

cap.release()
print("Camera released.")

if ser:
    ser.close()
    print("Serial port closed.")
