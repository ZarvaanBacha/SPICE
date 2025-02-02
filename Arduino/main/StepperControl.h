#include "StepperControl.h"

StepperControl::StepperControl(int stepPin, int dirPin, int enablePin, int sleepPin) {
    _stepPin = stepPin;
    _dirPin = dirPin;
    _enablePin = enablePin;
    _sleepPin = sleepPin;

    pinMode(_stepPin, OUTPUT);
    pinMode(_dirPin, OUTPUT);
    pinMode(_enablePin, OUTPUT);
    pinMode(_sleepPin, OUTPUT);

    digitalWrite(_enablePin, HIGH);  // Disable motor initially
    digitalWrite(_sleepPin, LOW);    // Put driver in sleep mode initially
}

void StepperControl::moveStepper(int direction, int steps, int aggression) {
    digitalWrite(_sleepPin, HIGH);  // Wake up driver
    delay(1);  // Small delay to wake up properly

    digitalWrite(_enablePin, LOW);  // Enable motor
    digitalWrite(_dirPin, direction);

    int stepDelay = getStepDelay(aggression); 

    for (int i = 0; i < steps; i++) {
        digitalWrite(_stepPin, HIGH);
        delay(stepDelay);   // Use delay() for extra slow motion
        digitalWrite(_stepPin, LOW);
        delay(stepDelay);
    }

    disableMotor();  // Disable motor after movement
}

void StepperControl::disableMotor() {
    digitalWrite(_enablePin, HIGH);  // Disable motor
    digitalWrite(_sleepPin, LOW);    // Put driver in sleep mode
}

int StepperControl::getStepDelay(int aggression) {
    switch (aggression) {
        case 1: return 8;    // **Very slow**
        case 2: return 5;    // Slower
        case 3: return 3;    // Medium slow
        case 4: return 2;    // Medium
        case 5: return 1;    // Fast
        default: return 3;   // Default speed
    }
}
