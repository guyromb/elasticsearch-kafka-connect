# kafka-elasticsearch-connect
ElasticSearch Kafka connector, Inspired by Nodefluent

## Use API

```
npm install --save elasticsearch-kafka-connnect
```

### database -> kafka

In development

### kafka -> database

```es6
const { runSinkConnector } = require("elasticsearch-kafka-connnect");
runSinkConnector(config, [], onError).then(config => {
    //runs forever until: config.stop();
});
```