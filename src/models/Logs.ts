import { Document, model, Model, Schema } from 'mongoose';
import { field, getChangedFields } from '../utils';

export interface ILogDoc {
  createdAt: Date;
  createdBy: string;
  type: string;
  action: string;
  object?: string;
  unicode?: string;
  description?: string;
  newData?: string;
  oldData?: string;
  objectId?: string;
}

export interface ILogDocument extends ILogDoc, Document {}

export interface ILogModel extends Model<ILogDocument> {
  createLog(doc: ILogDoc): Promise<ILogDocument>;
}

export const schema = new Schema({
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
  oldData: field({ type: String, label: 'Unchanged fields', optional: true }),
  newData: field({ type: String, label: 'Changed fields', optional: true }),
  objectId: field({ type: String, label: 'Collection row id' }),
  unicode: field({ type: String, label: 'Performer username' }),
  description: field({ type: String, label: 'Description' }),
});

export const loadLogClass = () => {
  class Log {
    public static createLog(doc: ILogDoc) {
      const { object, newData } = doc;
      const oldData = JSON.parse(object);
      const logDoc = { ...doc };

      if (oldData._id) {
        logDoc.objectId = oldData._id;
      }

      switch (doc.action) {
        case 'update':
          if (oldData && newData) {
            const comparison = getChangedFields(oldData, JSON.parse(newData));

            logDoc.oldData = JSON.stringify(comparison.unchanged);
            logDoc.newData = JSON.stringify(comparison.changed);
          }

          break;
        case 'delete':
          logDoc.oldData = JSON.stringify(oldData);
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
