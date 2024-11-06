# Garage Door Opener

## About

This is a web app for use with a Raspberry Pi. It uses a relay to trigger a garage door opener to open and close.

## Install & Run

Installs the server & client dependencies, runs locally on `:3000`.

```
# Installation directory.
mkdir -p /usr/local/garagedoor
git clone https://github.com/dangffn/GarageDoorOpener

# Install deps and run.
cd app/
npm install
npm run start

# Install as a service.
cp /usr/local/garagedoor/web.service /etc/systemd/system/
systemctl enable --now web.service
```