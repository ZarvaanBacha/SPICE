#include "StepperControl.h"
#include "Dispenser.h"

// Stepper pin definitions
#define STEP_PIN 5
#define DIR_PIN 4
#define ENABLE_PIN 7
#define SLEEP_PIN 6
#define MS1_PIN 10
#define MS2_PIN 9
#define MS3_PIN 8

// Servo (Dispenser) pin definitions (defined in main)
#define SLIDER_PIN 12
#define DISPENSER_PIN 11

// Global stop flag for both stepper and servo commands.
volatile bool stopRequested = false;

StepperControl stepper(STEP_PIN, DIR_PIN, ENABLE_PIN, SLEEP_PIN, MS1_PIN, MS2_PIN, MS3_PIN);
Dispenser dispenser;  // Our new dispenser object

String inputString = "";

const int STEPS_PER_DEGREE = 140; // Steps for 1/8 rotation per degree
const int TOTAL_DEGREES = 360;
const int TOTAL_STEPS = 1070;     // Total steps for a full rotation

// Structure to hold non-blocking stepper movement parameters.
struct Movement {
  bool active;
  int direction;           // 1 for CW, 0 for CCW
  int stepsRemaining;
  int aggression;
  int microstepMode;
  unsigned long stepDelay;   // in microseconds
  unsigned long nextStepTime; // next scheduled step time (micros)
};

Movement currentMovement = { false, 0, 0, 0, 0, 0, 0 };

void startMovement(int direction, int steps, int aggression, int microstepMode) {
  digitalWrite(SLEEP_PIN, HIGH);
  delay(1);
  digitalWrite(ENABLE_PIN, LOW);
  digitalWrite(DIR_PIN, direction ? HIGH : LOW);
  
  stepper.setMicrostepping(microstepMode);
  
  currentMovement.active = true;
  currentMovement.direction = direction;
  currentMovement.stepsRemaining = steps;
  currentMovement.aggression = aggression;
  currentMovement.microstepMode = microstepMode;
  
  int baseDelays[] = {3000, 1500, 1000, 700, 400};
  int microstepFactors[] = {1, 2, 4, 8, 16, 32};
  int aggrIndex = constrain(aggression, 1, 5);
  int microIndex = constrain(microstepMode, 0, 5);
  currentMovement.stepDelay = baseDelays[aggrIndex - 1] * microstepFactors[microIndex];
  
  currentMovement.nextStepTime = micros() + currentMovement.stepDelay;
  Serial.println("Movement started.");
}

void updateMovement() {
  if (!currentMovement.active) return;
  
  if (stopRequested) {
    Serial.println("Movement stopped.");
    currentMovement.active = false;
    stepper.disableMotor();
    return;
  }
  
  unsigned long currentTime = micros();
  if (currentTime >= currentMovement.nextStepTime) {
    digitalWrite(STEP_PIN, HIGH);
    delayMicroseconds(2);
    digitalWrite(STEP_PIN, LOW);
    
    currentMovement.stepsRemaining--;
    if (currentMovement.stepsRemaining <= 0) {
      Serial.println("Movement completed.");
      currentMovement.active = false;
      stepper.disableMotor();
    } else {
      currentMovement.nextStepTime += currentMovement.stepDelay;
    }
  }
}

void lockMotor() {
  currentMovement.active = false;
  digitalWrite(SLEEP_PIN, HIGH);
  digitalWrite(ENABLE_PIN, LOW);
  Serial.println("Motor locked (holding torque).");
}

