import cv2
import serial
import time
import os
from spice_level_detection import read_qr_code, BoundBox

# Initialize webcam and Arduino
cap = cv2.VideoCapture(1)
arduino_port = "/dev/cu.usbserial-14630"
baud_rate = 115200
map_file = "spice_map.txt"  # File to store spice positions

# Connect to Arduino
try:
    arduino = serial.Serial(arduino_port, baud_rate, timeout=1)
    time.sleep(2)  # Wait for connection
    print(f"Connected to Arduino on {arduino_port}")
except serial.SerialException as e:
    print(f"Failed to connect: {e}")
    exit()

# Define spice positions
spices = ["spice1", "spice2", "spice3", "spice4", "spice5", "spice6", "spice7", "spice8"]
indexed_spices = [None] * 8  # Stores spices based on QR indexing
current_position = 0  # Tracks current spice position, initially assumed to be position 0
bound_box = BoundBox(516, 212, 1118, 944)  # QR scan area

# Load existing spice map if available
def loadSpiceMap():
    global indexed_spices, current_position
    if os.path.exists(map_file):
        with open(map_file, "r") as file:
            lines = file.readlines()
            indexed_spices = [line.strip() for line in lines[:8]]  # Load spice positions
            current_position = int(lines[8].strip())  # Load last known position
            print("Loaded saved spice map:", indexed_spices)
    else:
        print("No existing spice map found. Starting fresh.")

# Save spice map to file
def saveSpiceMap():
    with open(map_file, "w") as file:
        for spice in indexed_spices:
            file.write(f"{spice}\n")
        file.write(f"{current_position}\n")
    print("Spice map saved successfully.")

loadSpiceMap()

def moveSpiceRack(start, end):
    """Move the spice rack from the current position to the next."""
    command = f"{start+1},{end+1}\n"  # Convert 0-based index to 1-based for Arduino
    print(f"Moving spice rack: {command.strip()}")
    arduino.write(command.encode())  # Send movement command to Arduino
    time.sleep(1)  # Wait for movement to complete
    saveSpiceMap()  # Save updated position
    return end  # Ensure current_position gets updated correctly

def indexBoxes():
    """Scan and store spices in order while moving the rack."""
    global indexed_spices, current_position
    print("Indexing spices...")

    for i in range(8):
        qr_data = None
        while not qr_data:
            qr_data = read_qr_code(cap)  # Scan QR code
            if qr_data:
                print(f"Detected QR Code: {qr_data}")
        
        try:
            spice_index = int(qr_data) - 1
            if 0 <= spice_index < len(spices):
                indexed_spices[i] = spices[spice_index]  # Ensure correct mapping to physical position
                print(f"Indexed {spices[spice_index]} at position {i}")
            else:
                print(f"Invalid QR code detected: {qr_data}")
                continue
        except ValueError:
            print(f"Non-numeric QR code detected: {qr_data}")
            continue

        if i < 7:
            current_position = moveSpiceRack(current_position, (current_position + 1) % 8)  # Update current position

    saveSpiceMap()  # Save the new map after indexing
    print("Indexing complete:", indexed_spices)
    return indexed_spices

def moveTo(spiceName):
    """Move to the spice using its indexed QR position."""
    global current_position

    if spiceName not in spices:
        print("Error: Spice name not recognized.")
        return

    actual_position = indexed_spices.index(spiceName) if spiceName in indexed_spices else None

    if actual_position is None:
        print("Error: Spice not found in indexed list.")
        return

    if current_position == actual_position:
        print(f"Already at {spiceName}")
        return

    current_position = moveSpiceRack(current_position, actual_position)  # Update current position
    print(f"Arrived at {spiceName}")

# Main loop for user input
while True:
    command = input("Enter command (indexBoxes/moveTo <spice>): ").strip()
    if command == "indexBoxes":
        indexBoxes()
    elif command.startswith("moveTo"):
        _, spice = command.split()
        moveTo(spice)
    elif command == "exit":
        break
    else:
        print("Invalid command.")

# Cleanup
cap.release()
arduino.close()
cv2.destroyAllWindows()





