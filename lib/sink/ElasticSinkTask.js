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
            batchSize
        } = this.properties;

        this.esClient = esClient;
        this.idProperty = idProperty;
        this.index = index;
        this.type = type;
        this.batchSize = batchSize;

        this.upserts = new Map();
        this.deletes = new Map();

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
            let record = upserts[i];
            body.push({ "update": {"_id": record[this.idProperty], "_index": this.index, "_type": this.type}});
            delete record[this.idProperty];
            body.push({'doc': record, "doc_as_upsert": true});
        }

        this.esClient.bulk({
            body
        }).then(function () {
            console.log('bulk request ' + upserts.length);
            self._stats.totalUpserts += upserts.length;
            callback();
        }).catch((err) => {
            self._stats.bulkUpsertErrors++;
            return callback(err);
        });

/*
        this.esClient.sobject(this.properties.sObject).upsertBulk(upserts, this.idProperty, (error, results) => {
            if (error) {
                this._stats.bulkUpsertErrors++;
                return callback(error);
            }

            const errorItems = results.filter(r => !r.success);
            if (errorItems.length > 0) {
                this._stats.bulkUpsertErrors += errorItems.length;
                this._stats.totalUpserts += results.length - errorItems.length;
                return callback(new Error(`Some bulk upserts failed: ${JSON.stringify(errorItems)}`));
            }

            this._stats.totalUpserts += upserts.length;

            callback();
        });
*/
    }

    _delete(deletes, callback) {
        const self = this;

        if (deletes.length === 0) {
            return callback();
        }

        let body = [];
        for (let i in deletes) {
            let record = deletes[i];
            body.push({ "delete": {"_id": record[this.idProperty], "_index": this.index, "_type": this.type}});
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
/*
        this.connection.sobject(this.sObject)
            .find(condition)
            .destroy((error, results) => {
                if (error) {
                    this._stats.bulkDeleteErrors++;
                    return callback(error);
                }

                const errorItems = results.filter(r => !r.success);
                if (errorItems.length > 0) {
                    this._stats.bulkDeleteErrors += errorItems.length;
                    this._stats.totalDeletes += results.length - errorItems.length;
                    return callback(new Error(`Some bulk deletes failed: ${JSON.stringify(errorItems)}`));
                }

                this._stats.totalDeletes += deletes.length;

                callback();
            });*/
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
