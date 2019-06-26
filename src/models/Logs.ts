import { Document, model, Model, Schema } from 'mongoose';
import { field, getChangedFields } from '../utils';

export interface ILog {
  createdAt: Date;
  createdBy: string;
  type: string;
  action: string;
  oldData?: string;
  newData?: string;
  objectId: string;
  unicode?: string;
}

export interface ILogDocument extends ILog, Document {}

export interface ILogModel extends Model<ILogDocument> {
  createLog(doc: ILog): Promise<ILogDocument>;
}

/**
 * When oldData field is empty, it means all fields have been changed.
 */
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
  oldData: field({ type: String, label: 'Unchanged field names', optional: true }),
  newData: field({ type: String, label: 'Changed field names', optional: true }),
  objectId: field({ type: String, label: 'Collection row id' }),
  unicode: field({ type: String, label: 'Description' }),
});

export const loadLogClass = () => {
  class Log {
    public static createLog(doc: ILog) {
      const { oldData, newData } = doc;
      const logDoc = {
        ...doc,
      };

      if (doc.action === 'update' && oldData && newData) {
        const comparison = getChangedFields(JSON.parse(oldData), JSON.parse(newData));

        logDoc.oldData = JSON.stringify(comparison.unchanged);
        logDoc.newData = JSON.stringify(comparison.changed);
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
