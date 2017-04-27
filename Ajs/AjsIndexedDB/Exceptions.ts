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

namespace Ajs.AjsIndexedDb {

    "use strict";

    /** Thrown when something goes wrong with initialization of AjsIndexedDb. See parent exception for details. */
    export class InitializationFailedException extends Exception { }

    /** Thrown when IndexedDB storage is asked to be created but is not supported */
    export class IndexedDBNotSupportedException extends Exception { }

    /** Thrown when IndexedDB storage fails to be openned */
    export class IndexedDBFailedToOpenException extends Exception { }

    /** Request to perform operation on IndexedDB was called but AjsIndexedDb was not initialized */
    export class IndexedDbNotInitializedException extends Exception { }

    /** Thrown when creation of the DB oject store fails. */
    export class FailedToCreateIndexedDbObjectStoreException extends Exception { }

    /** Thrown when operation above named object store was requested but the store does not exist */
    export class StoreNotExitsException extends Exception { }

    /** Thrown when the request to some DB or store operation fails */
    export class IndexedDbStoreRequestFailedException extends Exception { }

    /** Thrown when setVersion fails for old chromiums / FF'es */
    export class IndexedDbOldFailedToSetVersionException extends Exception { }
}
