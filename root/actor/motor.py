from time import sleep
from typing import NamedTuple

import RPi.GPIO as GPIO
import paho.mqtt.client as mqtt

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)


class Wheel(object):
    """Controller for a single wheel"""

    class WheelWiring(NamedTuple):
        forward: int
        reverse: int
        speed: int
        frequency: int

    def __init__(self, wiring):
        self.wiring = wiring
        GPIO.setup((wiring.forward, wiring.reverse, wiring.speed), GPIO.OUT)
        GPIO.output((wiring.forward, wiring.reverse, wiring.speed), GPIO.LOW)
        self.pwm = GPIO.PWM(wiring.speed, wiring.frequency)

    def spin(self, speed):
        directions = [GPIO.HIGH, GPIO.LOW]
        if speed < 0: directions.reverse()
        GPIO.output((self.wiring.forward, self.wiring.reverse), directions)
        self.pwm.start(abs(speed))


leftWheel = Wheel(Wheel.WheelWiring(13, 12, 6, 500))
rightWheel = Wheel(Wheel.WheelWiring(21, 20, 26, 500))

broker_address = "127.0.0.1"
client = mqtt.Client("Motor")
client.connect(broker_address)
client.publish("motor/status", "Starting", qos=1)
client.subscribe("motor/#", 1)


def on_message(client, userdata, message):
    payload = str(message.payload.decode("utf-8"))
    topic = message.topic
    print("message received ", payload)
    print("message topic=", topic)
    if topic == "motor/left":
        value = int(payload)
        print("value ", value)
        leftWheel.spin(max(-100, min(100, value)))
    if topic == "motor/right":
        value = int(payload)
        print("value ", value)
        rightWheel.spin(max(-100, min(100, value)))


client.on_message = on_message
client.loop_start()

client.publish("motor/status", "Started", qos=1)
while True:
    sleep(1)
client.loop_stop()
