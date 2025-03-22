import cv2

# Global variables for storing the start and end points of the rectangle
start_point = None
end_point = None
drawing = False

# Mouse callback function to capture the start and end points of the rectangle
def draw_rectangle(event, x, y, flags, param):
    global start_point, end_point, drawing
    
    if event == cv2.EVENT_LBUTTONDOWN:
        # When left mouse button is pressed, record the starting point
        start_point = (x, y)
        drawing = True

    elif event == cv2.EVENT_MOUSEMOVE:
        # While moving the mouse, update the end point if the drawing is in progress
        if drawing:
            end_point = (x, y)
    
    elif event == cv2.EVENT_LBUTTONUP:
        # On releasing the left mouse button, finalize the rectangle
        end_point = (x, y)
        drawing = False
        print(f"Rectangle coordinates: Start Point: {start_point}, End Point: {end_point}")

# Initialize the webcam capture
cap = cv2.VideoCapture(0)

# Create a window to display the video feed
cv2.namedWindow('Frame')
cv2.setMouseCallback('Frame', draw_rectangle)

while True:
    # Capture each frame from the webcam
    ret, frame = cap.read()
    if ret:
        frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)

    
    # If a rectangle is being drawn, draw it on the frame
    if start_point and end_point:
        cv2.rectangle(frame, start_point, end_point, (0, 255, 0), 2)
    
    # Display the current frame
    cv2.imshow('Frame', frame)

    # Wait for the 'q' key to be pressed to exit the loop
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the capture and close the window
cap.release()
cv2.destroyAllWindows()
