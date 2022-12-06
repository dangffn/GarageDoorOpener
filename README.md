# Garage Door Opener

## About

This web app installs on a Raspberry Pi and uses a relay to trigger a garage door opener to open and close

## Installation

The following system packages need to be installed for camera support on the Pi (tested on a Raspberry Pi Zero 2)

```bash
sudo apt install libatlas-base-dev libjasper-dev libhdf5-dev
```

Copy this directory into the `/opt/garagedoor/` folder

Install Python dependencies

```bash
pip3 install -r /opt/garagedoor/requirements.txt
```

Install and enable the videosocket service

```bash
cp /opt/garagedoor/videosocket.service /lib/systemd/system/
systemctl enable && systemctl start videosocket.service
```
