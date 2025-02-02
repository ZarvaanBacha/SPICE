#include "StepperControl.h"

// Define the pins used for the stepper driver.
#define STEP_PIN   9
#define DIR_PIN    8
#define ENABLE_PIN 7
#define SLEEP_PIN  10

// Create an instance of StepperControl.
StepperControl stepper(STEP_PIN, DIR_PIN, ENABLE_PIN, SLEEP_PIN);

// Global string to collect incoming serial data.
String inputString = "";

void setup() {
    Serial.begin(115200);
}

void loop() {
    // Read incoming serial data.
    while (Serial.available()) {
        char receivedChar = Serial.read();

        if (receivedChar == '\n') {  // End of command string.
            processCommand(inputString);
            inputString = "";  // Reset the command string.
        } else {
            inputString += receivedChar;  // Append received character.
        }
    }
}

/**
 * Expects a command in the format:
 * DIRECTION,STEPS,AGGRESSION,ACCELERATION
 * Example: "1,200,3,5"
 */
void processCommand(String command) {
    int firstComma = command.indexOf(',');
    int secondComma = command.indexOf(',', firstComma + 1);
    int thirdComma = command.indexOf(',', secondComma + 1);
    
    // If any comma is missing, the command is invalid.
    if (firstComma == -1 || secondComma == -1 || thirdComma == -1) return;  

    int direction = command.substring(0, firstComma).toInt();
    int steps = command.substring(firstComma + 1, secondComma).toInt();
    int aggression = command.substring(secondComma + 1, thirdComma).toInt();
    int acceleration = command.substring(thirdComma + 1).toInt();

    stepper.moveStepper(direction, steps, aggression, acceleration);
}
