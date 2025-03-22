#include "Dispenser.h"

Dispenser::Dispenser() {
  // Initialize movement structures.
  sliderMovement.active = false;
  dispenserMovement.active = false;
}

void Dispenser::begin(int sliderPin, int dispenserPin) {
  sliderServo.attach(sliderPin);
  dispenserServo.attach(dispenserPin);
  
  // Set both servos to neutral.
  sliderServo.write(STOP_VALUE);
  dispenserServo.write(STOP_VALUE);
  Serial.println("Dispenser servos initialized.");
}

int Dispenser::computeServoCommand(String direction, int speedPercentage) {
  // For continuous rotation servos:
  // "cw" increases from STOP_VALUE to 180, "ccw" decreases from STOP_VALUE to 0.
  if (direction.equalsIgnoreCase("cw")) {
    return STOP_VALUE + (speedPercentage * (180 - STOP_VALUE)) / 100;
  } else if (direction.equalsIgnoreCase("ccw")) {
    return STOP_VALUE - (speedPercentage * (STOP_VALUE - 0)) / 100;
  }
  return STOP_VALUE; // default to stop if invalid.
}

void Dispenser::startMovement(ServoMovement &movement, Servo &motor, const String &motorLabel, int targetCommand, unsigned long runDuration) {
  movement.active = true;
  movement.motor = &motor;
  movement.motorLabel = motorLabel;
  movement.targetCommand = targetCommand;
  movement.runDuration = runDuration;
  movement.startTime = millis();
  
  // Issue the servo command.
  motor.write(targetCommand);
  Serial.print(motorLabel);
  Serial.print(" started with command ");
  Serial.print(targetCommand);
  Serial.print(" for ");
  Serial.print(runDuration);
  Serial.println(" ms");
}

void Dispenser::startCommand(String motorName, String direction, int steps, int speedPercentage) {
  int targetCommand = computeServoCommand(direction, speedPercentage);
  unsigned long runDuration = (unsigned long)steps * STEP_DELAY_MS;
  
  if (motorName.equalsIgnoreCase("slider")) {
    startMovement(sliderMovement, sliderServo, "Slider", targetCommand, runDuration);
  } else if (motorName.equalsIgnoreCase("dispenser")) {
    startMovement(dispenserMovement, dispenserServo, "Dispenser", targetCommand, runDuration);
  } else {
    Serial.println("Unknown motor name. Use 'slider' or 'dispenser'.");
  }
}

void Dispenser::update(volatile bool &stopRequested) {
  unsigned long currentTime = millis();
  
  // Update slider movement.
  if (sliderMovement.active) {
    if (stopRequested || (currentTime - sliderMovement.startTime >= sliderMovement.runDuration)) {
      sliderServo.write(STOP_VALUE);
      Serial.println("Slider stopped.");
      sliderMovement.active = false;
    }
  }
  
  // Update dispenser movement.
  if (dispenserMovement.active) {
    if (stopRequested || (currentTime - dispenserMovement.startTime >= dispenserMovement.runDuration)) {
      dispenserServo.write(STOP_VALUE);
      Serial.println("Dispenser stopped.");
      dispenserMovement.active = false;
    }
  }
}
