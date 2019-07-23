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
  const changed = [];
  const unchanged = [];

  for (const elem of oldArray) {
    if (typeof elem !== 'object') {
      const found = newArray.find(el => el === elem);

      if (found && elem === found) {
        unchanged.push(elem);
      } else {
        changed.push(elem);
      }
    }
  }

  for (const elem of newArray) {
    if (typeof elem !== 'object') {
      const found = oldArray.find(el => el === elem);

      if (found && elem === found) {
        unchanged.push(elem);
      } else {
        changed.push(elem);
      }
    }
  }

  return {
    unchanged,
    changed,
  };
};

/**
 * Detects changes between two objects
 * @param oldData Actual data in db
 * @param newData Doc to be changed
 * @returns Object specifying changed & unchanged fields
 */
export const compareObjects = (oldData: object, newData: object) => {
  const changed = {};
  const unchanged = {};
  const oldNames = oldData ? Object.getOwnPropertyNames(oldData) : [];
  const newNames = newData ? Object.getOwnPropertyNames(newData) : [];

  if (oldData && newData) {
    // gather unchanged fields first
    for (const name of oldNames) {
      const oldField = oldData[name];
      const newField = newData[name];

      if (typeof oldField !== 'object') {
        if (oldField === newField) {
          unchanged[name] = oldField;
        }
      } else {
        if (!Array.isArray(oldField)) {
          const comparison = compareObjects(oldField, newField);

          unchanged[name] = comparison.unchanged;
        } else {
          const comparison = compareArrays(oldField, newField);

          unchanged[name] = comparison.unchanged;
        }
      }
    } // end old data for loop

    // and then changed fields
    for (const name of newNames) {
      const oldField = oldData[name];
      const newField = newData[name];

      if (typeof newField !== 'object') {
        if (oldField !== newField) {
          changed[name] = newField;
        }
      } else {
        if (!Array.isArray(newField)) {
          const comparison = compareObjects(oldField, newField);

          changed[name] = comparison.changed;
        } else {
          const comparison = compareArrays(oldField, newField);

          changed[name] = comparison.changed;
        }
      }
    } // end new data for loop
  }

  return { changed, unchanged };
};
