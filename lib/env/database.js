const { ClickHouse } = require("clickhouse");
const _ = require("lodash");
const config = require("./config");

module.exports = {
  async connect() {
    const configContent = await config.read();

    const url = _.get(configContent, "clickhouse.url");
    const options = _.get(configContent, "clickhouse.options");

    if (!url) {
      throw new Error("No `url` defined in config file!");
    }

    const configData = {};
    configData.config = {};

    configData.url = _.get(configContent, "clickhouse.url");
    configData.port = _.get(configContent, "clickhouse.port");
    configData.config.database = _.get(configContent, "clickhouse.database");


    configData.debug = options.debug ?? false;
    configData.isUseGzip = options.isUseGzip ?? false;
    configData.trimQuery = options.trimQuery ?? false;
    configData.usePost = options.usePost ?? false;
    configData.format = options.format ?? 'json';
    configData.raw = options.raw ?? false;

    if (options.hasOwnProperty('session_id')) {
      configData.config.session_id = options.session_id;
    }

    configData.config.session_timeout = options.session_timeout ?? 60;
    configData.config.output_format_json_quote_64bit_integers = options.output_format_json_quote_64bit_integers ?? 0;
    configData.config.enable_http_compression = options.enable_http_compression ?? 0;

    if (_.get(configContent, "clickhouse.basicAuth")) {
      configData.basicAuth = {
        username: _.get(configContent, "clickhouse.basicAuth.username"),
        password: _.get(configContent, "clickhouse.basicAuth.password"),
      }
    }

    return new ClickHouse(configData);
  }
};
