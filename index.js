const crypto = require('crypto');

/**
 * @private
 * @param {Function[]} fns
 * @returns {Function}
 */
const pipe =
  (...fns) =>
  (value) =>
    fns.reduce((v, fn) => fn(v), value);

/**
 * @typedef {object} Event
 * @property {*} partitionKey
 */

/**
 * @private
 * @param {string} text
 * @returns {string}
 */
const hash = (text) => {
  if (!text) return text;

  if (typeof text !== 'string') {
    text = JSON.stringify(text);
  }

  return crypto.createHash('sha3-512').update(text).digest('hex');
};

/**
 * @private
 * @param {Event} event
 * @returns {string}
 */
const initialPartitionKey = (event) => {
  if (event?.partitionKey) {
    return event.partitionKey;
  } else {
    return hash(event);
  }
};

/**
 * @private
 * @param {string} partitionKey
 * @returns {string}
 */
const calculateNewPartitionKey = (partitionKey) => {
  const TRIVIAL_PARTITION_KEY = '0';

  if (!partitionKey) {
    return TRIVIAL_PARTITION_KEY;
  } else if (typeof partitionKey !== 'string') {
    return JSON.stringify(partitionKey);
  }

  return partitionKey;
};

/**
 * @private
 * @param {string} partitionKey
 * @returns {string}
 */
const hashPartitionKeyIfExceedMaxSize = (partitionKey) => {
  const MAX_PARTITION_KEY_LENGTH = 256;
  if (partitionKey.length > MAX_PARTITION_KEY_LENGTH) {
    return hash(partitionKey);
  }

  return partitionKey;
};

/**
 *
 * @param {Event} event
 * @returns {string}
 */
exports.deterministicPartitionKey = (event) =>
  pipe(
    initialPartitionKey,
    calculateNewPartitionKey,
    hashPartitionKeyIfExceedMaxSize
  )(event);
