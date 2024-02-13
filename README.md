# Baymax

## Required Components:
- HC-SR04 (Ultrasonic Sensor, 1)
- LED (4)
- Breadboard (1)
- Arduino Leonardo (1)
- Push buttons (2)
- Male to Female wires (50)
- Male to Male wires (20)
- Female to Female wires (20)
- USB-A to Micro-USB wire (1)

## Circuit diagaram:
    HC-SR05:
            VCC - 5V Breadboard
            Trig & Echo - D7
            GND - GND Breadboard

    Button 1 (Toggles Busy and Available mode):
            Terminal 1 - 5V Breadboard
            Terminal 2 - D2

    Button 2 (Toggles Distance Measurement mode):
            Terminal 1 - 5V Breadboard
            Terminal 2 - D3

    Music Mode LED:
            GND - GND Breadboard
            5V - D9
    
    Busy LED:
            GND - GND Breadboard
            5V - D13

    Available LED:
            GND - GND Breadboard
            5V - D12
    
    Ultrasonic Mode LED:
            GND - GND Breadboard
            5V - D10

    Breadboard:
            5V line - Arduino 5V
            GND line - Arduino GND