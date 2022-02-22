import paho.mqtt.client as mqtt
broker_address="127.0.0.1"
client = mqtt.Client("TestClient")
client.connect(broker_address)
client.publish("alphabot/example","Worked",qos=1)
client.publish("motor/left","0",qos=1)