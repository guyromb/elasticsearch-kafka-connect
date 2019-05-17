"use strict";

const {SinkConfig} = require("kafka-connect");

class ElasticSinkConfig extends SinkConfig {

    constructor(...args){ super(...args); }

    run(){
        return super.run();
    }
}

module.exports = ElasticSinkConfig;