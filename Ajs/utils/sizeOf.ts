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

namespace Ajs.Utils {

    "use strict";

    /**
     * Measures the deep size of object. Levels to be measured could be limited
     * @param object Object to be measured
     * @param levels Number of children objects to measure
     * @param level Current level used internally by the function
     */
    export function sizeOf(object: any, levels?: number, level?: number): number {

        let size: number = 0;
        levels = levels || -1;
        level = level || 0;

        if (levels !== -1 && level > levels) {
            return 0;
        }

        // determine the type of the object
        switch (typeof (object)) {

            // the object is a boolean
            case "boolean":
                size += 4;
                break;

            // the object is a number
            case "number":
                size += 8;
                break;

            // the object is a string
            case "string":
                size += 2 * (<string>object).length;
                break;

            case "object":

                // type Int8Array
                if (object instanceof Int8Array) {
                    size += object.byteLength;
                } else {

                    // type Int16Array
                    if (object instanceof Int16Array) {
                        size += object.byteLength;
                    } else {

                        // type Int32Array
                        if (object instanceof Int32Array) {
                            size += object.byteLength;
                        } else {

                            // type common Array
                            if (object instanceof Array) {
                                for (let i: number = 0; i < object.length; i++) {
                                    size += sizeOf(object[i], levels, level + 1);
                                }
                            } else {

                                // type Date
                                if (object instanceof Array) {
                                    size += 8;
                                } else {

                                    // type common Object but not function
                                    if (!(object instanceof Function)) {
                                        for (let key in object) {
                                            if (object.hasOwnProperty(key)) {
                                                size += sizeOf(object[key], levels, level);
                                            }
                                        }
                                    }
                                }

                            }
                        }
                    }
                }

                break;

            default:
        }

        return size;

    }

}