void processCommand(String command) {
  command.trim();
  Serial.print("Received command: ");
  Serial.println(command);
  
  // Process STOP command.
  if (command.equalsIgnoreCase("stop")) {
    Serial.println("Stop command received. Disabling motors.");
    stopRequested = true;
    stepper.disableMotor();
    // Servo update() will see stopRequested and halt servo movements.
    return;
  }
  
  // Process LOCK command.
  if (command.equalsIgnoreCase("lock")) {
    Serial.println("Lock command received.");
    stopRequested = false; // clear stop flag
    lockMotor();
    return;
  }
  
  // Clear stop flag for new motions.
  stopRequested = false;
  
  // Process 360 command.
  if (command.equalsIgnoreCase("360")) {
    Serial.println("Performing 360");
    startMovement(1, TOTAL_STEPS, 0, 0);
    return;
  }
  
  // Process move command: move(current, target)
  if (command.startsWith("move(")) {
    int startIndex = command.indexOf('(');
    int endIndex = command.lastIndexOf(')');
    if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
      Serial.println("Invalid move command format.");
      return;
    }
    String paramString = command.substring(startIndex + 1, endIndex);
    int commaIndex = paramString.indexOf(',');
    if (commaIndex == -1) {
      Serial.println("Invalid move command parameters.");
      return;
    }
    int currentPosition = paramString.substring(0, commaIndex).toInt();
    int targetPosition = paramString.substring(commaIndex + 1).toInt();
    Serial.print("Move command: current = ");
    Serial.print(currentPosition);
    Serial.print(", target = ");
    Serial.println(targetPosition);
    
    int totalPositions = 8;
    int curIdx = currentPosition - 1;
    int tgtIdx = targetPosition - 1;
    int rightSteps = (tgtIdx - curIdx + totalPositions) % totalPositions;
    int leftSteps = (curIdx - tgtIdx + totalPositions) % totalPositions;
    int direction, steps;
    if (rightSteps <= leftSteps) {
      direction = 1;
      steps = rightSteps;
    } else {
      direction = 0;
      steps = leftSteps;
    }
    
    int stepperSteps = steps * STEPS_PER_DEGREE;
    Serial.print("Moving ");
    Serial.print(direction == 1 ? "Clockwise" : "Counterclockwise");
    Serial.print(" for ");
    Serial.print(stepperSteps);
    Serial.println(" steps.");
    
    startMovement(direction, stepperSteps, 1, 0);
    return;
  }
  
  // Process step command: step(direction, steps, aggression, microsteps)
  else if (command.startsWith("step(")) {
    int startIndex = command.indexOf('(');
    int endIndex = command.lastIndexOf(')');
    if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
      Serial.println("Invalid step command format.");
      return;
    }
    String paramString = command.substring(startIndex + 1, endIndex);
    int firstComma = paramString.indexOf(',');
    int secondComma = paramString.indexOf(',', firstComma + 1);
    int thirdComma = paramString.indexOf(',', secondComma + 1);
    if (firstComma == -1 || secondComma == -1 || thirdComma == -1) {
      Serial.println("Invalid step command parameters.");
      return;
    }
    String directionStr = paramString.substring(0, firstComma);
    directionStr.trim();
    int direction;
    if (directionStr.equalsIgnoreCase("cw"))
      direction = 1;
    else if (directionStr.equalsIgnoreCase("ccw"))
      direction = 0;
    else {
      Serial.println("Invalid direction parameter. Use 'cw' or 'ccw'.");
      return;
    }
    String stepsStr = paramString.substring(firstComma + 1, secondComma);
    String aggressionStr = paramString.substring(secondComma + 1, thirdComma);
    String microstepsStr = paramString.substring(thirdComma + 1);
    int steps = stepsStr.toInt();
    int aggression = aggressionStr.toInt();
    int microsteps = microstepsStr.toInt();
    Serial.print("Step command: direction = ");
    Serial.print(directionStr);
    Serial.print(", steps = ");
    Serial.print(steps);
    Serial.print(", aggression = ");
    Serial.print(aggression);
    Serial.print(", microsteps = ");
    Serial.println(microsteps);
    
    startMovement(direction, steps, aggression, microsteps);
    return;
  }
  // Process servo commands: e.g. "slider: cw, 100, 75" or "dispenser: ccw, 50, 100"
  else if (command.startsWith("slider:") || command.startsWith("dispenser:")) {
    int colonIndex = command.indexOf(':');
    if (colonIndex == -1) {
      Serial.println("Invalid servo command format. Use: motorname: direction, steps, speed");
      return;
    }
    String motorName = command.substring(0, colonIndex);
    motorName.trim();
    String rest = command.substring(colonIndex + 1);
    rest.trim();
    
    int firstComma = rest.indexOf(',');
    if (firstComma == -1) {
      Serial.println("Invalid servo command format. Use: motorname: direction, steps, speed");
      return;
    }
    String direction = rest.substring(0, firstComma);
    direction.trim();
    
    String afterDirection = rest.substring(firstComma + 1);
    afterDirection.trim();
    int secondComma = afterDirection.indexOf(',');
    String stepsStr, speedStr;
    if (secondComma != -1) {
      stepsStr = afterDirection.substring(0, secondComma);
      stepsStr.trim();
      speedStr = afterDirection.substring(secondComma + 1);
      speedStr.trim();
    } else {
      stepsStr = afterDirection;
      speedStr = "";
    }
    
    int steps = stepsStr.toInt();
    if (steps <= 0) {
      Serial.println("Steps must be a positive number.");
      return;
    }
    int speedPercentage = (speedStr.length() > 0) ? speedStr.toInt() : 100;
    speedPercentage = constrain(speedPercentage, 0, 100);
    
    // Start a non-blocking servo command.
    dispenser.startCommand(motorName, direction, steps, speedPercentage);
    return;
  }
  else {
    Serial.println("Invalid command format.");
    Serial.println("Use move(current,target), step(direction, steps, aggression, microsteps), 360, lock, stop, or servo commands (slider: or dispenser:).");
  }
}

void setup() {
  Serial.begin(115200);
  
  // Setup stepper pins.
  pinMode(STEP_PIN, OUTPUT);
  pinMode(DIR_PIN, OUTPUT);
  pinMode(ENABLE_PIN, OUTPUT);
  pinMode(SLEEP_PIN, OUTPUT);
  pinMode(MS1_PIN, OUTPUT);
  pinMode(MS2_PIN, OUTPUT);
  pinMode(MS3_PIN, OUTPUT);
  
  // Initialize dispenser servos.
  dispenser.begin(SLIDER_PIN, DISPENSER_PIN);
}

void loop() {
  // Process serial input.
  while (Serial.available()) {
    char receivedChar = Serial.read();
    if (receivedChar == '\n') {
      processCommand(inputString);
      inputString = "";
    } else {
      inputString += receivedChar;
    }
  }
  
  // Update stepper and servo movements.
  updateMovement();
  dispenser.update(stopRequested);
}
