#!/usr/bin/env python3
import time
import re
import json
import sys
from serial_comm import send_serial_command
import camera
from alignment import centreContainer
from spice_level_detection.spice_detection import get_spice_level
from spice_level_detection.bound_box import BoundBox

# Global plate position variable
PLATE_POSITION = 1

def handle_move_command(command):
    global PLATE_POSITION
    move_match = re.match(r"move\((\d+),\s*(\d+)\)", command)
    if move_match:
        int1 = int(move_match.group(1))
        int2 = int(move_match.group(2))
        PLATE_POSITION = int2
        formatted_command = f"move({int1}, {int2})"
        send_serial_command(formatted_command)
    else:
        pass

def dispenseRoutine(count):
    # send_serial_command(f"lock")  # Lock Plate
    time.sleep(1)
    send_serial_command(f"slider: cw, 90, 70")  # Bring Slider into position
    for x in range(count):
        time.sleep(0.8)
        send_serial_command(f"dispenser: ccw, 150, 15")  # Dispense one increment
        time.sleep(2)
    time.sleep(1)
    send_serial_command(f"stop")  # Release plate
    time.sleep(1)
    send_serial_command(f"slider: ccw, 90, 70")  # Bring Slider back to rest

def dispense(dispense_data, starting_position=1):
    """
    Dispenses spice based on the provided JSON data and updates the spice level after dispensing.
    
    Parameters:
      dispense_data (dict): Expected to have keys corresponding to container numbers.
         Example:
         {
             "2": {
                 "spiceQuantityInEighthTsp": 4,
                 "location": 2,
                 "spiceQuantity": 2
             },
             "3": {
                 "spiceQuantityInEighthTsp": 4,
                 "location": 3,
                 "spiceQuantity": 2
             }
         }
      starting_position (int): The starting position of the plate.
    """
    global PLATE_POSITION
    PLATE_POSITION = starting_position

    # Start the camera capture thread
    camera.start_capture_thread()
    # Allow time for the camera to initialize
    time.sleep(2)

    # Process each container entry in the JSON input
    for container_id, data in dispense_data.items():
        target_position = data.get("location")
        quantity = data.get("spiceQuantityInEighthTsp", 0)
        if target_position and quantity > 0:
            # Move to the target container if needed and center it
            if target_position != PLATE_POSITION:
                handle_move_command(f"move({PLATE_POSITION}, {target_position})")
                PLATE_POSITION = target_position
                time.sleep(1.8)
                centreContainer()
            # Dispense the required number of increments
            dispenseRoutine(int(quantity))
            time.sleep(1)
            
            # Hard-coded bound box dimensions (x1, y1, x2, y2)
            bound_box = BoundBox(97, 94, 430, 326)
            # Capture a frame from the camera for spice detection
            frame = camera.get_latest_frame()
            if frame is None:
                measured_level = 0
            else:
                try:
                    measured_level = get_spice_level(frame, bound_box)
                except Exception:
                    measured_level = 0
            # Update the JSON with the measured spice level
            data["spiceQuantity"] = measured_level
            
    send_serial_command("slider: ccw, 25, 25")  # Return slider to rest

    # Release the camera after dispensing is complete
    camera.release_camera()
    
    # Print the final JSON data (the only output)
    print(json.dumps(dispense_data, indent=4))

if __name__ == "__main__":
    # Expect the first argument to be the JSON file for instructions
    # and the second argument (optional) as the starting position.
    if len(sys.argv) < 2:
        #print("Usage: python dispense.py <instructions_file.json> [starting_position]")
        sys.exit(1)
    
    try:
        file_path = sys.argv[1]
        with open(file_path, 'r') as f:
            dispense_data = json.load(f)
    except Exception as e:
        #print("Error loading JSON file:", e)
        sys.exit(1)
    
    if len(sys.argv) > 2:
        try:
            starting_position = int(sys.argv[2])
        except Exception:
            starting_position = 1
    else:
        starting_position = 1

    dispense(dispense_data, starting_position)
