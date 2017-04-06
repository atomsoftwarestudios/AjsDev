All library files in this folder will be included into resuled compiled JavaScript file.
This is ensured by the allowJs and outFile parameters of the tsconfig file (can be find
in the tsconfig.common.json)

If there is a need the libraries are loaded, parsed and executed in defined order use
the numeric prefic before the library file name.
