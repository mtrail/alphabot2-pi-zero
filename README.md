# alphabot2-pi-zero

Consolidated and tested examples for the alphabot2 pi zero2.

# Setup

## OS

Take the current raspian image and apply it to the sd-card. https://www.raspberrypi.com/software

Raspberry Pi Imager (v1.7.1)

- OS
    - Raspberry Pi OS (other)
        - RASPBERRY PI OS LITE (32-BIT)
- Einstellungen:
    - Hostname:alphabot2
    - SSH aktivieren -> Passwort (oder Key, wie ihr wollt)
    - Wifi einrichten
        - SSID: WLAN (euer WLAN)
        - Passwort: ****** (euer ELAN passwort)
        - Wifi-Land: CH (DE/RO)
    - ZeitZone usw. alles ausfüllen
- Speichern und danach auf "SCHREIBEN" klicken
    - dauert ein paar minuten bis das OS auf die Karte geschrieben ist.

Danach die Karte wieder in den alphabot einbauen

Ich musste das Pi 2x starten danach (beim 1. boot verändert er das filesystem, also wenns nicht klappt einfach nach 2 minuten strom weg und nochmal booten)

## Config

```sudo raspi-config``` <br>
8 Update (raspi-config updaten) <br>
3 Interface Options

- Enable
    - Legacy Camera
    - SPI
    - I2C

## Dependencies

Install the dependencies:

```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install -y fonts-wqy-zenhei python3-pip python3-smbus python3-serial build-essential python3-dev scons swig imagemagick libv4l-dev cmake git libjpeg-dev libtiff5-dev libjasper-dev wget libssl-dev ncurses-dev mosquitto nginx
sudo pip install RPi.GPIO spidev rpi_ws281x
```

## Sources

```
git clone https://github.com/mtrail/alphabot2-pi-zero.git
git clone https://github.com/jacksonliam/mjpg-streamer.git
cd ~/mjpg-streamer/mjpg-streamer-experimental
make
sudo make install
```

You could download the original sources (we have fixed versions in this repo thanks to Kay, so this is not needed)<br>
They are in /home/pi/alphabot2-pi-zero/examples

```
# cd
# wget https://www.waveshare.com/w/upload/7/74/AlphaBot2.tar.gz
# tar zxvf AlphaBot2.tar.gz
# wget https://www.waveshare.com/w/upload/c/c3/Rpi_ws281x-master.zip
# unzip rpi_ws281x-master.zip
```

## Config mqtt server and webserver

Start mqtt server (mosquitto) with listener on port 1883(tcp) and 8080(https/websocket).<br>
This also serves the files in /home/pi/alphabot2-pi-zero/www on http://alphabot2.local:8080/ <br>
So we can serve our ui there to controll the bot.<br>
Three url's are mapped:
- http://alphabot2.local:8080/ (ui for alphabot)
- http://alphabot2.local:8080/mqtt (mqtt over websocket for ui)
- http://alphabot2.local:8080/mjpeg (camera stream, if started)

```
sudo cp -fr ~/alphabot2-pi-zero/setup/mosquitto.conf /etc/mosquitto/conf.d
sudo systemctl restart mosquitto
sudo cp -fr ~/alphabot2-pi-zero/setup/nginx.conf /etc/nginx/conf.d
sudo systemctl restart nginx
```

## Test Camera

Rum mjpg_streamer on the pi:

- Only Camera Stream use http://alphabot2.local:8888/?action=stream:

```
mjpg_streamer -o "output_http.so -p 8888" -i "input_uvc.so"
```

- With Website around use http://alphabot2.local:8888/:

```
mjpg_streamer -o "output_http.so -p 8888 -w /home/pi/mjpg-streamer/mjpg-streamer-experimental/www" -i "input_uvc.so"
```

## Justify Servos

run this command to set the servos to their zero position:
```python ~/alphabot2-pi-zero/setup/servo0.py```

# Original Documentation

Page with Infos: https://www.waveshare.com/wiki/AlphaBot2

# Architecture

It has been a proven concept to use the same architecture for robots as for microservices, just in a smaller scope. So the main idea is to have a local message broker (ZMQ - Zero Message Queue for example) and then the sensors and actors communicate with each other over messages.

# Folder Structure

- root
    - driver
        - i2c
        - pca9685
    - controller
        - manual
        - obstacle-avoidance
    - actor
        - motor
        - gimbal
    - sensor
        - ir
        - camera
        - ultrasonic
        - movement