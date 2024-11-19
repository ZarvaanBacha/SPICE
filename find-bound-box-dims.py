import cv2

# Callback function for the trackbars (does nothing but is needed)
def nothing(x):
    pass

cap = cv2.VideoCapture(0)

cv2.namedWindow('Webcam Feed')

# Init trackbars for rectangle coords
cv2.createTrackbar('Top-Left X', 'Webcam Feed', 50, 640, nothing)
cv2.createTrackbar('Top-Left Y', 'Webcam Feed', 50, 480, nothing)
cv2.createTrackbar('Bottom-Right X', 'Webcam Feed', 200, 640, nothing)
cv2.createTrackbar('Bottom-Right Y', 'Webcam Feed', 200, 480, nothing)

while True:
    # Capture frame from webcam
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        break

    # Get rectangle coords from trackbars
    top_left_x = cv2.getTrackbarPos('Top-Left X', 'Webcam Feed')
    top_left_y = cv2.getTrackbarPos('Top-Left Y', 'Webcam Feed')
    bottom_right_x = cv2.getTrackbarPos('Bottom-Right X', 'Webcam Feed')
    bottom_right_y = cv2.getTrackbarPos('Bottom-Right Y', 'Webcam Feed')

    # Draw rectangle with red outline
    cv2.rectangle(frame, (top_left_x, top_left_y), (bottom_right_x, bottom_right_y), (0, 0, 255), 2)

    # Display frame
    cv2.imshow('Webcam Feed', frame)

    # Exit loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
