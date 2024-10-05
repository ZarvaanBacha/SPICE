import cv2
import numpy as np

# Open the webcam
cap = cv2.VideoCapture(0)

# Define the bounding box coordinates
x1, y1 = 280, 180  # Top-left corner
x2, y2 = 410, 420  # Bottom-right corner

bounding_box_setup = True
draw_avg_line = False

# Check if the webcam opened successfully
if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

while True:
    # Capture frame-by-frame
    ret, frame = cap.read()
    
    if not ret:
        print("Error: Can't receive frame (stream end?). Exiting ...")
        break

    # Crop the frame to the bounding box
    cropped_frame = frame[y1:y2, x1:x2]

    # Convert the cropped frame to grayscale
    gray_frame = cv2.cvtColor(cropped_frame, cv2.COLOR_BGR2GRAY)

    # Apply Gaussian blur to reduce noise
    blurred_frame = cv2.GaussianBlur(gray_frame, (5, 5), 0)

    # Use adaptive thresholding to create a binary image
    binary_image = cv2.adaptiveThreshold(blurred_frame, 255,
                                          cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                          cv2.THRESH_BINARY_INV, 11, 2)

    # Find contours in the binary image
    contours, _ = cv2.findContours(binary_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    total_length = 0
    total_x = 0
    total_y = 0
    count = 0

    for contour in contours:
        # Calculate the length of the contour
        length = cv2.arcLength(contour, True)

        # Assuming a line if length is greater than a certain threshold
        if length > 90:
            # Draw the contour on the original frame
            cv2.drawContours(frame, [contour + np.array([x1, y1])], -1, (0, 255, 0), 2)

            # Update total lengths and positions for averaging
            total_length += length
            M = cv2.moments(contour)
            if M["m00"] != 0:
                cX = int(M["m10"] / M["m00"]) + x1
                cY = int(M["m01"] / M["m00"]) + y1
                total_x += cX
                total_y += cY
                count += 1
    
    if count > 0:
        # Calculate average position and average length
        avg_x = total_x // count
        avg_y = total_y // count
        avg_length = total_length / count

        if (draw_avg_line):
            cv2.line(frame, (x1, avg_y),
                 (x2, avg_y),
                 (0, 0, 255), 2)  # Red color, thickness 2
        
        # Display spice level as a % (based on bounding box)
        spice_level = (y2 - avg_y) * 100 / (y2 - y1)
        cv2.putText(frame, f"{spice_level:.2f} %", 
            (avg_x - 50, avg_y - 10), 
            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)

        # Draw blue bounding box on the original frame
    if (bounding_box_setup):
        cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)  # Blue color, thickness 2

    # Show the output frame with contours and the average line
    cv2.imshow('Webcam Feed with Contours', frame)

    # Press 'q' to exit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the webcam and close all windows
cap.release()
cv2.destroyAllWindows()
