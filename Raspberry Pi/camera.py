import cv2
import time
import threading

# Global variable to store the latest frame
latest_frame = None
capture_running = True

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

def get_latest_frame():
    return latest_frame

def rotate_frame(frame):
    # Rotate frame 90 degrees clockwise for consistency
    return cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)

def release_camera():
    global capture_running
    capture_running = False
    cap.release()
    print("Camera released.")
    
def start_capture_thread():
    thread = threading.Thread(target=camera_capture, daemon=True)
    thread.start()
