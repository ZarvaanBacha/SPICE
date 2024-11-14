import cv2
import numpy as np

# Define bounding box coordinates for ROI comparison
x1, y1 = 150, 130
x2, y2 = 515, 440

# Load reference image
reference_image = cv2.imread("ref-bg.jpg")

# Initial thresholds
initial_threshold = 45
initial_density_threshold = 40  # As percentage

# Unused callback for trackbars
def on_trackbar(val):
    pass

# Open webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open webcam.")
else:
    print("Press 'q' to quit.")
    cv2.namedWindow("Frame with ROI Highlighted")
    cv2.createTrackbar("Threshold", "Frame with ROI Highlighted", initial_threshold, 255, on_trackbar)
    cv2.createTrackbar("Density Threshold (%)", "Frame with ROI Highlighted", initial_density_threshold, 100, on_trackbar)

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Could not read frame.")
            break

        # Get trackbar values
        threshold = cv2.getTrackbarPos("Threshold", "Frame with ROI Highlighted")
        density_threshold = cv2.getTrackbarPos("Density Threshold (%)", "Frame with ROI Highlighted") / 100

        # Extract ROI and compute absolute differences for red and green channels
        roi = frame[y1:y2, x1:x2]
        diff_red = cv2.absdiff(roi[:, :, 2], reference_image[:, :, 2])
        diff_green = cv2.absdiff(roi[:, :, 1], reference_image[:, :, 1])

        # Create mask based on channel differences
        mask_red = diff_red >= threshold
        mask_green = diff_green >= threshold
        mask = np.logical_or(mask_red, mask_green).astype(np.uint8)

        # Noise reduction using morphological operations
        kernel = np.ones((3, 3), np.uint8)
        mask = cv2.erode(mask, kernel, iterations=1)
        mask = cv2.dilate(mask, kernel, iterations=2)

        # Highlight matching pixels in green
        overlay = roi.copy()
        overlay[mask == 1] = [0, 255, 0]
        frame[y1:y2, x1:x2] = overlay

        # Draw bounding box
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)

        # Calculate green pixel density for each row
        green_density = np.sum(mask, axis=1) / mask.shape[1]

        # Find top row where green density exceeds threshold
        top_y = None
        for i, density in enumerate(green_density):
            if density > density_threshold:
                top_y = y1 + i
                break

        # Display position percentage of the top edge if found
        if top_y is not None:
            percentage_position = (y2 - top_y) / (y2 - y1) * 100
            print(f"Spice level at: {percentage_position:.2f}%")
            cv2.line(frame, (x1, top_y), (x2, top_y), (255, 0, 0), 2)

        # Show the frame
        cv2.imshow("Frame with ROI Highlighted", frame)

        # Exit on 'q' key press
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

# Cleanup
cap.release()
cv2.destroyAllWindows()
