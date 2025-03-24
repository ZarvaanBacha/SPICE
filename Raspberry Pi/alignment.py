import time
import cv2
from qr_alignment import QRAlignment
from functions import index, load_qr_data, save_qr_data, printJSON
from serial_comm import send_serial_command
from camera import get_latest_frame, rotate_frame

# Initialize QRAlignment instance with tolerance value
qr_alignment = QRAlignment(tolerance=20)

def calculate_steps(distance, pixels_per_step=10, min_steps=10, max_steps=80):
    steps = int(round(distance / pixels_per_step))
    steps = max(min(steps, max_steps), min_steps)
    return steps

def centreContainer():
    # print("Starting centering process...")
    while True:
        frame = get_latest_frame()
        if frame is None:
            #print("Waiting for a frame...")
            time.sleep(0.1)
            continue

        rotated_frame = rotate_frame(frame)
        direction, distance, qr_id = qr_alignment.compute_alignment(rotated_frame)
        #print(f"Direction: {direction}, Distance: {distance} pixels, QR ID: {qr_id}")

        steps = calculate_steps(distance)
        #print(f"Calculated Steps: {steps}")

        if direction == "move_left":
            send_serial_command(f"step(cw, {steps}, 0, 1)")
        elif direction == "move_right":
            send_serial_command(f"step(ccw, {steps}, 0, 1)")
        elif direction == "centered":
            #print("Container is centered!")
            break

        time.sleep(0.5)
