import time
import re
from functions import save_qr_data, printJSON  # load_qr_data not needed since we pass the JSON
from serial_comm import send_serial_command
from alignment import qr_alignment, centreContainer
import camera  # Handles camera opening/closing and frame processing

# Global variable for current plate position
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
        # Debug print disabled
        # print(f"Executed move command: {formatted_command}, New Plate Position: {PLATE_POSITION}")
    else:
        pass

def initialize(qr_data):
    """
    Initializes the system using the provided JSON data structure.
    
    Parameters:
      qr_data (dict): Expected to have keys corresponding to container IDs (QR codes) with 
                      "spiceQuantity" and "location" set to None.
    """
    global PLATE_POSITION

    # Start the camera capture thread inside initialize
    camera.start_capture_thread()
    # Allow time for the camera to initialize and start grabbing frames
    time.sleep(2)
    
    send_serial_command("slider: ccw, 150, 25")
    # print("Starting initialization, searching for QR lock")
    time.sleep(0.8)
    
    # Look for the QR code to start the centering process
    while True:
        frame = camera.get_latest_frame()
        if frame is None:
            # print("Waiting for a frame...")
            time.sleep(0.1)
            continue

        rotated_frame = camera.rotate_frame(frame)
        direction, distance, qr_id = qr_alignment.compute_alignment(rotated_frame)

        if direction == "no_qr_detected":
            # print("QR code not found. Trying to bring it into view...")
            send_serial_command("step(cw, 50, 0, 1)")
            time.sleep(1)
        else:
            # print("QR code detected. Starting centering process.")
            centreContainer()
            break

    # print("Centering complete. Beginning position scanning...")
    PLATE_POSITION = 1

    # Scan through physical positions 1 to 8
    for pos in range(1, 9):
        # Move from current plate position to the new position
        # print(f"Stepping to position {pos}...")
        handle_move_command(f"move({PLATE_POSITION}, {pos})")
        PLATE_POSITION = pos
        time.sleep(2)
        centreContainer()

        frame = camera.get_latest_frame()
        if frame is None:
            # print(f"Failed to capture frame at position {pos}.")
            continue

        rotated_frame = camera.rotate_frame(frame)
        direction, distance, qr_id = qr_alignment.compute_alignment(rotated_frame)

        if direction != "no_qr_detected":
            # Instead of using pos as the key, use the detected QR code (qr_id)
            key = str(qr_id)
            if key in qr_data:
                # Update the container with its physical location and an example spiceQuantity.
                qr_data[key]["location"] = pos
                qr_data[key]["spiceQuantity"] = int(qr_id)  # (Adjust this if needed)
            else:
                qr_data[key] = {"location": pos, "spiceQuantity": int(qr_id)}
            save_qr_data(qr_data, "filled_qr_data.json")

    # Debug prints disabled; only final JSON is printed.
    printJSON("filled_qr_data.json")
    
    # Release the camera after the process is complete
    camera.release_camera()

if __name__ == "__main__":
    # Example call: pass in a JSON structure with container IDs as keys
    # The keys here should correspond to expected QR code IDs (which might not match the physical scanning order).
    initial_qr_data = {
        "1": {"spiceQuantity": None, "location": None},
        "2": {"spiceQuantity": None, "location": None},
        "3": {"spiceQuantity": None, "location": None},
        "4": {"spiceQuantity": None, "location": None},
        "5": {"spiceQuantity": None, "location": None},
        "6": {"spiceQuantity": None, "location": None},
        "7": {"spiceQuantity": None, "location": None},
        "8": {"spiceQuantity": None, "location": None}
    }
    initialize(initial_qr_data)
