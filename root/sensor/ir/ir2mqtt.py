import time

from RPi import GPIO
import paho.mqtt.client as mqtt

from irdecoder import IRDecoder
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

broker_address = "127.0.0.1"
client = mqtt.Client("Ir2Mqtt")
client.connect(broker_address)

global lastevent
lastevent = 0


def _change(pin):
    global lastevent
    now = time.time()
    duration = now - lastevent
    decoder.pulse(duration)
    lastevent = now


def event_func(address, command):
    client.publish("ir/" + str(address), str(command), qos=1)


decoder = IRDecoder()
GPIO.setup(17, GPIO.IN)
GPIO.add_event_detect(17, GPIO.BOTH, callback=_change)
decoder.addKeyPressedListener(event_func)

while True:
    time.sleep(1)
