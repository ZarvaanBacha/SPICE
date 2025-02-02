#ifndef STEPPER_CONTROL_H
#define STEPPER_CONTROL_H

#include <Arduino.h>

class StepperControl {
public:
    // Constructor takes STEP, DIR, ENABLE, and SLEEP pins.
    StepperControl(int stepPin, int dirPin, int enablePin, int sleepPin);

    /**
     * Moves the stepper motor.
     * @param direction: 1 for forward, 0 for reverse.
     * @param steps: Total number of steps.
     * @param aggression: Controls target speed (1=slow, 5=fast).
     * @param acceleration: Controls ramp profile (e.g., 1-10, where lower is a slower ramp).
     */
    void moveStepper(int direction, int steps, int aggression, int acceleration);

    // Puts the driver into low-power sleep mode.
    void disableMotor();

private:
    int _stepPin;
    int _dirPin;
    int _enablePin;
    int _sleepPin;

    // Returns the target step delay (in microseconds) based on the aggression level.
    int getTargetDelay(int aggression);
};

#endif
