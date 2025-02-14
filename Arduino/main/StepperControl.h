#ifndef STEPPER_CONTROL_H
#define STEPPER_CONTROL_H

#include <Arduino.h>

class StepperControl {
public:
    StepperControl(int stepPin, int dirPin, int enablePin, int sleepPin, int ms1Pin, int ms2Pin, int ms3Pin);
    void moveStepper(int direction, int steps, int aggression, int microstepMode);
    void disableMotor();
    void setMicrostepping(int microstepMode);

private:
    int _stepPin;
    int _dirPin;
    int _enablePin;
    int _sleepPin;
    int _ms1Pin;
    int _ms2Pin;
    int _ms3Pin;
    int getStepDelay(int aggression, int microstepMode);
};

#endif
