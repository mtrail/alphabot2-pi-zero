import time

import RPi.GPIO as GPIO
import paho.mqtt.client as mqtt

TRIG = 22
ECHO = 27

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(TRIG, GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(ECHO, GPIO.IN)

broker_address = "127.0.0.1"
client = mqtt.Client("Ultrasonic")
client.connect(broker_address)


def dist():
    GPIO.output(TRIG, GPIO.HIGH)
    time.sleep(0.000015)
    GPIO.output(TRIG, GPIO.LOW)
    while not GPIO.input(ECHO):
        pass
    t1 = time.time()
    while GPIO.input(ECHO):
        pass
    t2 = time.time()
    return (t2 - t1) * 34000 / 2

client.loop_start()
try:
    while True:
        # print("Distance:%0.2f cm" % dist())
        client.publish("ultrasonic/distance", str(dist()), qos=1)
        time.sleep(1)
except KeyboardInterrupt:
    GPIO.cleanup()
