// In this file you can configure migrate-mongo

const config = {
    clickhouse: {
        // TODO Change (or review) the url to your Clickhouse:
        url: "http://localhost",

        // TODO Change (or review) the port to your Clickhouse:
        port: 8123,

        // TODO Change this to your database name:
        database: "YOURDATABASENAME",

        basicAuth: null,
        // basicAuth: {
        //   username: 'default',
        //   password: '',
        // },

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

    // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determine
    // if the file should be run.  Requires that scripts are coded to be run multiple times.
    useFileHash: false,

    // Don't change this, unless you know what you're doing
    moduleSystem: 'esm',
};

export default config;
