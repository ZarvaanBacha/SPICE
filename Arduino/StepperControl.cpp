#include "StepperControl.h"

StepperControl::StepperControl(int stepPin, int dirPin) {
    _stepPin = stepPin;
    _dirPin = dirPin;
    pinMode(_stepPin, OUTPUT);
    pinMode(_dirPin, OUTPUT);
}

void StepperControl::moveStepper(int direction, int steps) {
    digitalWrite(_dirPin, direction); // Set motor direction

    for (int i = 0; i < steps; i++) {
        digitalWrite(_stepPin, HIGH);
        delayMicroseconds(500);  // Adjust for motor speed
        digitalWrite(_stepPin, LOW);
        delayMicroseconds(500);
    }
}
