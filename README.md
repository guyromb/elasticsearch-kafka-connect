# kafka-elasticsearch-connect

ElasticSearch Kafka connector, always to to sync between ElasticSearch and other data sources (e.g. Compatible with [sequelize-kafka-connect](https://github.com/nodefluent/sequelize-kafka-connect)).

Main maintainer: [@markoverride](https://github.com/markoverride)

[![Greenkeeper badge](https://badges.greenkeeper.io/onefit/elasticsearch-kafka-connect.svg)](https://greenkeeper.io/) [![Coverage Status](https://coveralls.io/repos/github/onefit/elasticsearch-kafka-connect/badge.svg?branch=master)](https://coveralls.io/github/nodefluent/sequelize-kafka-connect?branch=master)

## Use API

```
npm install --save elasticsearch-kafka-connnect
```

### elasticsearch -> kafka

In development

### kafka -> elasticsearch

```es6
const { runSinkConnector } = require("elasticsearch-kafka-connnect");
runSinkConnector(config, [], onError).then(config => {
    //runs forever until: config.stop();
});
```

## License
**elasticsearch-kafka-connect** is available under the MIT license. See the [LICENSE](https://github.com/onefit/elasticsearch-kafka-connect/blob/master/LICENSE) file for more info.
