"use strict";

const ElasticSinkConfig = require("./lib/ElasticSinkConfig.js");
const ElasticSinkConnector = require("./lib/sink/ElasticSinkConnector.js");
const ElasticSinkTask = require("./lib/sink/ElasticSinkTask.js");
const JsonConverter = require("./lib/utils/JsonConverter");
const ConverterFactory = require("./lib/utils/ConverterFactory.js");

const runSinkConnector = (properties, converters = [], onError = null) => {

    const config = new ElasticSinkConfig(properties,
        ElasticSinkConnector,
        ElasticSinkTask, [JsonConverter].concat(converters));

    if (onError) {
        config.on("error", onError);
    }

    return config.run().then(() => {
        return config;
    });
};

module.exports = {
    runSinkConnector,
    ConverterFactory
};