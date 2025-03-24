import json

def index(qr_json, detected_qr_id, current_position):
    """
    Update the JSON file with location and spice quantity for the detected QR code.
    :param qr_json: The input JSON object with empty fields.
    :param detected_qr_id: The ID of the detected QR code.
    :param current_position: The current position of the plate.
    :return: The updated JSON object.
    """
    spice_quantity = 100  # Placeholder value

    print(f"Indexing QR code with ID: {detected_qr_id} at position {current_position}")

    detected_qr_id_str = str(detected_qr_id)

    if detected_qr_id_str not in qr_json:
        print(f"Warning: QR code ID {detected_qr_id} not found in JSON. Skipping.")
        return qr_json

    qr_json[detected_qr_id_str]["location"] = current_position
    qr_json[detected_qr_id_str]["spiceQuantity"] = spice_quantity

    print(f"Recorded data for QR code {detected_qr_id} at position {current_position} with spice quantity {spice_quantity}")

    return qr_json

def save_qr_data(qr_json, file_name="updated_qr_data.json"):
    with open(file_name, "w") as outfile:
        json.dump(qr_json, outfile, indent=4)
   # print(f"QR data saved to {file_name}")

def load_qr_data(file_name="empty_qr_data.json"):
    with open(file_name, "r") as infile:
        qr_json = json.load(infile)
    return qr_json

def printJSON(file_name):
    try:
        with open(file_name, "r") as infile:
            data = json.load(infile)
            print(json.dumps(data, indent=4))
    except Exception as e:
        print(f"Error reading JSON file '{file_name}': {e}")


