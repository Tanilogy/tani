# tani

Commandline tool for generating data sets


## Initializing the system

Before the system can be initialized, `tani` expects to find a directory named `concepts`, where directories/sub-directories of concept definition files are stored.

A concept definition file is just a .txt file with the following structure.

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

Initialize the system:

```
tani init --system
```

## Adding a new dialect

A dialect is identified using the tribe and locality (`<tribe>/<locality>`).

```
tani init tanw/hari
```


## Publishing the queries




dialect files - text file under dialects/tribe/locality, which contain root word information
concept files - acf files under system/concepts which contain
query files - acf query files under system/queries/tribe/path

## tani tool
$ tani init system <-- init the system; compulsory fist step <-- what does it do?
$ tani init galo/aalo <-- set up dirs and files for galo tribe and aalo locality based on files existing in constructs
$ tani init galo/tato from galo/aalo <-- set up dirs and files for galo tribe and tato locality based on galo/aalo
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

$ tani publish <-- make entried to database / internally calls apoc

## dirs

definitions mandatory to start
dialects are manually entered
queries are generated from definitions, put in gitignore

