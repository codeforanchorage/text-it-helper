'use strict';

const client = require('superagent');
const logger = require('heroku-logger');

const { apiKey, baseId } = require('../../config/lib/services/airtable');

const baseUri = `https://api.airtable.com/v0/${baseId}/`;

/**
 * Execute a POST request to the Airtable baseId.
 *
 * @param {String} path
 * @param {Object} data
 * @return {Promise}
 */
module.exports.get = (path, query) => {
  logger.info('Airtable GET', { path, query });

  return client
    .get(`${baseUri}${encodeURI(path)}`)
    .set('Authorization', `Bearer ${apiKey}`)
    .query(query);
}

/**
 * Execute a PATCH request to the Airtable baseId.
 *
 * @param {String} path
 * @param {Object} data
 * @return {Promise}
 */
function patch(path, data) {
  logger.info('Airtable PATCH', { path, data });

  return client
    .patch(`${baseUri}${encodeURI(path)}`)
    .set('Authorization', `Bearer ${apiKey}`)
    .send(data);
}

/**
 * Execute a POST request to the Airtable baseId.
 *
 * @param {String} path
 * @param {Object} data
 * @return {Promise}
 */
function post(path, data) {
  logger.info('Airtable POST', { path, data });

  return client
    .post(`${baseUri}${encodeURI(path)}`)
    .set('Authorization', `Bearer ${apiKey}`)
    .send(data);
}

/**
 * Creates a record in Airtable for given tableName and given fields.
 *
 * @param {String} tableName
 * @param {Object} fields
 * @return {Promise}
 */
module.exports.createRecord = (tableName, fields) => post(tableName, {
  records: [{ fields }],
  typecast: true,
}).then(res => res.body.records[0]);

/**
 * Patches a record in Airtable for given tableName and given record.
 *
 * @param {String} tableName
 * @param {Object} record
 * @return {Promise}
 */
module.exports.patchRecord = (tableName, record) => patch(tableName, {
  records: [record],
  typecast: true,
}).then(res => res.body.records[0]);

/**
 * Gets a record in Airtable for given table name and field name / value.
 *
 * @param {String} tableName
 * @param {String} fieldName
 * @param {String} fieldValue
 * @return {Promise}
 */
module.exports.getRecordByFieldName = (tableName, fieldName, fieldValue) => module.exports.get(tableName, {
  filterByFormula: `${fieldName}="${fieldValue}"`,
}).then(res => res.body.records[0]);
