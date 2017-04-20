# Hello World! Example
#### The Ajs Framework Example Application

Copyright &copy;2017 Atom Software Studios<br>
Released under the MIT License

---

Table of Contents

- [Introduction](#introduction)
- [Configuration](#configuration)
- [Template & Visual Components](#template-visual-components)

---

#### Introduction

Please note this description relates to Visual Studio Project!

HelloWorld application is the simplest possible application using the Ajs Framework. It is consisted from the
application class used for configuration and single template file containing only the one view component.

The Visual Studio Solution contains two projects:
- HelloWorld
  - Implementation of the application
- AjsWebApp
  - Ajs Application Builder
  - MUST BE SET AS STARTUP PROJECT! (Right click on it in the Solution Explorer and choose Set as Startup Project option from the context menu)

**Visual Studio Solution**

is prepared to be immediately compilable and executable. Only the one exception is the AjsWebApp project must be
set as startup project. So, don't worry to start it up by pressing F5.

**The HelloWorld project**

contains the following important files:

File                     | Description
-----------------------  | -----------
index.html               | Simplest possible valid index HTML file
ajs.js                   | Ajs Framework library
ajs.lib.js               | Ajs Framework extensions (i.e. Promise polyfill and source-map polyfill for debugging)
HelloWorldApplication.ts | The application itself, it actually implements only _onConfigure method as the rest of tasks are performed in parent Ajs.App.Application class
tsconfig.json            | This file is generated automatically when the project is built. It just reffers the Debug or Release file based on the Solution configuration
tsconfig.common.json     | This file can be considered as the main tsconfig. It defines common TypeScript compiler options for both, debug and release configurations
tsconfig.Debug.json      | Reffers to tsconfig.common.json and contains TypeScript compiler options for the Debug solution settings
tsconfig.Release.json    | Reffers to tsconfig.common.json and contains TypeScript compiler options for the Debug solution settings

These files are organized in the recommended folder structure.

Static web resources are placed in the wwwroot folder. As templates are static resources too the default.html template file is also
stored under this directory tree, actually under the /wwwroot/templates folder.

**The AjsWebapp project**

is a development tool and its files should not be changed for this example.
This tool used to (out of others) build the final www application, continuously monitor file changes and apply them to the
output folder and many other tasks. For detatails reffer to its [GitHub repository](https://github.com/atomsoftwarestudios/AjsWebApp).

In this example it is not neccessary to take this project and its configuration into account.

---

### Configuration

The HelloWorldApplication class contains configuration of:

- templates to be loaded during the startup
  - Its actually just one template file, default.html:

```
    templates.direct = [
        "/templates/default.html"
    ];
```

templates.direct means the template will be loaded directly from the server using the HTTP GET request without any
framework related caching involved.

- router configuration
  - there is just single route configured. Its a default route used for all requests and says to router to load and show the
WelcomeComponent view component for all browser requests.

```
    {
        paths: [{ base: ".*", params: "" }],
        viewComponentName: "WelcomeComponent"
    }
```

---

### Template & Visual components

Only single Visual Component is declared in this project and it is the WelcomeComponent. It can be considered as a static
component as it does not contain any event handlers or parameters to be replaced. This component is defined within the
default.html template file under the AjsApp template.

---

### Experiments

TBD