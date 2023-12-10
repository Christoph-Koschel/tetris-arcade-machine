# Tetris

This project the main repositroy for a Projectwork called Tetris Arcade Machine.

## Languages

- TypeScript
- HTML
- Bash

## Libraries / Frameworks

- [tsb](https://github.com/Christoph-Koschel/tsb) - _Christoph Koschel_ [GPL-3.0] \
  For parsing and bundling TypeScript into a browser-friendly JavaScript environment.
- [crontab](https://github.com/cronie-crond/cronie) [ISC, GPL-2.0, LGPL-2.1] \
  For running specified programs at scheduled times
- [sshpass](https://sourceforge.net/projects/sshpass/) - _thesun_ [Unknown/None] \
  For running ssh using the mode referred to as "keyboard-interactive" password authentication, but in non-interactive
  mode
- [electron](https://www.electronjs.org/) - [MIT] \
  Framework for creating desktop applications with Web-Languages
- [electron-packager](https://github.com/electron/packager) - [BSD-2-Clause License] \
  For packaging electron application into an OS-specific format

## Building

Here is a step-by-step guide to building the project:

1. Download and install the [NodeJS Runtime](https://nodejs.org/en). At least the version 18.18.0 must be used.
2. Download the source code
   via. git
   ```shell
   git clone https://github.com/Christoph-Koschel/tetris
   ```
   or download the branch [zip archive](https://github.com/Christoph-Koschel/tetris/archive/refs/heads/master.zip) from
   GitHub.
3. Open a terminal in the project folder
4. Install the TSB Build Toolchain
   ```shell
   npm install ./utils/tsb-2.0.0.tgz --global
   ```
5. Install dependencies
   ```shell
   npm install typescript --global
   sudo apt-get install sshpass
   ```  
6. Verify the installations
   ```shell
   tsb
   ```
   ```shell
   node --version
   ```
   ```shell
   tsc --version
   ```
   If the `tsb` and `tsc` commands cannot be found on your system, then check if the global npm folder is in the PATH
   Environment Variable included. (Windows: %AppData%\npm)
7. Go into the `src` directory and execute tsb
   ```shell
   cd ./src
   tsb build
   ```
8. Go back to the root and execute the build script
   ```shell
   cd ..
   ./scripts/build.sh
   ```
   Now if everything works fine, a file called tetris.tar.gz should exist in the root project.
9. Last push the build to a Raspberry Pi via. the push.sh script
   ```shell
   ./scripts/push.sh
   ```
   The Raspberry Pi needs a valid IPv4 address and an open ssh service port. When the push script is finished the
   Raspberry Pi restarts and the tetris game will start automatically after the boot process.