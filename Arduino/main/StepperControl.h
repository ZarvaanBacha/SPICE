#ifndef STEPPER_CONTROL_H
#define STEPPER_CONTROL_H

#include <Arduino.h>

class StepperControl {
public:
    StepperControl(int stepPin, int dirPin);
    void moveStepper(int direction, int steps, int aggression);

private:
    int _stepPin;
    int _dirPin;
    int getStepDelay(int aggression);
};

#endif
