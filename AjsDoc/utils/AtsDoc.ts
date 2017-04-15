/* *************************************************************************
The MIT License (MIT)
Copyright (c)2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */

namespace AjsDoc {

    "use strict";

    /**
     * Translates node name to user friendly string
     * @param node
     */
    export function translateNodeKind(node: atsdoc.IATsDocNode, plural?: boolean): string {

        switch (node.kind) {

            case atsdoc.SyntaxKind.SourceFile:
                return plural ? "Source files" : "Source file";

            case atsdoc.SyntaxKind.ModuleDeclaration:
                if (node.nodeFlagsString && node.nodeFlagsString.indexOf("Namespace") !== -1) {
                    return plural ? "Namespaces" : "Namespace";
                } else {
                    return plural ? "Modules" : "Module";
                }

            case atsdoc.SyntaxKind.ClassDeclaration:
                return plural ? "Classes" : "Class";

            case atsdoc.SyntaxKind.InterfaceDeclaration:
                return plural ? "Interfaces" : "Interface";

            case atsdoc.SyntaxKind.FunctionDeclaration:
                return plural ? "Functions" : "Function";

            case atsdoc.SyntaxKind.VariableDeclaration:
                if (node.atsNodeFlagsString.indexOf("const") !== -1) {
                    return plural ? "Constants" : "Constant";
                } else {
                    return plural ? "Variables" : "Variable";
                }

            case atsdoc.SyntaxKind.Constructor:
                return plural ? "Constructors" : "Constructor";

            case atsdoc.SyntaxKind.PropertyDeclaration:
            case atsdoc.SyntaxKind.PropertySignature:
                return plural ? "Properties" : "Property";

            case atsdoc.SyntaxKind.GetAccessor:
                return plural ? "Accessors" : "Get Accessor";

            case atsdoc.SyntaxKind.SetAccessor:
                return plural ? "Accessors" : "Set Accessor";

            case atsdoc.SyntaxKind.MethodDeclaration:
                return plural ? "Methods" : "Method";

            case atsdoc.SyntaxKind.EnumDeclaration:
                return plural ? "Enumerations" : "Enumeration";

            case atsdoc.SyntaxKind.EnumMember:
                return plural ? "Enumeration members" : "Enumeration member";

            case atsdoc.SyntaxKind.TypeParameter:
                return plural ? "Type parameters" : "Type parameter";

            case atsdoc.SyntaxKind.IndexSignature:
                return plural ? "Index signatures" : "Index signature";

            case atsdoc.SyntaxKind.CallSignature:
                return plural ? "Call signatures" : "Call signature";

            default:
                return node.kindString;

        }

    }



}