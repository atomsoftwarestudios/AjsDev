# AjsDoc
#### TypeScript documentation browser

Copyright &copy;2016-2017 Atom Software Studios<br>
Released under the MIT License

---

Currently, there are two examples running publicly:

http://ajsfw.azurewebsites.net - logging off

http://ajsdoc.azurewebsites.net - logging on (console will popup 15s after refresh, its quiet expensive but logging to memory only)

both versions are not optimized from the size perspective (no uglify or other tools used yet) and are cappable of running offline in browser or as a web app for mobiles (icon on homescreens).

The latest version of the AjsDoc is currently included in the [AjsDev repository](https://github.com/atomsoftwarestudios/AjsDev) at least
until the framework version 1.0.0 will be released.

---

### Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Visual Studio prerequisites & setup](#visual-studio-prerequisites--setup)
- [Build](#build)
- [Usage](#usage)
- [Known bugs](#known-bugs)
- [License](#license)
- [Contribution](#contribution)

---

### Introduction

AjsDoc is the TypeScript documentation browser including guides and examples. It was developed as one of example application
using the Ajs Framework.

The AjsDoc is single page web application without need of any specific backends. The pure web server configured to support
the Ajs Single Page applications is required (see http://ajsfw.azurewebsites.net/Web-Server-Requirements-and-Configuration) for
details.

The JSON documentation data for AjsDoc are required to be generated with the [AtsDoc](https://github.com/atomsoftwarestudios/AtsDoc)
Node.js command line utility.

---

### Features

- Guide & Examples
      - HTML based reference guide
      
- Reference guide
      - Generated from TypeScript code using TypeDoc
      - JsDoc with HTML markup documentation supported
      
- HTML Code (both, static & code documentation)
   - Supported tags:
      - #example [label]{url}
         - Includes the example to the HTML code (make sure the code is HTML escaped so < > & and others  are properly replaced)
      - #chart [label]{url}
         - Includes svg chart to the HTML code
      - #see [label]{ulr}
        - Inserts anchor link to the HTML code

- Ajs Feature Examples (directly in the code)
   - Complete offline application support
   - Boot process and configuration
   - Dependency injection container usage
   - InitialProgressBar
   - Exception handling
   - Application resource loading and management
   - Templating
   - Visual State management
   - Visual State transition
   - View Component state management
   - Session state management
   - Data models
   - Debugging tools

- Tools
   - tocgen.ps1 (powershell) -> generator of the toc.json file from the folder structure of the static html documents

---

### Visual Studio prerequisites & setup

- The Visual Studio should be in version 2015 (Enterprise, Professional, Community) - curently tested with Enterprise version only.

- The TypeScript 2.2.1 extension must be installed (https://www.typescriptlang.org/#download-links)

- GitHub extension for Visual Studio is highly recommended (https://visualstudio.github.com/)

---

### Build

The project is the Visual Studio solution 2015 and should not be a problem to clone:

```
https://github.com/atomsoftwarestudios/AjsDoc.git
```

compile it and run/debug in both, debug and release vesrions under the local IIS Express.

Please, report all issues with the compilation and running here on GitHub.

---

### Usage

```
Please note the implementation of template(s) for all types is not currently complete. Feel free to contibute.
```

#### Obtaining the package and deploying to the Web Server

##### Web Server Configuration

The pure web server configured to support the Ajs Single Page applications is required (see http://ajsfw.azurewebsites.net/Web-Server-Requirements-and-Configuration)

##### Configuration

The JSON data grabbed from the AtsDoc must be provided. The JSDoc code documentation can contain HTML tags to
format the output as required.

---

### Project management, Known bugs, change log

The project is managed using the [GitHub project system](https://github.com/atomsoftwarestudios/AjsDoc/projects/1)

Issues are managed using the [GitHub issue system](https://github.com/atomsoftwarestudios/AjsDoc/issues)

[Change log](https://github.com/atomsoftwarestudios/AjsDoc/issues?q=is%3Aopen+is%3Aissue+label%3A%22Change+Log%22) is also part of the GitHub issue system

---

### License

For details see the [License]{./LICENSE} file

---

### Contribution

Contibution is more than welcome.
