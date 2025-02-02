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
            inputString = "";  
        } else {
            inputString += receivedChar;  
        }
    }
}

void processCommand(String command) {
    int firstComma = command.indexOf(',');
    int secondComma = command.indexOf(',', firstComma + 1);
    if (firstComma == -1 || secondComma == -1) return;  // Invalid format

    int direction = command.substring(0, firstComma).toInt();
    int steps = command.substring(firstComma + 1, secondComma).toInt();
    int aggression = command.substring(secondComma + 1).toInt();

    stepper.moveStepper(direction, steps, aggression);
}
