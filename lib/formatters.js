'use strict';

const { assign, cloneDeep, omit, pick, startCase } = require('lodash');

const { getUrlForContactId } = require('./services/text-it');

/**
 * @param {Object} data
 * @return {Object}
 */
module.exports.startCaseObjectKeys = (data) => {
  const formatted = {};

  Object.keys(data).forEach((fieldName) => {
    formatted[startCase(fieldName)] = data[fieldName];
  })

  return formatted;
};

/**
 * @param {Object} contact
 * @return {Object}
 */
module.exports.formatTextItContact = (contact) => {
  const { created_on, fields = {}, groups = [], name, uuid, urns = [] } = contact;
  // Assumes we're only supporting SMS.
  const phone = urns.length ? contact.urns[0] : contact.urn;

  const fieldConfig = process.env.TEXT_IT_CONTACT_FIELDS;
  const fieldList = fieldConfig ? fieldConfig.split(',') : [];
  const fieldsToAdd = fieldList.length ? pick(fields, fieldList) : fields; 

  return module.exports.startCaseObjectKeys(
    assign({
      uuid,
      name,
      phone,
      profile: getUrlForContactId(uuid),
      created_on,
      groups: groups ? groups.map(group => group.name).join(', ') : null,
    }, fieldsToAdd)
  );
};

/**
 * Formats the results from the flow in the same sequence the fields are collected in flow.
 *
 * @param {Object} results
 * @param {Array} flowFields
 * @return {Object}
 */
module.exports.formatTextItResults = (results, flowFields) => {
  const formatted = {};

  flowFields.forEach((fieldConfig) => {
    const result = results[fieldConfig.key];

    if (!result) {
      return;
    }

    const { category, value } = result;
    const openTextCategories = ['All Responses', 'Has Text'];

    formatted[fieldConfig.name] = openTextCategories.includes(category) ? value : category;
  });

  return formatted;
};

/**
 * @param {String} fieldName
 * @param {String} fieldValue
 * @return {String}
 */
const getPlainTextLine = (fieldName, fieldValue) => `${fieldName}:\n${fieldValue}\n`;

/**
 * @param {Object} data
 * @return {String}
 */
const getPlainTextFromObject = (data) => Object.keys(data)
  .map(fieldName => getPlainTextLine(fieldName, data[fieldName]))
  .join('\n');

/**
 * @param {Object}
 * @return {String}
 */
module.exports.getPlainTextFromReq = req => 
  getPlainTextFromObject(cloneDeep(omit(req.data, 'Uuid')));
