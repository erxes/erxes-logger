/**
 * Mongoose field options wrapper
 * @param {Object} options Mongoose schema options
 */
export const field = options => {
  const { pkey, type, optional } = options;

  if (type === String && !pkey && !optional) {
    options.validate = /\S+/;
  }

  return options;
};

/**
 * Finds only changed fields in document
 * @param {Object} row Actual db row
 * @param {Object} doc Doc to be changed
 * @returns {Object} Object specifying changed & unchanged fields
 */
export const getChangedFields = (row: any, doc: any) => {
  const unchanged = {};
  const changed = {};

  if (row && doc) {
    const fieldNames = Object.getOwnPropertyNames(doc);

    for (const name of fieldNames) {
      if (row[name] === doc[name]) {
        unchanged[name] = doc[name];
      } else {
        changed[name] = doc[name];
      }
    }
  }

  return {
    changed,
    unchanged,
  };
};
