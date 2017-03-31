﻿namespace atsdoc {

    export enum SyntaxKind {
        Unknown = 0,
        EndOfFileToken = 1,
        SingleLineCommentTrivia = 2,
        MultiLineCommentTrivia = 3,
        NewLineTrivia = 4,
        WhitespaceTrivia = 5,
        ShebangTrivia = 6,
        ConflictMarkerTrivia = 7,
        NumericLiteral = 8,
        StringLiteral = 9,
        JsxText = 10,
        RegularExpressionLiteral = 11,
        NoSubstitutionTemplateLiteral = 12,
        TemplateHead = 13,
        TemplateMiddle = 14,
        TemplateTail = 15,
        OpenBraceToken = 16,
        CloseBraceToken = 17,
        OpenParenToken = 18,
        CloseParenToken = 19,
        OpenBracketToken = 20,
        CloseBracketToken = 21,
        DotToken = 22,
        DotDotDotToken = 23,
        SemicolonToken = 24,
        CommaToken = 25,
        LessThanToken = 26,
        LessThanSlashToken = 27,
        GreaterThanToken = 28,
        LessThanEqualsToken = 29,
        GreaterThanEqualsToken = 30,
        EqualsEqualsToken = 31,
        ExclamationEqualsToken = 32,
        EqualsEqualsEqualsToken = 33,
        ExclamationEqualsEqualsToken = 34,
        EqualsGreaterThanToken = 35,
        PlusToken = 36,
        MinusToken = 37,
        AsteriskToken = 38,
        AsteriskAsteriskToken = 39,
        SlashToken = 40,
        PercentToken = 41,
        PlusPlusToken = 42,
        MinusMinusToken = 43,
        LessThanLessThanToken = 44,
        GreaterThanGreaterThanToken = 45,
        GreaterThanGreaterThanGreaterThanToken = 46,
        AmpersandToken = 47,
        BarToken = 48,
        CaretToken = 49,
        ExclamationToken = 50,
        TildeToken = 51,
        AmpersandAmpersandToken = 52,
        BarBarToken = 53,
        QuestionToken = 54,
        ColonToken = 55,
        AtToken = 56,
        EqualsToken = 57,
        PlusEqualsToken = 58,
        MinusEqualsToken = 59,
        AsteriskEqualsToken = 60,
        AsteriskAsteriskEqualsToken = 61,
        SlashEqualsToken = 62,
        PercentEqualsToken = 63,
        LessThanLessThanEqualsToken = 64,
        GreaterThanGreaterThanEqualsToken = 65,
        GreaterThanGreaterThanGreaterThanEqualsToken = 66,
        AmpersandEqualsToken = 67,
        BarEqualsToken = 68,
        CaretEqualsToken = 69,
        Identifier = 70,
        BreakKeyword = 71,
        CaseKeyword = 72,
        CatchKeyword = 73,
        ClassKeyword = 74,
        ConstKeyword = 75,
        ContinueKeyword = 76,
        DebuggerKeyword = 77,
        DefaultKeyword = 78,
        DeleteKeyword = 79,
        DoKeyword = 80,
        ElseKeyword = 81,
        EnumKeyword = 82,
        ExportKeyword = 83,
        ExtendsKeyword = 84,
        FalseKeyword = 85,
        FinallyKeyword = 86,
        ForKeyword = 87,
        FunctionKeyword = 88,
        IfKeyword = 89,
        ImportKeyword = 90,
        InKeyword = 91,
        InstanceOfKeyword = 92,
        NewKeyword = 93,
        NullKeyword = 94,
        ReturnKeyword = 95,
        SuperKeyword = 96,
        SwitchKeyword = 97,
        ThisKeyword = 98,
        ThrowKeyword = 99,
        TrueKeyword = 100,
        TryKeyword = 101,
        TypeOfKeyword = 102,
        VarKeyword = 103,
        VoidKeyword = 104,
        WhileKeyword = 105,
        WithKeyword = 106,
        ImplementsKeyword = 107,
        InterfaceKeyword = 108,
        LetKeyword = 109,
        PackageKeyword = 110,
        PrivateKeyword = 111,
        ProtectedKeyword = 112,
        PublicKeyword = 113,
        StaticKeyword = 114,
        YieldKeyword = 115,
        AbstractKeyword = 116,
        AsKeyword = 117,
        AnyKeyword = 118,
        AsyncKeyword = 119,
        AwaitKeyword = 120,
        BooleanKeyword = 121,
        ConstructorKeyword = 122,
        DeclareKeyword = 123,
        GetKeyword = 124,
        IsKeyword = 125,
        KeyOfKeyword = 126,
        ModuleKeyword = 127,
        NamespaceKeyword = 128,
        NeverKeyword = 129,
        ReadonlyKeyword = 130,
        RequireKeyword = 131,
        NumberKeyword = 132,
        ObjectKeyword = 133,
        SetKeyword = 134,
        StringKeyword = 135,
        SymbolKeyword = 136,
        TypeKeyword = 137,
        UndefinedKeyword = 138,
        FromKeyword = 139,
        GlobalKeyword = 140,
        OfKeyword = 141,
        QualifiedName = 142,
        ComputedPropertyName = 143,
        TypeParameter = 144,
        Parameter = 145,
        Decorator = 146,
        PropertySignature = 147,
        PropertyDeclaration = 148,
        MethodSignature = 149,
        MethodDeclaration = 150,
        Constructor = 151,
        GetAccessor = 152,
        SetAccessor = 153,
        CallSignature = 154,
        ConstructSignature = 155,
        IndexSignature = 156,
        TypePredicate = 157,
        TypeReference = 158,
        FunctionType = 159,
        ConstructorType = 160,
        TypeQuery = 161,
        TypeLiteral = 162,
        ArrayType = 163,
        TupleType = 164,
        UnionType = 165,
        IntersectionType = 166,
        ParenthesizedType = 167,
        ThisType = 168,
        TypeOperator = 169,
        IndexedAccessType = 170,
        MappedType = 171,
        LiteralType = 172,
        ObjectBindingPattern = 173,
        ArrayBindingPattern = 174,
        BindingElement = 175,
        ArrayLiteralExpression = 176,
        ObjectLiteralExpression = 177,
        PropertyAccessExpression = 178,
        ElementAccessExpression = 179,
        CallExpression = 180,
        NewExpression = 181,
        TaggedTemplateExpression = 182,
        TypeAssertionExpression = 183,
        ParenthesizedExpression = 184,
        FunctionExpression = 185,
        ArrowFunction = 186,
        DeleteExpression = 187,
        TypeOfExpression = 188,
        VoidExpression = 189,
        AwaitExpression = 190,
        PrefixUnaryExpression = 191,
        PostfixUnaryExpression = 192,
        BinaryExpression = 193,
        ConditionalExpression = 194,
        TemplateExpression = 195,
        YieldExpression = 196,
        SpreadElement = 197,
        ClassExpression = 198,
        OmittedExpression = 199,
        ExpressionWithTypeArguments = 200,
        AsExpression = 201,
        NonNullExpression = 202,
        MetaProperty = 203,
        TemplateSpan = 204,
        SemicolonClassElement = 205,
        Block = 206,
        VariableStatement = 207,
        EmptyStatement = 208,
        ExpressionStatement = 209,
        IfStatement = 210,
        DoStatement = 211,
        WhileStatement = 212,
        ForStatement = 213,
        ForInStatement = 214,
        ForOfStatement = 215,
        ContinueStatement = 216,
        BreakStatement = 217,
        ReturnStatement = 218,
        WithStatement = 219,
        SwitchStatement = 220,
        LabeledStatement = 221,
        ThrowStatement = 222,
        TryStatement = 223,
        DebuggerStatement = 224,
        VariableDeclaration = 225,
        VariableDeclarationList = 226,
        FunctionDeclaration = 227,
        ClassDeclaration = 228,
        InterfaceDeclaration = 229,
        TypeAliasDeclaration = 230,
        EnumDeclaration = 231,
        ModuleDeclaration = 232,
        ModuleBlock = 233,
        CaseBlock = 234,
        NamespaceExportDeclaration = 235,
        ImportEqualsDeclaration = 236,
        ImportDeclaration = 237,
        ImportClause = 238,
        NamespaceImport = 239,
        NamedImports = 240,
        ImportSpecifier = 241,
        ExportAssignment = 242,
        ExportDeclaration = 243,
        NamedExports = 244,
        ExportSpecifier = 245,
        MissingDeclaration = 246,
        ExternalModuleReference = 247,
        JsxElement = 248,
        JsxSelfClosingElement = 249,
        JsxOpeningElement = 250,
        JsxClosingElement = 251,
        JsxAttribute = 252,
        JsxSpreadAttribute = 253,
        JsxExpression = 254,
        CaseClause = 255,
        DefaultClause = 256,
        HeritageClause = 257,
        CatchClause = 258,
        PropertyAssignment = 259,
        ShorthandPropertyAssignment = 260,
        SpreadAssignment = 261,
        EnumMember = 262,
        SourceFile = 263,
        Bundle = 264,
        JSDocTypeExpression = 265,
        JSDocAllType = 266,
        JSDocUnknownType = 267,
        JSDocArrayType = 268,
        JSDocUnionType = 269,
        JSDocTupleType = 270,
        JSDocNullableType = 271,
        JSDocNonNullableType = 272,
        JSDocRecordType = 273,
        JSDocRecordMember = 274,
        JSDocTypeReference = 275,
        JSDocOptionalType = 276,
        JSDocFunctionType = 277,
        JSDocVariadicType = 278,
        JSDocConstructorType = 279,
        JSDocThisType = 280,
        JSDocComment = 281,
        JSDocTag = 282,
        JSDocAugmentsTag = 283,
        JSDocParameterTag = 284,
        JSDocReturnTag = 285,
        JSDocTypeTag = 286,
        JSDocTemplateTag = 287,
        JSDocTypedefTag = 288,
        JSDocPropertyTag = 289,
        JSDocTypeLiteral = 290,
        JSDocLiteralType = 291,
        JSDocNullKeyword = 292,
        JSDocUndefinedKeyword = 293,
        JSDocNeverKeyword = 294,
        SyntaxList = 295,
        NotEmittedStatement = 296,
        PartiallyEmittedExpression = 297,
        MergeDeclarationMarker = 298,
        EndOfDeclarationMarker = 299,
        Count = 300,
        FirstAssignment = 57,
        LastAssignment = 69,
        FirstCompoundAssignment = 58,
        LastCompoundAssignment = 69,
        FirstReservedWord = 71,
        LastReservedWord = 106,
        FirstKeyword = 71,
        LastKeyword = 141,
        FirstFutureReservedWord = 107,
        LastFutureReservedWord = 115,
        FirstTypeNode = 157,
        LastTypeNode = 172,
        FirstPunctuation = 16,
        LastPunctuation = 69,
        FirstToken = 0,
        LastToken = 141,
        FirstTriviaToken = 2,
        LastTriviaToken = 7,
        FirstLiteralToken = 8,
        LastLiteralToken = 12,
        FirstTemplateToken = 12,
        LastTemplateToken = 15,
        FirstBinaryOperator = 26,
        LastBinaryOperator = 69,
        FirstNode = 142,
        FirstJSDocNode = 265,
        LastJSDocNode = 294,
        FirstJSDocTagNode = 281,
        LastJSDocTagNode = 294,
    }

    export enum NodeFlags {
        None = 0,
        Let = 1,
        Const = 2,
        NestedNamespace = 4,
        Synthesized = 8,
        Namespace = 16,
        ExportContext = 32,
        ContainsThis = 64,
        HasImplicitReturn = 128,
        HasExplicitReturn = 256,
        GlobalAugmentation = 512,
        HasAsyncFunctions = 1024,
        DisallowInContext = 2048,
        YieldContext = 4096,
        DecoratorContext = 8192,
        AwaitContext = 16384,
        ThisNodeHasError = 32768,
        JavaScriptFile = 65536,
        ThisNodeOrAnySubNodesHasError = 131072,
        HasAggregatedChildData = 262144,
        BlockScoped = 3,
        ReachabilityCheckFlags = 384,
        ReachabilityAndEmitFlags = 1408,
        ContextFlags = 96256,
        TypeExcludesFlags = 20480,
    }

    export enum ModifierFlags {
        None = 0,
        Export = 1,
        Ambient = 2,
        Public = 4,
        Private = 8,
        Protected = 16,
        Static = 32,
        Readonly = 64,
        Abstract = 128,
        Async = 256,
        Default = 512,
        Const = 2048,
        HasComputedFlags = 536870912,
        AccessibilityModifier = 28,
        ParameterPropertyModifier = 92,
        NonPublicAccessibilityModifier = 24,
        TypeScriptModifier = 2270,
        ExportDefault = 513,
    }

    export enum ObjectFlags {
        Class = 1,
        Interface = 2,
        Reference = 4,
        Tuple = 8,
        Anonymous = 16,
        Mapped = 32,
        Instantiated = 64,
        ObjectLiteral = 128,
        EvolvingArray = 256,
        ObjectLiteralPatternWithComputedProperties = 512,
        NonPrimitive = 1024,
        ClassOrInterface = 3,
    }

    export enum TypeFlags {
        Any = 1,
        String = 2,
        Number = 4,
        Boolean = 8,
        Enum = 16,
        StringLiteral = 32,
        NumberLiteral = 64,
        BooleanLiteral = 128,
        EnumLiteral = 256,
        ESSymbol = 512,
        Void = 1024,
        Undefined = 2048,
        Null = 4096,
        Never = 8192,
        TypeParameter = 16384,
        Object = 32768,
        Union = 65536,
        Intersection = 131072,
        Index = 262144,
        IndexedAccess = 524288,
        NonPrimitive = 16777216,
        Literal = 480,
        StringOrNumberLiteral = 96,
        PossiblyFalsy = 7406,
        StringLike = 262178,
        NumberLike = 340,
        BooleanLike = 136,
        EnumLike = 272,
        UnionOrIntersection = 196608,
        StructuredType = 229376,
        StructuredOrTypeVariable = 1032192,
        TypeVariable = 540672,
        Narrowable = 17810431,
        NotUnionOrUnit = 16810497,
    }

    /* tslint:disable */
    export enum ATsDocNodeFlags {
        let = 1 << 0,
        var = 1 << 1,
        const = 1 << 2,
    }
    /* tslint:enable */

    /**
     * Documentation type node (simplified AST node)
     */
    export interface IATsDocType {
        parent: IATsDocNode;

        name: string;
        fqdn?: string;
        flags: TypeFlags;
        flagsString: string[];
        objectFlags?: ObjectFlags;
        objectFlagsString?: string[];
        types?: IATsDocType[];
        constraint?: IATsDocType;
        callSignatures?: IATsDocNode[];
    }

    /**
     * Documentation node (simplified AST node)
     */
    export interface IATsDocNode {
        parent: IATsDocNode;

        kind: SyntaxKind;
        kindString: string;
        commentShort?: string;
        commentLong?: string;
        children: IATsDocNode[];
        file?: string;

        name?: string;
        fqdn?: string;
        atsNodeFlags?: ATsDocNodeFlags;
        atsNodeFlagsString?: string[];
        nodeFlags?: NodeFlags;
        nodeFlagsString?: string[];
        modifierFlags?: ModifierFlags;
        modifierFlagsString?: string[];
        type?: IATsDocType;
        initializer?: string;
        constraint?: IATsDocType;
        moduleReference?: string;
        members?: IATsDocNode[];
        parameters?: IATsDocNode[];
        typeParameters?: IATsDocType[];
        returnType?: IATsDocType;
        optional?: boolean;
        restParameter?: boolean;
        extends?: IATsDocType;
        implements?: IATsDocType[];
    }

}
