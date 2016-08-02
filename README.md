# ThingsSDK CLI

## Install CLI

```bash
$ npm install thingssdk/thingssdk-cli -g
```

Note that this project uses [serialport](https://github.com/EmergingTechnologyAdvisors/node-serialport), which compiles to binary. You might need to install some prerequesites depending on your operating system.

## Usage

Plug your device in first. You'll need to pick the port you're using to generate the `devices.json` file.

```bash
$ thingssdk new path/to/project_name
```
