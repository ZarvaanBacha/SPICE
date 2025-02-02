#ifndef STEPPER_CONTROL_H
#define STEPPER_CONTROL_H

#include <Arduino.h>

class StepperControl {
public:
    StepperControl(int stepPin, int dirPin, int enablePin);
    void moveStepper(int direction, int steps, int aggression);
    void disableMotor();

private:
    int _stepPin;
    int _dirPin;
    int _enablePin;
    int getStepDelay(int aggression);
};

#endif
