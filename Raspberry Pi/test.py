#!/usr/bin/env python3
import json
from initialize import initialize
from dispense import dispense
from moveToRefill import moveToRefill  # Uncomment if you want to test moveToRefill separately

def run_tests():
    # Test case for initialize (if needed)
    initial_qr_json = '''{
        "1": {"spiceQuantity": null, "location": null},
        "2": {"spiceQuantity": null, "location": null},
        "3": {"spiceQuantity": null, "location": null},
        "4": {"spiceQuantity": null, "location": null},
        "5": {"spiceQuantity": null, "location": null},
        "6": {"spiceQuantity": null, "location": null},
        "7": {"spiceQuantity": null, "location": null},
        "8": {"spiceQuantity": null, "location": null}
    }'''
    initial_qr_data = json.loads(initial_qr_json)
    
    # Test case for dispense instructions
    dispense_json = '''{
        "2": {
            "spiceQuantityInEighthTsp": 4,
            "location": 5,
            "spiceQuantity": 2
        },
        "3": {
            "spiceQuantityInEighthTsp": 4,
            "location": 4,
            "spiceQuantity": 2
        },
        "7": {
            "spiceQuantityInEighthTsp": 4,
            "location": 6,
            "spiceQuantity": 2
        },
        "5": {
            "spiceQuantityInEighthTsp": 4,
            "location": 1,
            "spiceQuantity": 2
        }
    }'''
    dispense_data = json.loads(dispense_json)
    
    # Run the dispense test case
    # print("Running test case for dispense() function...")
    # The second parameter is the starting plate position.
    dispense(dispense_data, 8)
    # print("Dispense test case complete.\n")
    
    # Uncomment the following lines to test the initialize function as well.
    # print("Running test case for initialize() function...")
    # initialize(initial_qr_data)
    # print("Initialize test case complete.\n")
    
    # Uncomment the following lines to test moveToRefill if desired.
    # print("Running test case for moveToRefill() function...")
    # moveToRefill(1, 2)
    # print("moveToRefill test case complete.\n")

if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print("An error occurred during testing:", e)
