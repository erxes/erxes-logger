import * as Random from 'meteor-random';

/**
 * Mongoose field options wrapper
 * @param {Object} options Mongoose schema options
 */
export const field = options => {
  const { pkey, type, optional } = options;

  if (type === String && !pkey && !optional) {
    options.validate = /\S+/;
  }

  // TODO: remove
  if (pkey) {
    options.type = String;
    options.default = () => Random.id();
  }

  return options;
};

/**
 * Takes 2 arrays and detect changes between them.
 * @param oldArray Old array
 * @param newArray New array
 * @returns Object specifying changed & unchanged fields
 * @todo Add object array comparison part
 */
const compareArrays = (oldArray: any[] = [], newArray: any[] = []) => {
  const changedItems = [];
  const unchangedItems = [];
  const addedItems = [];
  const removedItems = [];

  for (const elem of oldArray) {
    if (typeof elem !== 'object') {
      const found = newArray.find(el => el === elem);

      if (!found) {
        removedItems.push(elem);
      }
    }
  }

  newArray.forEach((elem, index) => {
    // primary data types
    if (typeof elem !== 'object') {
      const found = oldArray.find(el => el === elem);

      if (found) {
        unchangedItems.push(elem);
      } else {
        addedItems.push(elem);
      }
    }

    if (typeof elem === 'object') {
      const comparison = compareObjects(oldArray[index], newArray[index]);
      const { unchanged, changed, added, removed } = comparison;

      if (changed && !isObjectEmpty(changed)) {
        changedItems.push(changed);
      }

      if (added && !isObjectEmpty(added)) {
        addedItems.push(added);
      }

      if (removed && !isObjectEmpty(removed)) {
        removedItems.push(removed);
      }

      if (unchanged && !isObjectEmpty(unchanged)) {
        unchangedItems.push(unchanged);
      }
    }
  });

  return {
    unchanged: unchangedItems,
    changed: changedItems,
    added: addedItems,
    removed: removedItems,
  };
};

/**
 * Shorthand empty value checker
 * @param val Value to check
 */
const isNull = val => val === null || val === undefined || val === '';

/**
 * Shorthand empty object checker
 * @param obj Object to check
 */
const isObjectEmpty = obj => {
  return typeof obj === 'object' && obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Detects changes between two objects.
 * Input objects MUST have same hierarchical level of attributes.
 * @param oldData Actual data in db
 * @param newData Doc to be changed
 * @returns Object specifying changed & unchanged fields
 */
export const compareObjects = (oldData: object = {}, newData: object = {}) => {
  const changedFields = {};
  const unchangedFields = {};
  const addedFields = {};
  const removedFields = {};
  // exclude field names not stored in db
  const nonSchemaNames = ['uid', 'length'];
  let fieldNames: string[] = [];

  if (newData && !isObjectEmpty(newData)) {
    fieldNames = Object.getOwnPropertyNames(newData);
    // split
    fieldNames = fieldNames.map<string>(n => {
      if (!nonSchemaNames.includes(n)) {
        return n;
      }
    });
  }

  for (const name of fieldNames) {
    const oldField = oldData[name];
    const newField = newData[name];

    if (typeof newField !== 'object') {
      // changed fields
      if (oldField !== newField) {
        changedFields[name] = newField;

        // means removed a field
        if (!isNull(oldField) && isNull(newField)) {
          removedFields[name] = oldField;
        }

        // means added a new field
        if (isNull(oldField) && !isNull(newField)) {
          addedFields[name] = newField;
        }
      }

      // unchanged fields
      if (oldField === newField) {
        unchangedFields[name] = newField;
      }
    } // end primary type comparison

    if (Array.isArray(newField)) {
      const comparison = compareArrays(oldField, newField);
      const { changed, unchanged, added, removed } = comparison;

      if (changed.length > 0) {
        changedFields[name] = changed;
      }
      if (added.length > 0) {
        addedFields[name] = added;
      }
      if (removed.length > 0) {
        removedFields[name] = removed;
      }
      if (unchanged.length > 0) {
        unchangedFields[name] = unchanged;
      }
    } // end array comparison

    if (typeof newField === 'object') {
      const comparison = compareObjects(oldField, newField);
      const { changed, added, removed, unchanged } = comparison;

      if (!isObjectEmpty(changed)) {
        changedFields[name] = changed;
      }
      if (!isObjectEmpty(added)) {
        addedFields[name] = added;
      }
      if (!isObjectEmpty(removed)) {
        removedFields[name] = removed;
      }
      if (!isObjectEmpty(unchanged)) {
        unchangedFields[name] = unchanged;
      }
    }
  } // end old data for loop

  return {
    changed: changedFields,
    unchanged: unchangedFields,
    added: addedFields,
    removed: removedFields,
  };
};
