# ThingsSDK CLI

thingsSDK CLI is a command line utility for generating and managing modern projects for JavaScript microcontroller runtimes.

Initial support is for Espruino with hopes to support others like Kinoma in the future.

## Install CLI

```bash
$ npm install thingssdk/thingssdk-cli -g
```

Note that this project uses [serialport](https://github.com/EmergingTechnologyAdvisors/node-serialport), which compiles to binary. You might need to install some prerequesites depending on your operating system.

## Usage

Plug your device in first and make sure you have the necessary drivers installed.

### New Project

Next to create a new project use the `new` command like so:

```bash
$ thingssdk new path/to/project_name
```

You'll be prompted to enter plug your device in if you haven't already and then select the device's serial port and baud rate.

If you know your device's port and baud rate already, use the `port` and `baud_rate` options:

```bash
$ thingssdk new path/to/project_name --port=COM3 --baud_rate=115200
```

### Getting Started with Your New Project

Your new project will now be found at `path/to/project_name`. You'll need to then install the dependencies.

```bash
$ npm install
```

`dependencies` in the new project `package.json` should be deployed to the device, `devDependancies` are what are used for your development workflow.

A `devices.json` file is created in the root of your new project. An entry is placed in your `.gitignore` because serial ports from computer to computer and developer to developer will differ.

### Deploying it to Your Device

To run the "Hello, world" sample project to your device(s) run the npm script `push`.

```bash
$ npm run push
```

The "Hello, world" script can be found in `main.js`. This script gets uploaded to your device and blinks the blue LED on the `ESP8266` board. It uses the `devices.json` file to know which devices to deploy the code to.

### Creating a `devices.json` file

To overwrite the current devices.json or create a new devices.json file in your project directory run the following command for an interactive prompt:

```bash 
$ thingssdk devices
```

Or with the flags `port` and `baud_rate` if you know them already.

```
$ thingssdk devices --port=COM3 --baud_rate=115200
```

This will generate a `devices.json` like this:

```javascript
{
  "devices": {
    "COM3": {
      "baud_rate": 115200,
      "runtime": "espruino"
    }
  }
}
```

### Warning for Unix users: ~/
Due to cross-platform compatibility issues, `~` does not resolve to your home directory on Unix systems. For example, suppose:

```bash
$ pwd
/home/<your user name>/some/subdirectory
```

Running
```bash
$ thingssdk new ~/path/to/project_name
```

Would produce the following result:

```bash
$ ls ~/path/to/project_name
ls: cannot access '/home/<your user name>/path/to/project_name': No such file or directory

$ ls ~/some/subdirectory/~/path/to/project_name
main.js package.json scripts
```

This is probably not your intended behavior! So `thingssdk` throws an Error for paths beginning with `~`, and a warning for paths containing `~` elsewhere.