''' bound-box.py

import cv2
import numpy as np

# Callback function for trackbars (needed but does nothing)
def nothing(x):
    pass

# Open webcam (use 0 for built-in, 1 for external)
cap = cv2.VideoCapture(1)

# Set camera resolution to 1080p
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

if not cap.isOpened():
    print("Error: Could not open camera.")
    exit()

# Create a window
cv2.namedWindow('Webcam Feed', cv2.WINDOW_NORMAL)

# Initialize trackbars with 1080p range
cv2.createTrackbar('Top-Left X', 'Webcam Feed', 100, 1920, nothing)
cv2.createTrackbar('Top-Left Y', 'Webcam Feed', 100, 1080, nothing)
cv2.createTrackbar('Bottom-Right X', 'Webcam Feed', 500, 1920, nothing)
cv2.createTrackbar('Bottom-Right Y', 'Webcam Feed', 400, 1080, nothing)

# Button parameters
button_x, button_y, button_w, button_h = 20, 20, 150, 50  # Button position and size

def click_event(event, x, y, flags, param):
    """Mouse click event to detect button click."""
    if event == cv2.EVENT_LBUTTONDOWN:
        if button_x <= x <= button_x + button_w and button_y <= y <= button_y + button_h:
            # Get rectangle coordinates
            top_left_x = cv2.getTrackbarPos('Top-Left X', 'Webcam Feed')
            top_left_y = cv2.getTrackbarPos('Top-Left Y', 'Webcam Feed')
            bottom_right_x = cv2.getTrackbarPos('Bottom-Right X', 'Webcam Feed')
            bottom_right_y = cv2.getTrackbarPos('Bottom-Right Y', 'Webcam Feed')

            # Print coordinates in the shell
            print(f"Rectangle Coordinates: Top-Left ({top_left_x}, {top_left_y}), "
                  f"Bottom-Right ({bottom_right_x}, {bottom_right_y})")

# Set mouse callback
cv2.setMouseCallback('Webcam Feed', click_event)

while True:
    # Capture frame from webcam
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        break

    # Get rectangle coordinates from trackbars
    top_left_x = cv2.getTrackbarPos('Top-Left X', 'Webcam Feed')
    top_left_y = cv2.getTrackbarPos('Top-Left Y', 'Webcam Feed')
    bottom_right_x = cv2.getTrackbarPos('Bottom-Right X', 'Webcam Feed')
    bottom_right_y = cv2.getTrackbarPos('Bottom-Right Y', 'Webcam Feed')

    # Draw rectangle with red outline
    cv2.rectangle(frame, (top_left_x, top_left_y), (bottom_right_x, bottom_right_y), (0, 0, 255), 2)

    # Draw "Set" button
    cv2.rectangle(frame, (button_x, button_y), (button_x + button_w, button_y + button_h), (0, 255, 0), -1)
    cv2.putText(frame, "SET", (button_x + 40, button_y + 35), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

    # Display frame
    cv2.imshow('Webcam Feed', frame)

    # Exit loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release resources
cap.release()
cv2.destroyAllWindows()

'''


'''changes to qr_code.py

import cv2

def read_qr_code(cap):
    """Read a QR code from the camera feed and return its decoded data."""
    
    detector = cv2.QRCodeDetector()

    # Ensure camera is opened
    if not cap.isOpened():
        raise RuntimeError("Error: Could not open webcam.")

    ret, frame = cap.read()
    if not ret:
        raise RuntimeError("Error: Could not read frame.")

    # Convert to grayscale (improves QR detection)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Slight blur (reduces noise, making QR clearer)
    gray = cv2.GaussianBlur(gray, (3, 3), 0)

    # Detect and decode QR code
    data, vertices_array, _ = detector.detectAndDecode(gray)

    # Return detected data if found
    if vertices_array is not None and data:
        return data  

    return None  # Return None if no QR code is detected
    
    '''

''' 
pip install --index-url https://test.pypi.org/simple/ --no-deps --upgrade --no-cache-dir spice_level_detection==<0.1.3>
'''