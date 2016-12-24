# tani

Commandline tool for generating language data sets for Tani dialects.

## System requirements

Requires a Mac or Linux machine with Node.js (4+) and Neo4j installation.

## Understanding the directories and files

The whole project is built around a directory named `concepts`, where directories/sub-directories of concept definition files are stored.

A concept definition file is just a `.txt` file with the following structure.

```
Concept: Concise definition
[Note]: Any special note
[Example]: A list of examples
```

For example:

```
Concept: Good to experience
Note: Used for describing quality of being
Examples:
 - apatani/hari: kaa[pyo] = beautiful
 - galo/aalo: kaa[ken] = beautiful
 - adi/pasighat: kam[po] = beautiful
```

Concept files can be created using the `add` command or manually. When adding manually, the file name should be next largest number in the directory and the `sync --all` command must be executed after it.

Dialect files, and hence queries, are created from these concept files.

### Summary

* `concepts` - directory of concept text files
* `dialects` - text file under dialects/tribe/locality, which contain root word information for a particular dialect
* `queries` - directory of `acf` files, ready to be pushed to the database

## Important

1. Do not start editing the dialect files, till the concepts are clearly identified and organized a logical taxonomy. Any change in the structure of the `concepts` directory will destructively affect the dialect files.
2. Make sure to quote any string that contains YAML special characters.

## Adding concepts

**DO NOT ADD CONCEPT FILES MANUALLY!**

_Concepts can be added manually IN FUTURE. If any concept is manually added, the `sync` command must be run to update the dialect files._

The following command will add a new noun concept for "Animal", and assign the immediate largest number as its id (filename) and create the corresponding file in the concept directory `n`.

```
tani add n "Animal"
```

The following command will create a new noun concept file under the `n/ornaments` directory. If the directory does not exist, it will be created. Since the concept string is not specified, the file will be empty.

```
tani add n/ornaments
```

A new concept can be added and made to take over the id of an existing concept using the `add @` command. In such cases, the existing file and all other files after it will be shifted by a value of 1.

```
tani add v@1 "Do"
```

```
tani add n/animals/insects@5 "Grasshopper"
```

Whenever a new concept is added using the `add` command, the corresponding dialects directory will be update to reflect the change.

`tani compile --all` and `tani publish` must be run after every `add` command to keep the source files updated.

## Reading a concept

Read the entry for a concept:

```
tani read n/1
```

Read the entry in a dialect for a concept:

```
tani read n/1 apatani/hari
```

## Moving/renaming a concept file

This will move `n/10.txt` to `n/animals` and assign it a new name based on the largest file id in the `n/animals` directory.

```
tani move n/10 n/animals
```

This will move `n/10.txt` to `n/animals` as `2.txt`, while incrementing the existing file names starting from index 2.

```
tani move n/10 n/animals@2
```

The following will rename `n/10.txt` to `n/1.txt`. The pre-existing `1.txt` will be renamed `2.txt`, `2.txt` to `3.txt`, and so on.

```
tani move n/5 n@1
```

## Deleting concepts

**DO NOT DELETE CONCEPT FILES MANUALLY!**

_Concepts can be deleted manually IN FUTURE. If any concept is manually deleted, the `sync` command must be run to update the dialect files._

NOTE: When a concept file is deleted, the corresponding dialect file is also deleted.

The following command will delete an existing concept at the specified index.

```
tani delete n/10
```

All files starting from 11 will be decremented by 1. Do not delete concept files, if this behavior is not wanted.

The following command will delete all the existing concepts in a directory.

```
tani delete n/animals
```

To delete all the concepts:

```
tani delete --all
```

`tani compile --all` and `tani publish` must be run after every `delete` command to keep the query files updated.


## Updating dialect files when new concepts are edited or added

Use this command to update dialect files when new concept are **manualy** added to the `concepts` directory, or an existing one is edited.

Note: If there are no dialect files, there is no need for syncing.

Scan all the concepts and apply the changes to the dialect files:

```
tani sync --all
```

Scan `v` and apply the changes to the dialect files:

```
tani sync v
```

Scan `n/animals` and apply the changes to the dialect files:

```
tani sync n/animals
```

## Adding a new dialect

A dialect is identified using the tribe and locality (`<tribe>/<locality>`).

Add a new dialect:

```
tani init apatani/hari
```

This will create the `apatani/hari` dialect directory under the `dialects` dir at the root of the project. The corresponding dialect files for the dialect will be generated from the `concepts` directory.

This command merely generates the dialect files, the files need to be manually edited to make entries for the dialect by experts in the dialect.

A dialect can be initialized from an existing dialect, this saves time in making entries when the dialects have a lot of similarities.

```
tani init apatani/hija from apatani/hari
```

The dialect files for `apatani/hija` will be created by copying the contents of `apatani/hari`.

By default, the script used for making entries for a tribe is the one recommended by its apex body - Adi: ABK, Apatani: ALDC, Galo: GWS, Nyishi: NES. To use a custom script, create a script file in the `scripts` directory and modify the `index.js` file in the `scripts` directory.

Here is an example of specifying the script for making the entries for a dialect.

```
tani init apatani/gyati --script pss
```

## Deleting dialects

Use the `uninit ` command to delete the dialect directories generated by the `init` command.

Delete all the dialects:

```
tani uninit --all
```

Delete all the dialects of a tribe:

```
tani uninit apatani
```

Delete a dialect:

```
tani uninit apatani/hari
```

## Searching

Search for entries in the concept and dialect files.

```
tani search <string>
```

Search for entries in concept files.

```
tani search <string> --concept
```

Search for entries in dialect files.

```
tani search <string> --dialect
```

NOTE: make sure to run the following command after `add`, `move`, or `sync` commands to update search results.

```
tani index
```

## Compiling

Concept and dialect files files have to be compiled to generate the query files. Only query files can be `publish`ed.

Compile everything:

```
tani compile --all
```

Compile concepts:

```
tani compile concepts
```

Compile verbs:

```
tani compile v
```

Compile verb modifiers:

```
tani compile vm
```

Similarly for n, nm, adj, adj, conj etc.

Compile all the dialects of a tribe:

```
tani compile apatani
```

Compile a dialect:

```
tani compile apatani/hari
```

The generated `queries` directory can be regenarated using the `compile` command, so the directory should be put in `.gitignore`.

## Publishing

The `publish` command must be run at the root of the `queries` directory. It erases the existing entries in the database, and populate it with the new queries. The `compile` command must be run, before `publish` can be run.

Publish everything:

```
tani publish --all
```

Publish a specific tribe:

```
tani publish apatani
```

Publish a specific dialect:

```
tani publish apatani/hari
```

Publish a specific concept directory:

```
tani publish apatani/hari/n
```

Publish a specific concept:

```
tani publish apatani/hari/n/animals@10
```

## Unpublishing

Use the `unpublish` command to remove entries from the database. This will not affect the local files, only the entries in the database will be removed.

Unpublish everything:

```
tani unpublish --all
```

Unpublish a specific tribe:

```
tani unpublish apatani
```

Unpublish a specific dialect:

```
tani unpublish apatani/hari
```

Publish a specific concept directory:

```
tani unpublish apatani/hari/n
```

Publish a specific concept:

```
tani unpublish apatani/hari/n/animals@10
```

## View changes

```
tani status
```

## License

[MIT](LICENSE)
