/* *************************************************************************
The MIT License (MIT)
Copyright (c)2016-2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */

///<reference path="./Types.ts" />
///<reference path="./DI/II.ts" />
///<reference path="./App/Application.Decorator.ts" />
///<reference path="./MVVM/ViewModel/viewcomponent.Decorator.ts" />

/**
 * The top level Ajs Framework namespace
 * Contains all other framework related namespaces, global framework variables and constants,
 * Exception class declaration and interfaces for Ajs and Ajs Boot config objects
 */
namespace Ajs {

    "use strict";

    /** The Ajs Framework product name */
    export const productName: string = "Ajs Framework";

    /** The Ajs Framework version */
    export const version: string = "1.0.0 alfa";

    /** The Ajs Framework copyright information */
    export const copyright: string = "(c)2016-2017 Atom Software Studios";

    /** The Ajs Framework license information */
    export const license: string = "Released under the MIT license";

    /*
    Configuration variables
    */

    /** Holds the boot configuration object */
    export let bootConfig: IAjsBootConfig = <any>{};

    /** Holds the Ajs Framework configuration object */
    export let ajsConfig: IAjsConfig = <any>{};

    /** Holds the Application configuration object */
    export let appConfig: any = {};

    /*
    Overridable functions
    */

    /** Overridable function which is called from boot loader to configure the boot */
    export let configureBoot: (config: Ajs.Boot.IBootConfig) => void;

    /** Overridable function which is called from boot loader to configure the framework */
    export let configureFramework: (config: Ajs.IAjsConfig) => void;

    /** Overridable function which is called from boot loader to configure the application */
    export let configureApp: (config: any) => void;

    /*
    Globally accessible decorators
    */

    /** Ajs.application decorator is used to mark the application class declaration in order the framework can locate it */
    export let application: Function = Ajs.App.application;

    /** Ajs.viewcomponent attribute is used to mark view components which should be automatically registered to View Component manager */
    export let viewcomponent: Function = Ajs.MVVM.ViewModel.viewcomponent;

    /* 
    Instances of global Ajs singleton objects
    */

    /** Holds reference to the DI container. It shoudld not be used directly, just injected! */
    export let container: Ajs.DI.IContainer;

    /* 
    Debugging tools available through Ajs. in the browser console
    */

    /**
     * Holds reference to the Ajs Debugging Console
     * it is possible to issue Ajs.ajsconsole.show() and Ajs.ajsconsole.hide() from the
     * browser debug console to show/hide the Ajs Debug Console window.
     */
    export let ajsconsole: Ajs.Dbg.IConsole;

    /* 
    Information collected using decorators before Ajs is up
    */

    /** Holds list of view components to be registered once the ViewComponentManager is ready */
    export let viewComponentsToRegister: MVVM.ViewModel.IViewComponentStateMethods[] = [];

}
