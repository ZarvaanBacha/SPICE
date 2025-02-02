#include "StepperControl.h"

#define STEP_PIN 9
#define DIR_PIN 8

StepperControl stepper(STEP_PIN, DIR_PIN);
String inputString = "";

void setup() {
    Serial.begin(115200);
}

void loop() {
    while (Serial.available()) {
        char receivedChar = Serial.read();

        if (receivedChar == '\n') {  // End of message
            processCommand(inputString);
            inputString = "";  // Reset for next command
        } else {
            inputString += receivedChar;  // Build command string
        }
    }
}

void processCommand(String command) {
    int commaIndex = command.indexOf(',');
    if (commaIndex == -1) return;  // Invalid format

    int direction = command.substring(0, commaIndex).toInt();
    int steps = command.substring(commaIndex + 1).toInt();

    stepper.moveStepper(direction, steps);
}
