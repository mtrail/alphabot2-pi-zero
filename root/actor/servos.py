import math
import time
from time import sleep

import RPi.GPIO as GPIO
import paho.mqtt.client as mqtt
import smbus

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)


# ============================================================================
# Raspi PCA9685 16-Channel PWM Servo Driver
# ============================================================================

class PCA9685:
    # Registers/etc.
    __SUBADR1 = 0x02
    __SUBADR2 = 0x03
    __SUBADR3 = 0x04
    __MODE1 = 0x00
    __PRESCALE = 0xFE
    __LED0_ON_L = 0x06
    __LED0_ON_H = 0x07
    __LED0_OFF_L = 0x08
    __LED0_OFF_H = 0x09
    __ALLLED_ON_L = 0xFA
    __ALLLED_ON_H = 0xFB
    __ALLLED_OFF_L = 0xFC
    __ALLLED_OFF_H = 0xFD
    frequency = 100
    servo0 = 1500
    servo1 = 1500

    def __init__(self, address=0x40, debug=False):
        self.bus = smbus.SMBus(1)
        self.address = address
        self.debug = debug
        if (self.debug):
            print("Reseting PCA9685")
        self.write(self.__MODE1, 0x00)

    def sleep(self):
        self.write(self.__MODE1, 0x10)  # go to sleep

    def apply_and_sleep_again(self):
        self.write(self.__MODE1, 0x00)  # wake up
        self.setServoPulse(0, self.servo0)
        self.setServoPulse(1, self.servo1)
        self.write(self.__MODE1, 0x10)  # go to sleep

    def write(self, reg, value):
        "Writes an 8-bit value to the specified register/address"
        self.bus.write_byte_data(self.address, reg, value)

    def read(self, reg):
        "Read an unsigned byte from the I2C device"
        result = self.bus.read_byte_data(self.address, reg)
        return result

    def setPWMFreq(self, freq):
        self.frequency = freq
        "Sets the PWM frequency"
        prescaleval = 24576000.0  # 25MHz
        prescaleval /= 4096.0  # 12-bit
        prescaleval /= float(freq)
        prescaleval -= 1.0
        prescale = math.floor(prescaleval + 0.5)
        self.write(self.__MODE1, 0x10)  # go to sleep
        time.sleep(0.005)
        self.write(self.__PRESCALE, int(math.floor(prescale)))
        time.sleep(0.005)
        self.write(self.__MODE1, 0x80)
        time.sleep(0.005)
        self.write(self.__MODE1, 0x00)

    def setPWM(self, channel, on, off):
        "Sets a single PWM channel"
        self.write(self.__LED0_ON_L + 4 * channel, on & 0xFF)
        self.write(self.__LED0_ON_H + 4 * channel, on >> 8)
        self.write(self.__LED0_OFF_L + 4 * channel, int(off) & 0xFF)
        self.write(self.__LED0_OFF_H + 4 * channel, int(off) >> 8)
        if (self.debug):
            print("channel: %d  LED_ON: %d LED_OFF: %d" % (channel, on, off))

    def setServoPulse(self, channel, pulse):
        "Sets the Servo Pulse,The PWM frequency must be 50HZ"
        pulse = pulse * 4096 / (1000000.0 / self.frequency)
        self.setPWM(channel, 0, pulse)


broker_address = "127.0.0.1"
client = mqtt.Client("Servos")
client.connect(broker_address)
client.subscribe("servos/#", 1)

pwm = PCA9685(0x40, debug=False)
pwm.setPWMFreq(100)
pwm.servo0 = 1500
pwm.servo1 = 1500
pwm.apply_and_sleep_again()


def on_message(client, userdata, message):
    payload = str(message.payload.decode("utf-8"))
    topic = message.topic
    print("message received ", payload)
    print("message topic=", topic)
    if topic == "servos/0":
        value = int(payload)
        print("value ", value)
        pwm.servo0 = max(1000, min(2000, value))
        pwm.apply_and_sleep_again()
    if topic == "servos/1":
        value = int(payload)
        print("value ", value)
        pwm.servo1 = max(1000, min(2000, value))
        pwm.apply_and_sleep_again()


client.on_message = on_message
client.loop_start()
while True:
    sleep(1)
