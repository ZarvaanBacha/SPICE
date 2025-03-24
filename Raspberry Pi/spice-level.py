import cv2
from spice_level_detection import get_spice_level, BoundBox

def main():
    # Open the webcam (default camera index 0)
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open the webcam.")
        return

    # Define the bounding box for the region of interest (adjust coordinates as needed)
    bbox = BoundBox(x1=82, y1=76, x2=437, y2=324)

    print("Press 'q' to exit.")

    while True:
        # Read a frame from the camera
        ret, frame = cap.read()
        if not ret:
            print("Error: Could not read a frame from the webcam.")
            break

        # Rotate the frame 90 degrees clockwise
        rotated_frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)

        # Calculate the spice level from the rotated frame
        try:
            spice_level = get_spice_level(rotated_frame, bbox, reference_image_path="ref-bg.jpg")
        except Exception as e:
            print("Error during spice level calculation:", e)
            break

        # Overlay the spice level text on the image
        cv2.putText(rotated_frame, f"Spice Level: {spice_level}%", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        # Display the rotated frame
        cv2.imshow("Rotated Frame", rotated_frame)

        # Wait for 1ms and check if the 'q' key is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("Exiting...")
            break

    # Release resources
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
