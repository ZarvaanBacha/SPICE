#!/usr/bin/env python3
import sys
from serial_comm import send_serial_command

def moveToRefill(starting_position, destination):
    """
    Moves the refill container from the starting position to the destination.

    Parameters:
      starting_position (int): The current position of the container.
      destination (int): The target position for the container.
    """
    # Construct the move command in the expected format.
    command = f"move({starting_position}, {destination})"
    # Send the command using the serial communication function.
    send_serial_command(command)
    # print(f"Executed moveToRefill command: {command}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        #print("Usage: python move_to_refill.py <starting_position> <destination>")
        sys.exit(1)
    try:
        starting_position = int(sys.argv[1])
        destination = int(sys.argv[2])
    except Exception as e:
        #print("Error parsing input:", e)
        sys.exit(1)
    moveToRefill(starting_position, destination)
