<p align="center">
    <img src="/migrate-clickhouse-logo.png" alt="migrate-clickhouse database migration tool for Node.js"/>

[![Build Status](https://img.shields.io/travis/vladimir-sudo/migrate-clickhouse.svg?style=flat)](https://travis-ci.org/vladimir-sudo/migrate-clickhouse) 
[![Coverage Status](https://coveralls.io/repos/github/vladimir-sudo/migrate-clickhouse/badge.svg?branch=master)](https://coveralls.io/r/vladimir-sudo/migrate-clickhouse) 
[![NPM](https://img.shields.io/npm/v/migrate-clickhouse.svg?style=flat)](https://www.npmjs.org/package/migrate-clickhouse) 
[![Downloads](https://img.shields.io/npm/dm/migrate-clickhouse.svg?style=flat)](https://www.npmjs.org/package/migrate-clickhouse) 
[![Known Vulnerabilities](https://snyk.io/test/github/vladimir-sudo/migrate-clickhouse/badge.svg)](https://snyk.io/test/github/vladimir-sudo/migrate-clickhouse)

[![tippin.me](https://badgen.net/badge/%E2%9A%A1%EF%B8%8Ftippin.me/@vladimir-sudo/F0918E)](https://tippin.me/@vladimir-sudo)

migrate-clickhouse is a database migration tool for Clickhouse running in Node.js 

</p>
    
## Installation
````bash
$ npm install -g migrate-clickhouse
````

## CLI Usage
````
$ migrate-clickhouse
Usage: migrate-clickhouse [options] [command]


  Commands:

    init                  initialize a new migration project
    create [description]  create a new database migration with the provided description
    up [options]          run all unapplied database migrations
    down [options]        undo the last applied database migration
    status [options]      print the changelog of the database

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
````

## Basic Usage
### Initialize a new project
Make sure you have [Node.js](https://nodejs.org/en/) 10 (or higher) installed.  

Create a directory where you want to store your migrations for your mongo database (eg. 'albums' here) and cd into it
````bash
$ mkdir albums-migrations
$ cd albums-migrations
````

Initialize a new migrate-clickhouse project
````bash
$ migrate-clickhouse init
Initialization successful. Please edit the generated migrate-clickhouse-config.js file
````

The above command did two things: 
1. create a sample 'migrate-clickhouse-config.js' file and 
2. create a 'migrations' directory

Edit the migrate-clickhouse-config.js file. An object or promise can be returned. Make sure you change the mongodb url: 
````javascript
// In this file you can configure migrate-clickhouse

module.exports = {
    clickhouse: {
        // TODO Change (or review) the url to your Clickhouse:
        url: "http://localhost",

        // TODO Change (or review) the port to your Clickhouse:
        port: 8123,

        // TODO Change this to your database name:
        database: "default",

        basicAuth: {
            username: 'root',
            password: 'root',
        },

        options: {
            // debug: false,
            // basicAuth: null,
            // isUseGzip: false,
            // trimQuery: false,
            // usePost: false,
            // format: "json", // "json" || "csv" || "tsv"
            // raw: false,
            // session_id: 'session_id if need',
            // session_timeout: 60,
            // output_format_json_quote_64bit_integers: 0,
            // enable_http_compression: 0,
        }
    },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: "migrations",

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  migrationsTableName: "changelog",

  // The file extension to create migrations and search for in migration dir 
  migrationFileExtension: ".js",

  // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determin
  // if the file should be run.  Requires that scripts are coded to be run multiple times.
  useFileHash: false
};
````

### Creating a new migration script
To create a new database migration script, just run the ````migrate-clickhouse create [description]```` command.

For example:
````bash
$ migrate-clickhouse create blacklist_the_beatles
Created: migrations/20160608155948-blacklist_the_beatles.js
````

A new migration file is created in the 'migrations' directory:
````javascript
module.exports = {
    async up(client) {
        // TODO write your migration here.
        // See https://github.com/vladimir-sudo/migrate-clickhouse/#creating-a-new-migration-script

        // const query = `CREATE TABLE session_temp (
        //                           date Date,
        //                           time DateTime,
        //                           mark String,
        //                           ips Array(UInt32),
        //                           queries Nested (
        //                               act String,
        //                               id UInt32
        //                           )
        //                       )
        //                       ENGINE=MergeTree(date, (mark, time), 8192)`;
        //
        // await client.query(query).toPromise();
    },

    async down(client) {
        // TODO write the statements to rollback your migration (if possible)
        // Example:
        // const query = `DROP TABLE IF EXISTS session_temp`;
        //
        // await client.query(query).toPromise();
    }
};
````

Edit this content so it actually performs changes to your database. Don't forget to write the down part as well.
The ````client```` object contains [Clickhouse db object](https://www.npmjs.com/package/clickhouse)

There are 3 options to implement the `up` and `down` functions of your migration: 
1. Return a Promises
2. Use async-await 
3. Call a callback (DEPRECATED!)

Always make sure the implementation matches the function signature:
* `function up(client) { /* */ }` should return `Promise`
* `async function up(client) { /* */ }` should contain `await` keyword(s) and return `Promise`

#### Example 1: Return a Promise
````javascript
module.exports = {
  up(db) {
      // your code
  },

  down(db) {
      // your code
  }
};
````

#### Example 2: Use async & await
Async & await is especially useful if you want to perform multiple operations against your MongoDB in one migration.

````javascript
module.exports = {
  async up(db) {
      await // your code
  },

  async down(db) {
      await // your code
  },
};
````

#### Overriding the sample migration
To override the content of the sample migration that will be created by the `create` command, 
create a file **`sample-migration.js`** in the migrations directory.

### Checking the status of the migrations
At any time, you can check which migrations are applied (or not)

````bash
$ migrate-clickhouse status
┌─────────────────────────────────────────┬────────────┐
│ Filename                                │ Applied At │
├─────────────────────────────────────────┼────────────┤
│ 20160608155948-blacklist_the_beatles.js │ PENDING    │
└─────────────────────────────────────────┴────────────┘

````


### Migrate up
This command will apply all pending migrations
````bash
$ migrate-clickhouse up
MIGRATED UP: 20160608155948-blacklist_the_beatles.js
````

If an an error occurred, it will stop and won't continue with the rest of the pending migrations

If we check the status again, we can see the last migration was successfully applied:
````bash
$ migrate-clickhouse status
┌─────────────────────────────────────────┬──────────────────────────┐
│ Filename                                │ Applied At               │
├─────────────────────────────────────────┼──────────────────────────┤
│ 20160608155948-blacklist_the_beatles.js │ 2016-06-08T20:13:30.415Z │
└─────────────────────────────────────────┴──────────────────────────┘
````

### Migrate down
With this command, migrate-clickhouse will revert (only) the last applied migration

````bash
$ migrate-clickhouse down
MIGRATED DOWN: 20160608155948-blacklist_the_beatles.js
````

If we check the status again, we see that the reverted migration is pending again:
````bash
$ migrate-clickhouse status
┌─────────────────────────────────────────┬────────────┐
│ Filename                                │ Applied At │
├─────────────────────────────────────────┼────────────┤
│ 20160608155948-blacklist_the_beatles.js │ PENDING    │
└─────────────────────────────────────────┴────────────┘
````

## Advanced Features

### Using a custom config file
All actions (except ```init```) accept an optional ````-f```` or ````--file```` option to specify a path to a custom config file.
By default, migrate-clickhouse will look for a ````migrate-clickhouse-config.js```` config file in of the current directory.

#### Example:

````bash
$ migrate-clickhouse status -f '~/configs/albums-migrations.js'
┌─────────────────────────────────────────┬────────────┐
│ Filename                                │ Applied At │
├─────────────────────────────────────────┼────────────┤
│ 20160608155948-blacklist_the_beatles.js │ PENDING    │
└─────────────────────────────────────────┴────────────┘

````

### Using npm packages in your migration scripts
You can use use Node.js modules (or require other modules) in your migration scripts.
It's even possible to use npm modules, just provide a `package.json` file in the root of your migration project:

````bash
$ cd albums-migrations
$ npm init --yes
````

Now you have a package.json file, and you can install your favorite npm modules that might help you in your migration scripts.
For example, one of the very useful [promise-fun](https://github.com/sindresorhus/promise-fun) npm modules.


### Using ESM (ECMAScript Modules) instead of CommonJS
Since migrate-clickhouse 7.0.0, it's possible to use ESM instead of CommonJS.

#### Using ESM when initializing a new project
Pass the `-m esm` option to the `init` action:
````bash
$ migrate-clickhouse init -m esm
````

It's also required to have package.json file in the root of your project with `"type": "module"`.
Create a new package.json file:
````bash
$ npm init --yes
````

Then edit this package.json file, and add:
````bash
"type": "module"
````

When you create migration files with `migrate-clickhouse create`, they will be prepared for you in ESM style.

Please note that CommonJS is still the default module loading system.

### Using a file hash algorithm to enable re-running updated files
There are use cases where it may make sense to not treat scripts as immutable items.  An example would be a simple collection with lookup values where you just can wipe and recreate the entire collection all at the same time.

```javascript
useFileHash: true
```

Set this config value to will enable tracking a hash of the file contents and will run a file with the same name again as long as the file contents have changes.  Setting this flag changes the behavior for every script and if this is enabled each script needs to be written in a manner where it can be re-run safefly.  A script of the same name and hash will not be executed again, only if the hash changes.

Now the status will also include the file hash in the output

```bash
┌────────────────────────────────────────┬──────────────────────────────────────────────────────────────────┬──────────────────────────┐
│ Filename                               │ Hash                                                             │ Applied At               │
├────────────────────────────────────────┼──────────────────────────────────────────────────────────────────┼──────────────────────────┤
│ 20160608155948-blacklist_the_beatles.js│ 7625a0220d552dbeb42e26fdab61d8c7ef54ac3a052254588c267e42e9fa876d │ 2021-03-04T15:40:22.732Z │
└────────────────────────────────────────┴──────────────────────────────────────────────────────────────────┴──────────────────────────┘

```

### Version
To know which version of migrate-clickhouse you're running, just pass the `version` option:

````bash
$ migrate-clickhouse version
````

## API Usage

```javascript
const {
  init,
  create,
  database,
  config,
  up,
  down,
  status
} = require('migrate-clickhouse');
```

### `init() → Promise`

Initialize a new migrate-clickhouse project
```javascript
await init();
```

The above command did two things: 
1. create a sample `migrate-clickhouse-config.js` file and 
2. create a `migrations` directory

Edit the `migrate-clickhouse-config.js` file. Make sure you change the mongodb url.

### `create(description) → Promise<fileName>`

For example:
```javascript
const fileName = await create('blacklist_the_beatles');
console.log('Created:', fileName);
```

A new migration file is created in the `migrations` directory.

### `database.connect() → Promise<{db: MongoDb, client: MongoClient}>`

Connect to a clickhouse database using the connection settings from the `migrate-clickhouse-config.js` file.

```javascript
const { client } = await database.connect();
```

### `config.read() → Promise<JSON>`

Read connection settings from the `migrate-clickhouse-config.js` file.

```javascript
const mongoConnectionSettings = await config.read();
```

### `config.set(yourConfigObject)`

Tell migrate-clickhouse NOT to use the `migrate-clickhouse-config.js` file, but instead use the config object passed as the first argument of this function.
When using this feature, please do this at the very beginning of your program.

Example:
```javascript
const { config, up } = require('../lib/migrate-clickhouse');

const myConfig = {
    clickhouse: {
        url: "http://localhost",
        port: 8123,
        database: "default",
        basicAuth: {
            username: 'root',
            password: 'root',
        },
    },
    migrationsDir: "migrations",
    migrationsTableName: "changelog",
    migrationFileExtension: ".js"
};

config.set(myConfig);

// then, use the API as you normally would, eg:
await up();
```

### `up(MongoDb, MongoClient) → Promise<Array<fileName>>`

Apply all pending migrations

```javascript
const { client } = await database.connect();
const migrated = await up(client);
migrated.forEach(fileName => console.log('Migrated:', fileName));
```

If an an error occurred, the promise will reject and won't continue with the rest of the pending migrations.

### `down(MongoDb, MongoClient) → Promise<Array<fileName>>`

Revert (only) the last applied migration

```javascript
const { client } = await database.connect();
const migratedDown = await down(client);
migratedDown.forEach(fileName => console.log('Migrated Down:', fileName));
```

### `status(MongoDb) → Promise<Array<{ fileName, appliedAt }>>`

Check which migrations are applied (or not.

```javascript
const { client } = await database.connect();
const migrationStatus = await status(client);
migrationStatus.forEach(({ fileName, appliedAt }) => console.log(fileName, ':', appliedAt));
```
