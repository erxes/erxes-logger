import { Document, model, Model, Schema } from 'mongoose';
import { compareObjects, field } from '../utils';

export interface ILogDoc {
  createdAt: Date;
  createdBy: string;
  type: string;
  action: string;
  object?: string;
  unicode?: string;
  description?: string;
  newData?: string;
  objectId?: string;
  addedData?: string;
  changedData?: string;
  unchangedData?: string;
  removedData?: string;
}

export interface ILogDocument extends ILogDoc, Document {}

export interface ILogModel extends Model<ILogDocument> {
  createLog(doc: ILogDoc): Promise<ILogDocument>;
}

export const schema = new Schema({
  _id: field({ pkey: true }),
  createdAt: field({
    type: Date,
    label: 'Created date',
    default: new Date(),
  }),
  createdBy: field({ type: String, label: 'Performer of the action' }),
  type: field({
    type: String,
    label: 'Module name which has been changed',
  }),
  action: field({
    type: String,
    label: 'Action, one of (create|update|delete)',
  }),
  objectId: field({ type: String, label: 'Collection row id' }),
  unicode: field({ type: String, label: 'Performer username' }),
  description: field({ type: String, label: 'Description' }),
  addedData: field({ type: String, label: 'Newly added fields', optional: true }),
  unchangedData: field({ type: String, label: 'Unchanged fields', optional: true }),
  changedData: field({ type: String, label: 'Changed fields', optional: true }),
  removedData: field({ type: String, label: 'Removed fields', optional: true }),
});

export const loadLogClass = () => {
  class Log {
    public static createLog(doc: ILogDoc) {
      const { object, newData } = doc;
      const logDoc = { ...doc };
      let oldData;
      let parsedNewData;

      try {
        oldData = JSON.parse(object);

        if (newData) {
          parsedNewData = JSON.parse(newData);
        }
      } catch (e) {
        console.log(e, 'JSON parsing error');
        oldData = JSON.parse(object.replace('\n', ''));
      }

      if (oldData._id) {
        logDoc.objectId = oldData._id;
      }

      switch (doc.action) {
        case 'create':
          logDoc.addedData = JSON.stringify(parsedNewData);
          break;
        case 'update':
          if (oldData && newData) {
            try {
              const comparison = compareObjects(oldData, parsedNewData);

              logDoc.addedData = JSON.stringify(comparison.added);
              logDoc.changedData = JSON.stringify(comparison.changed);
              logDoc.unchangedData = JSON.stringify(comparison.unchanged);
              logDoc.removedData = JSON.stringify(comparison.removed);
            } catch (e) {
              console.log(e, 'object comparison error');
            }
          }

          break;
        case 'delete':
          logDoc.removedData = JSON.stringify(oldData);
          break;
        default:
          break;
      }

      return Logs.create(logDoc);
    }
  }

  schema.loadClass(Log);

  return schema;
};

loadLogClass();

// tslint:disable-next-line
const Logs = model<ILogDocument, ILogModel>('logs', schema);

export default Logs;
