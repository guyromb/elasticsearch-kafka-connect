"use strict";

const async = require("async");
const { SinkTask } = require("kafka-connect");

class ElasticSinkTask extends SinkTask {

    start(properties, callback, parentConfig) {

        this.parentConfig = parentConfig;
        this.properties = properties;
        const {
            esClient,
            idProperty,
            index,
            type,
            batchSize,
        } = this.properties;

        this.esClient = esClient;
        this.idProperty = idProperty;
        this.index = index;
        this.type = type;
        this.batchSize = batchSize;

        this.upserts = new Map();
        this.deletes = new Set();

        this._stats = {
            totalUpserts: 0,
            totalDeletes: 0,
            bulkUpsertErrors: 0,
            bulkDeleteErrors: 0,
            currentUpsertsMapSize: this.upserts.size,
            currentDeletesSetSize: this.deletes.size
        };

        this.parentConfig.on("get-stats", () => {
            this.parentConfig.emit("any-stats", "elastic-sink", this._stats);
        });

        return callback();
    }

    _upsert(upserts, callback) {
        const self = this;

        if (upserts.length === 0) {
            return callback();
        }

        let body = [];
        for (let i in upserts) {
            let records = Array.isArray(upserts[i]) ? upserts[i] : [upserts[i]];
            for (let a in records) {
                let record = records[a];
                let id = record[this.idProperty];
                body.push({ "update": {"_id": id, "_index": this.index}});
                delete record[this.idProperty];
                body.push(record);
            }
        }

        this.esClient.bulk({
            body,
        }).then(function (data) {
            if (data && data.body && data.body.errors) {
                console.error(data.body.errors);
            }
            self._stats.totalUpserts += upserts.length;
            callback();
        }).catch((err) => {
            console.error(err);
            self._stats.bulkUpsertErrors++;
            return callback(err);
        });
    }

    _delete(deletes, callback) {
        const self = this;

        if (deletes.length === 0) {
            return callback();
        }

        let body = [];
        for (let i in deletes) {
            let record = deletes[i];
            body.push({ "delete": {"_id": record, "_index": this.index}});
        }

        this.esClient.bulk({
            body
        }).then(function () {
            self._stats.totalDeletes += deletes.length;
            callback();
        }).catch((err) => {
            self._stats.bulkUpsertErrors++;
            return callback(err);
        });
    }

    putRecords(records) {
        return new Promise((resolve, reject) => {

            records.forEach(record => {

                if (!record.value) {
                    this.parentConfig.emit("model-delete", record.key.toString());
                    this.deletes.add(record.key.toString());
                    return;
                }

                this.upserts.set(record.key.toString(), record.value);
                this.parentConfig.emit("model-upsert", record.key.toString());
            });

            if (this.upserts.size + this.deletes.size < this.batchSize) {
                this._stats.currentDeletesSetSize = this.deletes.size;
                this._stats.currentUpsertsMapSize = this.upserts.size;
                return resolve();
            }

            const upserts = Array.from(this.upserts.values());
            this.upserts.clear();
            const deletes = Array.from(this.deletes.values());
            this.deletes.clear();

            this._stats.currentDeletesSetSize = this.deletes.size;
            this._stats.currentUpsertsMapSize = this.upserts.size;

            async.series(
                [
                    done => this._upsert(upserts, done),
                    done => this._delete(deletes, done)
                ],
                (error) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve();
                }
            );
        });
    }

    put(records, callback) {
        this.putRecords(records)
            .then(() => callback(null))
            .catch(error => callback(error));
    }

    stop() {
        //empty (connection is closed by connector)
    }
}

module.exports = ElasticSinkTask;
