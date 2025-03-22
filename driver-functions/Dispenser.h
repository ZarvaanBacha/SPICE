#ifndef DISPENSER_H
#define DISPENSER_H

#include <Servo.h>
#include <Arduino.h>

class Dispenser {
public:
  Dispenser();
  
  // Attach servos using the provided pins.
  void begin(int sliderPin, int dispenserPin);
  
  // Start a non-blocking servo command.
  // motorName must be "slider" or "dispenser".
  // direction should be "cw" or "ccw".
  // steps: number of time‐steps (each step equals STEP_DELAY_MS ms)
  // speedPercentage: speed (0-100)
  void startCommand(String motorName, String direction, int steps, int speedPercentage);
  
  // Call this function from loop() to update any ongoing servo commands.
  // It stops a movement if its run time is over or if stopRequested is set.
  void update(volatile bool &stopRequested);

private:
  Servo sliderServo;
  Servo dispenserServo;
  const int STOP_VALUE = 90;       // Neutral (stop) position.
  const int STEP_DELAY_MS = 10;    // Each "step" duration in ms.
  
  // Data structure for non-blocking servo movement.
  struct ServoMovement {
    bool active;
    Servo* motor;
    String motorLabel;
    int targetCommand;
    unsigned long runDuration; // Duration in milliseconds.
    unsigned long startTime;
  };
  
  ServoMovement sliderMovement;
  ServoMovement dispenserMovement;
  
  // Compute the servo command value based on direction and speed.
  int computeServoCommand(String direction, int speedPercentage);
  
  // Helper: Start a movement on a given servo.
  void startMovement(ServoMovement &movement, Servo &motor, const String &motorLabel, int targetCommand, unsigned long runDuration);
};

#endif // DISPENSER_H
