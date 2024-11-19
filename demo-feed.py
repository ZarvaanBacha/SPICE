import cv2
import numpy as np

# Define bounding box coordinates for ROI comparison
x1, y1 = 159, 191
x2, y2 = 395, 453

reference_image = cv2.imread("ref-bg.jpg")

# Initial thresholds
initial_threshold = 45
initial_density_threshold = 40  # As percentage

# Unused callback for trackbars
def on_trackbar(val):
    pass

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
            cv2.line(frame, (x1, top_y), (x2, top_y), (255, 0, 0), 2)

        # Create intermediate steps for debugging
        original_frame = frame.copy()
        intermediate_steps = np.zeros_like(frame)

        # 1. Original frame
        original_frame = frame.copy()

        # 2. Red/Green channel differences and binary mask
        diff_red = cv2.absdiff(roi[:, :, 2], reference_image[:, :, 2])
        diff_green = cv2.absdiff(roi[:, :, 1], reference_image[:, :, 1])
        mask_red = diff_red >= threshold
        mask_green = diff_green >= threshold
        mask = np.logical_or(mask_red, mask_green).astype(np.uint8)
        kernel = np.ones((3, 3), np.uint8)
        mask = cv2.erode(mask, kernel, iterations=1)
        mask = cv2.dilate(mask, kernel, iterations=2)

        # Ensure the mask size is the same as the ROI's
        mask_resized = np.zeros_like(roi, dtype=np.uint8)
        mask_resized[:, :, 0] = mask * 255  # Assuming mask is for one channel, make it visible as green
        intermediate_steps[y1:y2, x1:x2] = mask_resized  # Update intermediate steps

        # 3. Green overlay
        overlay = roi.copy()
        overlay[mask == 1] = [0, 255, 0]
        frame[y1:y2, x1:x2] = overlay

        # 4. Final output with line and spice level
        final_frame = original_frame.copy()
        if top_y is not None:
            cv2.line(final_frame, (x1, top_y), (x2, top_y), (255, 0, 0), 2)

        # Resize intermediate_steps to match the original frame's height
        intermediate_steps_resized = cv2.resize(intermediate_steps, (original_frame.shape[1], original_frame.shape[0]))

        # Convert intermediate_steps to BGR if necessary
        if len(intermediate_steps_resized.shape) == 2 or intermediate_steps_resized.shape[2] == 1:
            intermediate_steps_resized = cv2.cvtColor(intermediate_steps_resized, cv2.COLOR_GRAY2BGR)

        # Concatenate horizontally
        top_row = cv2.hconcat([original_frame, intermediate_steps_resized])
        bottom_row = cv2.hconcat([final_frame, frame])

        # Stack the top and bottom rows vertically
        final_output = cv2.vconcat([top_row, bottom_row])

        # Show the final output
        cv2.imshow("Frame with ROI Highlighted", final_output)

        # Exit on 'q' key press
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

# Cleanup
cap.release()
cv2.destroyAllWindows()
