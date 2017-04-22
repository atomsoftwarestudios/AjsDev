var fs = require("fs");
var path = require("path");
var jsdom = require("jsdom");

var contentPath;
var rootPath;
var jsonPath;
var cssClass;

function usage() {
    console.log("");
    console.log("AjsDoc TOC generator");
    console.log("Copyright (c)2017 Atom Software Studios, All Rights Reserved");
    console.log("Released under the MIT license");
    console.log("");
    console.log("Usage:");
    console.log("");
    console.log("tocgen.js <content> <root_path> <output>");
    console.log("");
    console.log("content        Path to the root folder with the content");
    console.log("cssClass       CSS class of the index.html element containing <a href> TOC");
    console.log("root_path      Prefix for generated URL's (links) - can be full i.e. http://a.com/content/ or relative i.e. /content");
    console.log("ouput          Output JSON file");
    console.log("");
    process.exit(1);
}

function parseArgs() {
    if (process.argv.length < 5 || process.argv.length > 6) {
        usage();
    }

    // grab arguments
    contentPath = process.argv[2];
    cssClass = process.argv[3];
    rootPath = process.argv[4];
    jsonPath = process.argv[5];

    // check content dir exists
    if (!fs.existsSync(contentPath)) {
        console.error("Content path not found!");
        process.exit(2);
    }

}

function parseDom(window, indexPath, relPath, targetArray) {

    var document = window.document;
    var tocElements = document.getElementsByClassName(cssClass);
    if (tocElements.length !== 1) {
        console.error("Unable to locate the TOC class or multiple elements has this class assigned.");
        process.exit(4);
    }
    var aElements = tocElements[0].getElementsByTagName("a");

    for (var i = 0; i < aElements.length; i++) {

        var itemPath = aElements.item(i).getAttribute("href");
        var fsPath = path.normalize(indexPath + "/" + itemPath);

        if (!fs.existsSync(fsPath)) {
            console.error("Reffered file or directory not found '%s'", fsPath);
            console.log("Index File: %s", indexPath);
            process.exit(6);
        }

        var fstat = fs.statSync(fsPath);
        if (fstat.isDirectory()) {
            var childIndexFile = path.normalize(fsPath + "/index.html");
            if (!fs.existsSync(childIndexFile)) {
                console.error("index.html does not exist in reffered directory '%s'", itemPath);
                process.exit(7);
            }
            itemPath += "/index.html";
        }

        var url = rootPath + relPath + "/" + itemPath;
        while (url.indexOf("//") !== -1) {
            url = url.replace(/\/\//, "/");
        }

        var tocEntry = {
            label: aElements.item(i).innerHTML.trim(),
            path: url,
            children: []
        };

        targetArray.push(tocEntry);

        if (fstat.isDirectory()) {
            processDir(fsPath, tocEntry.children);
        }
    }

}


function parseIndex(indexPath, targetArray) {

    var rp1 = path.resolve(indexPath);
    var rp2 = path.resolve(contentPath);

    var relPath = rp1.substr(rp2.length).replace(/\\/g, "/");
    var indexFilePath = path.normalize(indexPath + "/index.html");

    if (!fs.existsSync(indexFilePath)) {
        console.log("index.html is missing at '%s'", indexPath);
        process.exit(3);
    }

    asyncCalls++;

    jsdom.env({
        file: indexFilePath,
        done: function (err, window) {
            if (err !== undefined && err !== null) {
                console.log("Failed to load HTML document: %s", err);
                process.exit(5);
            } else {
                parseDom(window, indexPath, relPath, targetArray);

                asyncCalls--;

                if (asyncCalls === 0) {

                    if (toc.toc.children.length > 0) {
                        toc.defaultPath = toc.toc.children[0].path;
                    }

                    if (jsonPath !== undefined) {
                        saveData(toc);
                    } else {
                        printData(toc);
                    }
                }
            }
        }
    });
}

function processDir(dirPath, targetArray, isRoot) {
    parseIndex(dirPath, targetArray, isRoot);
}

function saveData(data) {
    var json = JSON.stringify(data, null, 2);
    fs.writeFileSync(path.resolve(jsonPath), json, "utf-8");
}

function printData(data) {
    var json = JSON.stringify(data, null, 2);
    console.log(json);
}

// Entry point
var asyncCalls = 0;

parseArgs();
var toc = {
    defaultPath: "",
    toc: {
        children: []
    }
};
processDir(contentPath, toc.toc.children, true);
