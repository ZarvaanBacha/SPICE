import cv2

# Define coordinates of the bounding box
x1, y1 = 150, 130  # Top-left corner
x2, y2 = 515, 440  # Bottom-right corner

# Open a connection to the webcam
cap = cv2.VideoCapture(0)

# Check if the webcam opened successfully
if not cap.isOpened():
    print("Error: Could not open webcam.")
else:
    # Capture a single frame
    ret, frame = cap.read()

    if ret:
        # Crop the image to the bounding box
        cropped_frame = frame[y1:y2, x1:x2]

        # Save the cropped image
        cv2.imwrite("ref-bg.jpg", cropped_frame)
        print("Image saved as 'ref-bg.jpg'")
    else:
        print("Error: Could not read frame.")

# Release the webcam and close any OpenCV windows
cap.release()
cv2.destroyAllWindows()
