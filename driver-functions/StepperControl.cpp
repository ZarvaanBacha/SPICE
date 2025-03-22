#include "StepperControl.h"

StepperControl::StepperControl(int stepPin, int dirPin, int enablePin, int sleepPin, int ms1Pin, int ms2Pin, int ms3Pin) {
    _stepPin = stepPin;
    _dirPin = dirPin;
    _enablePin = enablePin;
    _sleepPin = sleepPin;
    _ms1Pin = ms1Pin;
    _ms2Pin = ms2Pin;
    _ms3Pin = ms3Pin;

    pinMode(_stepPin, OUTPUT);
    pinMode(_dirPin, OUTPUT);
    pinMode(_enablePin, OUTPUT);
    pinMode(_sleepPin, OUTPUT);
    pinMode(_ms1Pin, OUTPUT);
    pinMode(_ms2Pin, OUTPUT);
    pinMode(_ms3Pin, OUTPUT);

    digitalWrite(_enablePin, HIGH);  // Motor disabled
    digitalWrite(_sleepPin, LOW);     // Driver asleep
}

void StepperControl::moveStepper(int direction, int steps, int aggression, int microstepMode) {
    Serial.print("Moving in direction: ");
    Serial.println(direction == 1 ? "Clockwise" : "Counterclockwise");

    // Set microstepping mode.
    setMicrostepping(microstepMode);

    // Wake the driver and enable motor.
    digitalWrite(_sleepPin, HIGH);
    delay(1);
    digitalWrite(_enablePin, LOW);
    digitalWrite(_dirPin, direction ? HIGH : LOW);

    // Calculate delay between steps based on aggression and microstepping.
    int stepDelay = getStepDelay(aggression, microstepMode);
    unsigned long interval = stepDelay; // Target delay per phase (in microseconds)
    unsigned long nextStepTime = micros();

    for (int i = 0; i < steps; i++) {
        while (micros() < nextStepTime) {
            // Busy wait.
        }
        digitalWrite(_stepPin, HIGH);
        nextStepTime += interval;
        while (micros() < nextStepTime) {
            // Busy wait.
        }
        digitalWrite(_stepPin, LOW);
        nextStepTime += interval;
    }

    disableMotor();
}

void StepperControl::disableMotor() {
    digitalWrite(_enablePin, HIGH);
    digitalWrite(_sleepPin, LOW);
}

void StepperControl::setMicrostepping(int microstepMode) {
    digitalWrite(_ms1Pin, microstepMode & 1);
    digitalWrite(_ms2Pin, (microstepMode >> 1) & 1);
    digitalWrite(_ms3Pin, (microstepMode >> 2) & 1);
}

int StepperControl::getStepDelay(int aggression, int microstepMode) {
    int baseDelays[] = {3000, 1500, 1000, 700, 400}; // for aggression levels 1-5
    int microstepFactors[] = {1, 2, 4, 8, 16, 32};    // for microstepping mode 0-5

    aggression = constrain(aggression, 1, 5);
    microstepMode = constrain(microstepMode, 0, 5);

    int baseDelay = baseDelays[aggression - 1];
    int factor = microstepFactors[microstepMode];

    return baseDelay * factor;
}

void StepperControl::lockMotor() {
    // Keep the motor enabled (energized) so that it holds its current position.
    digitalWrite(_sleepPin, HIGH);
    digitalWrite(_enablePin, LOW);
    Serial.println("Motor locked (holding torque).");
}
