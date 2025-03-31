#!/usr/bin/env python3
import time
import cv2
import sys
from spice_level_detection.spice_detection import get_spice_level
from spice_level_detection.bound_box import BoundBox
import camera  # Assumes your camera module provides get_latest_frame() and start_capture_thread()

def getCurrentSpiceQuantity():
    """
    Captures the current frame from the camera, rotates it 90° clockwise,
    and then uses the spice detection algorithm to measure and print the spice level.
    """
    # Retrieve the latest frame from the camera
    frame = camera.get_latest_frame()
    if frame is None:
        #print("No frame available for spice detection.")
        return

    # Rotate the image 90 degrees clockwise
    rotated_frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)

    # Create a BoundBox for the region of interest.
    bound_box = BoundBox(97, 94, 430, 326)
    
    # Get the spice level using the spice detection function.
    spice_level = get_spice_level(rotated_frame, bound_box)
    
    # Print the spice level.
    print("Current spice level:", spice_level)

if __name__ == "__main__":
    try:
        # Start the camera capture thread before attempting to capture a frame.
        camera.start_capture_thread()
        # Allow time for the camera to initialize and capture a frame.
        time.sleep(2)
        getCurrentSpiceQuantity()
    except Exception as e:
        print("Exception occurred:", e)
    finally:
        # Release the camera and exit gracefully.
        camera.release_camera()
        sys.exit(0)
