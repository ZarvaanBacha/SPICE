from qr_alignment import QRAlignment
from functions import index, load_qr_data, save_qr_data, printJSON, parse_dispense_list
import cv2
import time
import serial
import threading
import re

# Set the correct serial port and baud rate
SERIAL_PORT = "/dev/ttyUSB0"
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

# Load empty JSON data
qr_data = load_qr_data("empty_qr_data.json")

# Live feed toggle
show_live_feed = False

# Global plate position variable
PLATE_POSITION = 1

# Global variable to store the latest camera frame
latest_frame = None

# Global flag to control the camera capturing thread
capture_running = True

# Global camera object (shared between live feed and centering)
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Error: Could not open camera.")
    exit()

def camera_capture():
    global latest_frame, capture_running
    while capture_running:
        ret, frame = cap.read()
        if ret:
            latest_frame = frame
        else:
            print("Warning: Failed to capture frame.")
            time.sleep(0.1)

def calculate_steps(distance, pixels_per_step=10, min_steps=10, max_steps=80):
    steps = int(round(distance / pixels_per_step))
    steps = max(min(steps, max_steps), min_steps)
    return steps

def send_serial_command(command):
    if ser:
        try:
            ser.write(f"{command}\n".encode())
            print(f"Sent command: {command}")
        except Exception as e:
            print(f"Error sending serial command: {e}")
    else:
        print("Serial port not initialized.")

def handle_move_command(command):
    global PLATE_POSITION
    move_match = re.match(r"move\((\d+),\s*(\d+)\)", command)
    if move_match:
        int1 = int(move_match.group(1))
        int2 = int(move_match.group(2))
        PLATE_POSITION = int2
        formatted_command = f"move({int1}, {int2})"
        send_serial_command(formatted_command)
        print(f"Executed move command: {formatted_command}, New Plate Position: {PLATE_POSITION}")
    else:
        print("Invalid move command format. Use 'move(int, int)'.")

def get_current_position():
    global PLATE_POSITION
    print(f"Current plate position: {PLATE_POSITION}")
    return PLATE_POSITION

def live_feed():
    print("Live feed started.")
    cv2.namedWindow("Live Feed (Rotated)", cv2.WND_PROP_FULLSCREEN)
    cv2.setWindowProperty("Live Feed (Rotated)", cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
    while show_live_feed:
        if latest_frame is not None:
            rotated_frame = cv2.rotate(latest_frame, cv2.ROTATE_90_CLOCKWISE)
            cv2.imshow("Live Feed (Rotated)", rotated_frame)
            if cv2.waitKey(1) & 0xFF == 27:
                print("Live feed interrupted by user.")
                break
    print("Live feed stopped.")
    cv2.destroyAllWindows()

def centreContainer():
    print("Starting centering process...")
    while True:
        if latest_frame is None:
            print("Waiting for a frame...")
            time.sleep(0.1)
            continue

        rotated_frame = cv2.rotate(latest_frame, cv2.ROTATE_90_CLOCKWISE)
        direction, distance, qr_id = qr_alignment.compute_alignment(rotated_frame)
        print(f"Direction: {direction}, Distance: {distance} pixels, QR ID: {qr_id}")

        steps = calculate_steps(distance)
        print(f"Calculated Steps: {steps}")

        if direction == "move_left":
            send_serial_command(f"step(cw, {steps}, 0, 1)")
        elif direction == "move_right":
            send_serial_command(f"step(ccw, {steps}, 0, 1)")
        elif direction == "centered":
            print("Container is centered!")
            break

        time.sleep(0.5)

def initialize():
    global PLATE_POSITION
    print("Starting initialization, searching for QR lock")
    while True:
        if latest_frame is None:
            print("Waiting for a frame...")
            time.sleep(0.1)
            continue

        rotated_frame = cv2.rotate(latest_frame, cv2.ROTATE_90_CLOCKWISE)
        direction, distance, qr_id = qr_alignment.compute_alignment(rotated_frame)

        if direction == "no_qr_detected":
            print("QR code not found. Trying to bring it into view...")
            send_serial_command("step(cw, 50, 0, 1)")
            time.sleep(1)
        else:
            print("QR code detected. Starting centering process.")
            centreContainer()
            break

    print("Centering complete. Beginning position scanning...")
    PLATE_POSITION = 1

    for pos in range(1, 9):
        print(f"Stepping to position {pos}...")
        handle_move_command(f"move({PLATE_POSITION}, {pos})")
        PLATE_POSITION = pos
        time.sleep(2)
        centreContainer()

        if latest_frame is None:
            print(f"Failed to capture frame at position {pos}.")
            continue

        rotated_frame = cv2.rotate(latest_frame, cv2.ROTATE_90_CLOCKWISE)
        direction, distance, qr_id = qr_alignment.compute_alignment(rotated_frame)

        if direction != "no_qr_detected":
            print(f"QR code detected at position {pos} with ID {qr_id}. Recording data...")
            index(qr_data, int(qr_id), pos)
            save_qr_data(qr_data, "filled_qr_data.json")

    print("Position scanning complete.")
    print("Final JSON data:")
    printJSON("filled_qr_data.json")

def dispense():
    global PLATE_POSITION
    print("Starting dispensing process...")

    for qr_id, data in qr_data.items():
        target_position = data.get("location")
        quantity = data.get("spiceQuantityInEighthTsp", 0)

        if target_position and quantity > 0:
            print(f"Moving to position {target_position} to dispense from QR code {qr_id}.")

            if target_position != PLATE_POSITION:
                handle_move_command(f"move({PLATE_POSITION}, {target_position})")
                PLATE_POSITION = target_position
                time.sleep(1)

            print(f"Dispensing from position {target_position}. Quantity: {quantity} eighth teaspoons")
            send_serial_command(f"dispense({target_position}, {quantity})")
            time.sleep(1)

    print("Dispensing process complete.")

print("QR Alignment Program Ready.")
print("Commands:")
print("  center       - Start centering process")
print("  initialize   - Run initialization (search for QR, then align)")
print("  dispense     - Dispense from selected containers")
print("  live_on      - Enable continuous live feed")
print("  live_off     - Disable continuous live feed")
print("  position     - Get the current plate position")
print("  move(x, y)   - Send move command with two integers")
print("  360          - Send a '360' command")
print("  exit         - Quit the program")

# Start camera capturing in a separate thread
capture_thread = threading.Thread(target=camera_capture, daemon=True)
capture_thread.start()

while True:
    command = input("Enter command: ").strip().lower()

    if command == "position":
        get_current_position()
    elif command.startswith("move("):
        handle_move_command(command)
    elif command == "center":
        centreContainer()
    elif command == "initialize":
        initialize()
    elif command == "dispense":
        dispense()
    elif command == "360":
        send_serial_command("360")
    elif command == "live_on":
        show_live_feed = True
        threading.Thread(target=live_feed, daemon=True).start()
    elif command == "live_off":
        show_live_feed = False
    elif command == "exit":
        capture_running = False
        break
    else:
        print("Invalid command.")

cap.release()
print("Camera released.")

if ser:
    ser.close()
    print("Serial port closed.")
