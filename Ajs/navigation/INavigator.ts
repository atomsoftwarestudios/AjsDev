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

namespace Ajs.Navigation {

    "use strict";

    export let IINavigator: INavigator = DI.II;

    export interface INavigator {
        /** Last url the navigator captured during various events */
        readonly lastUrl: string;
        /** Returns list of registered #see [Redirections]{Ajs.Navigation.IRedirection} */
        readonly redirections: IRedirection[];
        /** Holds information if the navigator should process navigation events */
        canNavigate: boolean;
        /** Registers path for redirection */
        registerRedirection(path: string, target: string): void;
        /** Navigates to specified url */
        navigate(url: string): void;
        /** Can be used to simulate the navigation event occured */
        navigated(): void;
        /** Should be called every time the user click the link to navigate to correct location or open new tab / window */
        linkClicked(event: MouseEvent): boolean;
    }

}
