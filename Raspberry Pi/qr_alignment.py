import cv2
import numpy as np
from pyzbar.pyzbar import decode, ZBarSymbol

class QRAlignment:
    def __init__(self, start_point=(115, 320), end_point=(328, 581), tolerance=30):
        self.start_point = start_point
        self.end_point = end_point
        self.tolerance = tolerance

    def detect_qr_code(self, frame):
        """
        Detect a QR code using pyzbar.
        :param frame: Input frame from a camera or image file.
        :return: List of bounding boxes [(x, y, w, h, qr_id), ...] or an empty list if none found.
        """
        decoded_objects = decode(frame, symbols=[ZBarSymbol.QRCODE])
        bboxes = []
        for obj in decoded_objects:
            x, y, w, h = obj.rect
            qr_id = obj.data.decode("utf-8")  # Get the QR code data (assuming it's a string)
            #print(f"Detected QR code ID: {qr_id} at ({x}, {y}, {w}, {h})")
            bboxes.append((x, y, w, h, qr_id))
        return bboxes

    def center_of_bbox(self, bbox):
        x, y, w, h = bbox
        cX = x + w // 2
        cY = y + h // 2
        return (cX, cY)

    def decide_movement(self, qr_center_x):
        start_x, _ = self.start_point
        end_x, _ = self.end_point
        center_x = (start_x + end_x) // 2
        distance = qr_center_x - center_x
        tolerance_left = center_x - self.tolerance
        tolerance_right = center_x + self.tolerance

        if tolerance_left <= qr_center_x <= tolerance_right:
            return "centered", 0
        elif qr_center_x < tolerance_left:
            return "move_right", abs(distance)
        else:
            return "move_left", abs(distance)

    def compute_alignment(self, frame):
        """
        Compute the alignment direction based on the input frame.
        :param frame: Input frame from a camera or image file.
        :return: (Alignment direction, distance from center, qr_id).
        """
        qr_bboxes = self.detect_qr_code(frame)
        if qr_bboxes:
            x, y, w, h, qr_id = qr_bboxes[0]  # Unpack the QR code ID from the tuple
            #print(f"Detected QR code ID: {qr_id} at coordinates ({x}, {y})")
            cX, cY = self.center_of_bbox((x, y, w, h))
            direction, distance = self.decide_movement(cX)
            return direction, distance, qr_id

        #print("No QR code detected.")
        return "no_qr_detected", 0, None


