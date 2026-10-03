# CORE // OBD

A live car dashboard that runs in the browser and talks straight to a Bluetooth Low Energy OBD-II dongle. No app install, no server, no account. Pair the dongle, turn the key, and your gauges go live.

**Live site:** https://core.askaconsult.com

![CORE dashboard preview](og-image.png)

## What it does

- Real-time gauges and readouts: RPM, speed, coolant temp, intake temp, throttle, engine load, fuel level, MAF, battery voltage, timing advance, fuel pressure, run time
- Shift light that flashes past 6,200 RPM (redline shown at 6,500)
- Read and clear diagnostic trouble codes (DTCs)
- Two skins: **Classic** and **Night Runners** (switcher in the header, your choice is remembered)
- Demo mode with a simulated drive cycle, so you can explore every screen without a car
- MPH/km/h and °F/°C unit toggles, screen wake lock so the display stays on while you drive

## What you need

1. A **Bluetooth Low Energy (BLE)** OBD-II dongle — Bluetooth 4.0 or newer. Known-good class: Veepeak OBDCheck BLE / BLE+, Vgate iCar Pro BLE.
   - Classic Bluetooth (2.0/3.0 SPP) dongles **will not work** — browsers can only reach BLE devices.
2. Chrome or Edge on Android or desktop (Web Bluetooth support required).
3. Ignition on (engine running for live sensor data).

**iPhone:** Safari has no Web Bluetooth. Use a free Web Bluetooth browser app (e.g. WebBLE) to open the site, or use demo mode.

## Quick start

1. Plug the dongle into the OBD-II port (under the dash, driver's side).
2. Turn the ignition on.
3. Open https://core.askaconsult.com in Chrome or Edge.
4. Tap **Connect**, pick the dongle from the Bluetooth picker, and drive.

No dongle handy? Tap **Demo mode** on the connect screen.

## How it works

Pure client-side single page app — one `index.html`. It opens the dongle through the Web Bluetooth API, finds the ELM327 serial service over BLE GATT (it probes the common UART layouts: FFE0/FFE1, FFF0 family, Nordic UART), then speaks the ELM327 AT command set to pull PIDs and trouble codes. Nothing leaves the device; there is no backend.

```
index.html            the whole app (markup, styles, ELM327 protocol, gauges)
manifest.webmanifest  installable PWA metadata
og-image.png          share preview card
```

## Tested on

- 2015 Toyota Corolla S (target vehicle)
- ELM327 protocol logic unit-tested (PID parsers, DTC decode, response cleanup, error detection)

## Status

v1.0 — the app is live and the protocol layer is tested. The live Bluetooth path against real hardware is the next milestone: pair a dongle and report what you see.

## License

All rights reserved. Built by Aska Solutions — https://askaconsult.com/digital
