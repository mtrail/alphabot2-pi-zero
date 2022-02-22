import time

from RPi import GPIO
import paho.mqtt.client as mqtt

from irdecoder import IRDecoder
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
DR = 16
DL = 19
GPIO.setup(DR,GPIO.IN,GPIO.PUD_UP)
GPIO.setup(DL,GPIO.IN,GPIO.PUD_UP)

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
client.loop_start()

DR_status_last = 0
DL_status_last = 0
while True:
    DR_status = GPIO.input(DR)
    if DR_status_last != DR_status:
        client.publish("ir/dr", str(DR_status), qos=1)
        DR_status_last=DR_status
    DL_status = GPIO.input(DL)
    if DL_status_last != DL_status:
        client.publish("ir/dl", str(DL_status), qos=1)
        DL_status_last=DL_status
    time.sleep(0.01)
