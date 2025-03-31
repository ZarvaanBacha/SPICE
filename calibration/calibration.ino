/*
  Calibration Sketch
  This sketch implements a custom StepperControl class and uses it for calibration.
  Enter commands via Serial Monitor (baud rate 115200) in the format:
    (direction,steps,aggression,microstepping)
  Example:
    (1,500,2,0)
*/

#include <Arduino.h>

/////////////////////////////////////////////
// Custom StepperControl Class Definition //
/////////////////////////////////////////////

class StepperControl {
  public:
    // Constructor: use pins for STEP, DIR, ENABLE, SLEEP, MS1, MS2, MS3
    StepperControl(int stepPin, int dirPin, int enablePin, int sleepPin, int ms1Pin, int ms2Pin, int ms3Pin) {
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

    // moveStepper: direction (1=clockwise, 0=counterclockwise), number of steps,
    // aggression (affects step delay), and microstepping mode.
    void moveStepper(int direction, int steps, int aggression, int microstepMode) {
      Serial.print("Moving in direction: ");
      Serial.println(direction == 1 ? "Clockwise" : "Counterclockwise");

      // Set the microstepping mode (0 = full step, 1 = half, 2 = 1/4, etc.)
      setMicrostepping(microstepMode);

      // Wake the driver and enable the motor
      digitalWrite(_sleepPin, HIGH);
      delay(1);
      digitalWrite(_enablePin, LOW);
      digitalWrite(_dirPin, direction ? HIGH : LOW);

      // Calculate delay between steps (in microseconds)
      int stepDelay = getStepDelay(aggression, microstepMode);
      unsigned long interval = stepDelay;
      unsigned long nextStepTime = micros();

      // Use a timestamp approach to maintain consistent timing
      for (int i = 0; i < steps; i++) {
        while (micros() < nextStepTime) {
          // busy wait
        }
        digitalWrite(_stepPin, HIGH);
        nextStepTime += interval;
        while (micros() < nextStepTime) {
          // busy wait
        }
        digitalWrite(_stepPin, LOW);
        nextStepTime += interval;
      }

      disableMotor();
    }

    // disableMotor: Disables the motor and puts the driver to sleep
    void disableMotor() {
      digitalWrite(_enablePin, HIGH);
      digitalWrite(_sleepPin, LOW);
    }

    // setMicrostepping: Sets the microstepping mode by controlling MS1, MS2, MS3 pins.
    void setMicrostepping(int microstepMode) {
      digitalWrite(_ms1Pin, microstepMode & 1);
      digitalWrite(_ms2Pin, (microstepMode >> 1) & 1);
      digitalWrite(_ms3Pin, (microstepMode >> 2) & 1);
    }

  private:
    int _stepPin;
    int _dirPin;
    int _enablePin;
    int _sleepPin;
    int _ms1Pin;
    int _ms2Pin;
    int _ms3Pin;

    // getStepDelay: Returns the delay (in microseconds) between steps.
    int getStepDelay(int aggression, int microstepMode) {
      // Base delays for aggression levels 1 (slowest) to 5 (fastest)
      int baseDelays[] = {3000, 1500, 1000, 700, 400};
      // Microstepping factors for microstepping modes 0 to 5
      int microstepFactors[] = {1, 2, 4, 8, 16, 32};

      aggression = constrain(aggression, 1, 5);
      microstepMode = constrain(microstepMode, 0, 5);

      int baseDelay = baseDelays[aggression - 1];
      int factor = microstepFactors[microstepMode];

      return baseDelay * factor;
    }
};

/////////////////////////////////////////////
// End of StepperControl Class Definition  //
/////////////////////////////////////////////

/////////////////////////////////////////////
// Calibration Code
/////////////////////////////////////////////

// Pin definitions (adjust as needed)
#define STEP_PIN 5
#define DIR_PIN 4
#define ENABLE_PIN 7
#define SLEEP_PIN 6
#define MS1_PIN 10
#define MS2_PIN 9
#define MS3_PIN 8

// Create an instance of our custom StepperControl class
StepperControl stepper(STEP_PIN, DIR_PIN, ENABLE_PIN, SLEEP_PIN, MS1_PIN, MS2_PIN, MS3_PIN);

// Serial input buffer for command processing
String inputString = "";

void setup() {
  Serial.begin(115200);
  Serial.println("Calibration Mode");
  Serial.println("Enter (direction,steps,aggression,microstepping)");
  Serial.println("Example: (1,500,2,0)");
}

void loop() {
  // Build the command string from Serial input
  while (Serial.available()) {
    char receivedChar = Serial.read();
    if (receivedChar == '\n') {
      processCommand(inputString);
      inputString = "";
    } else {
      inputString += receivedChar;
    }
  }
}

// processCommand: Parses the input string and executes the corresponding stepper movement.
void processCommand(String command) {
  Serial.print("Received command: ");
  Serial.println(command);

  // Remove any parentheses that might be in the command string
  command.replace("(", "");
  command.replace(")", "");

  // Find comma positions to separate parameters
  int firstComma = command.indexOf(',');
  int secondComma = command.indexOf(',', firstComma + 1);
  int thirdComma = command.indexOf(',', secondComma + 1);

  if (firstComma == -1 || secondComma == -1 || thirdComma == -1) {
    Serial.println("Invalid command format. Use: direction,steps,aggression,microstepping");
    return;
  }

  // Parse the parameters
  int direction = command.substring(0, firstComma).toInt();
  int steps = command.substring(firstComma + 1, secondComma).toInt();
  int aggression = command.substring(secondComma + 1, thirdComma).toInt();
  int microstepMode = command.substring(thirdComma + 1).toInt();

  Serial.print("Parsed Direction: ");
  Serial.println(direction);
  Serial.print("Parsed Steps: ");
  Serial.println(steps);
  Serial.print("Parsed Aggression: ");
  Serial.println(aggression);
  Serial.print("Parsed Microstep Mode: ");
  Serial.println(microstepMode);

  // Execute the stepper movement
  stepper.moveStepper(direction, steps, aggression, microstepMode);
}
