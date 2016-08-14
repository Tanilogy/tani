# tani

Commandline tool for generating data sets for Tani dialects.

## System requirements

The current version works only on Mac and Linux.

## Understanding the directories and files

`tani` expects to find a directory named `concepts`, where directories/sub-directories of concept definition files are stored.

A concept definition file is just a `.txt` file with the following structure.

```
Concise definition.

[Note: Special note]

[Eg: word = definition; in tribe/locality]
```

For example:

```
Good to experience

Note: Used for describing quality of being.

Eg: kaa[pyo] = beautiful; in tanw/hari
Eg: kaa[ken] = beautiful; in galo/aalo
Eg: kam[po] = beautiful; in adi/pasighat
```

Dialect files, and hence queries, are created from these concept files.

## Adding a new dialect

A dialect is identified using the tribe and locality (`<tribe>/<locality>`).

```
tani init apatani/hari
```

This will create the `apatani/hari` dialect directory under the `dialects` dir at the root of the project. The corresponding dialect files for the `tribe/locality` will be generated from the `concepts` directory.

This command merely generates the dialect files, the files need to be edited to make entries for the dialect by experts in the dialect.

A dialect can be initialized from an existing dialect, this saves time in making entries when the dialects have a lot of similarities.

```
tani init apatani/hija from apatani/hari
```

The dialect files for `apatani/hija` will be created by copying the contents of `apatani/hari`.

## Compiling

Concept and dialect files files have to be compiled to generate the query files. Only query files can be `publish`ed.

(re)Compile concepts:

```
tani compile --concepts
```

(re)Compile a dialect:

```
tani compile apatani/hari
```

(re)Compile a everything:

```
tani compile --all
```

The generated `queries` directory can be regenarated using the `compile` command, so the directory should be put in `.gitignore`.

## Syncing dialect files with new concepts

New concepts may be added to the `concepts` directory, to add them to a dialect:

```
tani sync apatani/hari
```

Update all dialects:

```
tani sync --all
```

## Adding concepts to the concepts directory

```
tani add n
```

## Publishing the queries

Execute the following command at the root of the `queries` directory:

```
tani publish
```

This command needs to be rub whenever queries are compiled.


dialect files - text file under dialects/tribe/locality, which contain root word information
concept files - acf files under system/concepts which contain
query files - acf query files under system/queries/tribe/path

## tani tool

$ tani reset galo/aalo <-- delete everyting and set up dirs and files for galo tribe and aalo locality based on files existing in constructs
$ tani delete galo/tato <-- delete galo/tato

$ tani consolidate v | vm | n | nm | adj | adjm <-- definitions in one file

$ tani goto constructs
$ tani list v | vm | n | nm - what are the available entries

$ tani checkout tanw/hari
$ tani list v | vm | n | nm
$ tani list v2 <-- see entry for v2
$ tani add v2:mw:a note:way of doing <-- to edit, just add - will overwrite
$ tani delete v2
$ tani delete v2a
$ tani rename v2a v2

