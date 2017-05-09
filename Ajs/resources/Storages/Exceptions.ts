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

namespace Ajs.Resources {

    "use strict";

    /** Thrown when local storage is requested to be initialized but it is not supported by the runtime */
    export class LocalStorageNotSupportedException extends Exception { }

    /** Thrown when session storage is requested to be initialized but it is not supported by the runtime */
    export class SessionStorageNotSupportedException extends Exception { }

    /** Thrown when indexed storage is requested to be initialized but it is not supported by the runtime */
    export class IndexedDbStorageNotSupportedException extends Exception { }

    /** Storage is out of space or the resource can't fit the storage */
    export class NotEnoughSpaceInStorageException extends Exception { }

    /** Storage type requested is not valid */
    export class InvalidStorageTypeException extends Exception { }

    /** Thrown when initialize on the StorageIndexedDb is called without previously setting the db property*/
    export class AjsIndexedDbNotSetException extends Exception { }

}
