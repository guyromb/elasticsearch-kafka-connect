# kafka-elasticsearch-connect

[![Greenkeeper badge](https://badges.greenkeeper.io/onefit/elasticsearch-kafka-connect.svg)](https://greenkeeper.io/)

ElasticSearch Kafka connector, Inspired by Nodefluent

[![Greenkeeper badge](https://badges.greenkeeper.io/onefit/elasticsearch-kafka-connect.svg)](https://greenkeeper.io/) [![Coverage Status](https://coveralls.io/repos/github/onefit/elasticsearch-kafka-connect/badge.svg?branch=master)](https://coveralls.io/github/nodefluent/sequelize-kafka-connect?branch=master)

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

## License
```
MIT License

Copyright (c) 2019 OneFit Unlimited B.V.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
