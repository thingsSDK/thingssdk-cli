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
