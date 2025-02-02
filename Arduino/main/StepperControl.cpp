#include "StepperControl.h"

// Define a constant for the maximum (start/stop) delay in microseconds.
// This delay corresponds to a very slow speed.
const int MAX_DELAY = 3000;

StepperControl::StepperControl(int stepPin, int dirPin, int enablePin, int sleepPin) {
    _stepPin = stepPin;
    _dirPin = dirPin;
    _enablePin = enablePin;
    _sleepPin = sleepPin;

    pinMode(_stepPin, OUTPUT);
    pinMode(_dirPin, OUTPUT);
    pinMode(_enablePin, OUTPUT);
    pinMode(_sleepPin, OUTPUT);

    // Start with the motor disabled and the driver in sleep mode.
    digitalWrite(_enablePin, HIGH);  
    digitalWrite(_sleepPin, LOW);
}

int StepperControl::getTargetDelay(int aggression) {
    // Map aggression (1 to 5) to a target delay.
    // Lower aggression results in a higher (slower) target speed.
    switch (aggression) {
        case 1: return 2000; // Slow target speed
        case 2: return 1500;
        case 3: return 1000;
        case 4: return 700;
        case 5: return 400;  // Fast target speed
        default: return 1000; // Default target delay if out-of-range
    }
}

void StepperControl::moveStepper(int direction, int steps, int aggression, int acceleration) {
    // Wake up the driver and enable the motor.
    digitalWrite(_sleepPin, HIGH);
    delay(1);  // Small delay to ensure the driver wakes up.
    digitalWrite(_enablePin, LOW);
    digitalWrite(_dirPin, direction);

    int targetDelay = getTargetDelay(aggression);

    // Calculate how many steps to use for acceleration and deceleration.
    // We choose rampSteps as the lesser of half the total steps or a number proportional to the acceleration parameter.
    int rampSteps = steps / 2;
    int accelSteps = acceleration * 10;  // You can adjust the multiplier to suit your system.
    if (accelSteps < rampSteps)
        rampSteps = accelSteps;

    // For very short moves, ensure rampSteps does not exceed half of the total steps.
    if (rampSteps > steps / 2) {
        rampSteps = steps / 2;
    }

    // For each step, determine the appropriate delay.
    // We will divide the move into three segments: acceleration, cruising, and deceleration.
    for (int i = 0; i < steps; i++) {
        int currentDelay;

        if (i < rampSteps) {
            // Acceleration: linearly decrease delay from MAX_DELAY to targetDelay.
            currentDelay = MAX_DELAY - ((MAX_DELAY - targetDelay) * i) / rampSteps;
        } else if (i >= steps - rampSteps) {
            // Deceleration: linearly increase delay from targetDelay back to MAX_DELAY.
            int decelIndex = i - (steps - rampSteps);
            currentDelay = targetDelay + ((MAX_DELAY - targetDelay) * decelIndex) / rampSteps;
        } else {
            // Cruising at the target delay.
            currentDelay = targetDelay;
        }

        // Pulse the step pin.
        digitalWrite(_stepPin, HIGH);
        delayMicroseconds(currentDelay);
        digitalWrite(_stepPin, LOW);
        delayMicroseconds(currentDelay);
    }

    disableMotor();  // After movement, disable motor to save power and reduce heating.
}

void StepperControl::disableMotor() {
    digitalWrite(_enablePin, HIGH);  // Disable motor power.
    digitalWrite(_sleepPin, LOW);    // Put driver into sleep mode.
}
