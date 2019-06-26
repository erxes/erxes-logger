import { Document, model, Model, Schema } from 'mongoose';
import { field } from './utils';

export interface ILog {
  createdAt: Date;
  createdBy: string;
  type: string;
  action: string;
  oldData?: string;
  content: string;
  objectId: string;
  objectName?: string;
}

export interface ILogDocument extends ILog, Document {}

export interface ILogModel extends Model<ILogDocument> {
  createLog(doc: ILog): Promise<ILogDocument>;
}

export const schema = new Schema({
  _id: field({ pkey: true }),
  createdAt: field({
    type: Date,
    label: 'Бүртгэсэн огноо',
    default: new Date(),
  }),
  createdBy: field({ type: String, label: 'Үйлдэл хийсэн user id' }),
  type: field({
    type: String,
    label: 'Ажилласан модуль',
  }),
  action: field({
    type: String,
    label: 'Хийсэн үйлдэл',
  }),
  oldData: field({ type: String, label: 'Өөрчлөгдөөгүй талбарууд', optional: true }),
  content: field({ type: String, label: 'Өөрчлөгдсөн талбарууд' }),
  objectId: field({ type: String, label: 'Ажилласан мөрийн id' }),
  objectName: field({ type: String, label: 'Ажилласан зүйлийн нэр' }),
});

export const loadLogClass = () => {
  class Log {
    public static createLog(doc: ILog) {
      return Logs.create(doc);
    }
  }

  schema.loadClass(Log);

  return schema;
};

loadLogClass();

// tslint:disable-next-line
const Logs = model<ILogDocument, ILogModel>('logs', schema);

export default Logs;
