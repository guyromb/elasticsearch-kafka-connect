"use strict";

const { SinkConnector } = require("kafka-connect");
const { Client } = require('@elastic/elasticsearch');

class ElasticSinkConnector extends SinkConnector {

    start(properties, callback) {

        this.properties = properties;

        this.esClient = new Client({ node: properties.uri });

        callback(null);
    }

    taskConfigs(maxTasks, callback) {
        const taskConfig = {
            maxTasks,
            esClient: this.esClient,
            batchSize: this.properties.restSink.batchSize,
            idProperty: this.properties.restSink.idProperty,
            index: this.properties.restSink.index,
            type: this.properties.restSink.type,
        };

        callback(null, taskConfig);
    }

    stop() {
        this.esClient.close();
    }
}

module.exports = ElasticSinkConnector;