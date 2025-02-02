#include "StepperControl.h"

StepperControl::StepperControl(int stepPin, int dirPin) {
    _stepPin = stepPin;
    _dirPin = dirPin;
    pinMode(_stepPin, OUTPUT);
    pinMode(_dirPin, OUTPUT);
}

void StepperControl::moveStepper(int direction, int steps, int aggression) {
    digitalWrite(_dirPin, direction); // Set motor direction
    int stepDelay = getStepDelay(aggression); 

    for (int i = 0; i < steps; i++) {
        digitalWrite(_stepPin, HIGH);
        delayMicroseconds(stepDelay);
        digitalWrite(_stepPin, LOW);
        delayMicroseconds(stepDelay);
    }
}

int StepperControl::getStepDelay(int aggression) {
    switch (aggression) {
        case 1: return 2000; // Slowest
        case 2: return 1500;
        case 3: return 1000;
        case 4: return 700;
        case 5: return 400;  // Fastest
        default: return 1000; // Default if invalid
    }
}
