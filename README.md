# SPICE Hardware Functionality

This document provides an overview of the main functions used in the SPICE system. For each file, the function name is listed along with its goal, inputs, and outputs.

---

## Files and Functions

### 1. `initialize.py`

- **Function:** `initialize(qr_data)`
  - **Goal:**  
    Initialize the system by aligning containers through QR code scanning.
  - **Inputs:**  
    - `qr_data` (dict): A JSON data structure where keys correspond to container IDs (QR codes) and each value contains keys `"spiceQuantity"` and `"location"` set to `None`.
  - **Outputs:**  
    - Saves updated container data to `"filled_qr_data.json"`.
    - Prints the final JSON data to the console.

---

### 2. `dispense.py`

- **Function:** `dispense(dispense_data, starting_position=1)`
  - **Goal:**  
    Dispense spice from selected containers based on instructions and update the JSON with measured spice levels.
  - **Inputs:**  
    - `dispense_data` (dict): A JSON data structure with container instructions. Each key corresponds to a container and its value includes:
      - `"spiceQuantityInEighthTsp"`: Number of dispensing increments.
      - `"location"`: The physical container position.
      - `"spiceQuantity"`: (Initial placeholder value, to be updated with measured spice level.)
    - `starting_position` (int, optional): The starting plate position. Defaults to `1`.
  - **Outputs:**  
    - Updates the JSON data with the measured spice level in the `"spiceQuantity"` field.
    - Prints the updated JSON data to the console.

---

### 3. `getCurrentSpiceQuantity.py`

- **Function:** `getCurrentSpiceQuantity()`
  - **Goal:**  
    Capture the current camera frame, rotate it 90° clockwise, and compute the spice level using the spice detection algorithm.
  - **Inputs:**  
    - No direct inputs; relies on the camera module to capture a frame.
  - **Outputs:**  
    - Prints the current spice level to the console.

---

### 4. `moveToRefill.py`

- **Function:** `moveToRefill(starting_position, destination)`
  - **Goal:**  
    Move the refill container from a given starting position to a specified destination.
  - **Inputs:**  
    - `starting_position` (int): The current position of the container.
    - `destination` (int): The target container position.
  - **Outputs:**  
    - Sends the move command via the serial communication module.
    - (No printed output by default, unless debugging is enabled.)

---

## How to Run

- **Initialize Program:**  
  Run the following command to start the initialization process:
  ```bash
  python initialize.py
