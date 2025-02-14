#include "StepperControl.h"

#define STEP_PIN 5
#define DIR_PIN 4
#define ENABLE_PIN 7
#define SLEEP_PIN 6
#define MS1_PIN 10
#define MS2_PIN 9
#define MS3_PIN 8

StepperControl stepper(STEP_PIN, DIR_PIN, ENABLE_PIN, SLEEP_PIN, MS1_PIN, MS2_PIN, MS3_PIN);
String inputString = "";

const int STEPS_PER_DEGREE = 77; // Defined number of steps for 1/8 rotation per degree
const int TOTAL_DEGREES = 360;
const int TOTAL_STEPS = 632;     // Total steps for a full rotation

void setup() {
    Serial.begin(115200);
}

void loop() {
    while (Serial.available()) {
        char receivedChar = Serial.read();
        if (receivedChar == '\n') {
            processCommand(inputString);
            inputString = "";
        } else {
            inputString += receivedChar;
        }
    }
}

void processCommand(String command) {
    Serial.print("Received command: ");
    Serial.println(command);

    int commaIndex = command.indexOf(',');
    if (commaIndex == -1) {
        Serial.println("Invalid command format.");
        return;
    }

    int currentPosition = command.substring(0, commaIndex).toInt();
    int targetPosition = command.substring(commaIndex + 1).toInt();

    Serial.print("Current Position: ");
    Serial.println(currentPosition);
    Serial.print("Target Position: ");
    Serial.println(targetPosition);

    moveToPosition(currentPosition, targetPosition);
}

void moveToPosition(int current, int target) {
    int totalPositions = 8; // Circular list: [1,2,3,4,5,6,7,8]

    // Convert to 0-based indices
    int curIdx = current - 1;
    int tgtIdx = target - 1;

    // Calculate steps required in each direction
    int rightSteps = (tgtIdx - curIdx + totalPositions) % totalPositions;
    int leftSteps = (curIdx - tgtIdx + totalPositions) % totalPositions;

    int direction, steps;
    if (rightSteps <= leftSteps) {
        direction = 1; // Clockwise
        steps = rightSteps;
    } else {
        direction = 0; // Counterclockwise
        steps = leftSteps;
    }

    // Convert position steps to actual motor steps using STEPS_PER_DEGREE
    int stepperSteps = steps * STEPS_PER_DEGREE; 

    Serial.print("Moving ");
    Serial.print(direction == 1 ? "Clockwise" : "Counterclockwise");
    Serial.print(" for ");
    Serial.print(stepperSteps);
    Serial.println(" steps.");

    stepper.moveStepper(direction, stepperSteps, 1, 0); // Aggression=1, microstepMode=0 (full step mode)
}
