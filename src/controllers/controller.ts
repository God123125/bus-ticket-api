import {
  AggregateOptions,
  ClientSession,
  InsertManyOptions,
  Model,
  ObjectId,
  PipelineStage,
  QueryOptions,
  SaveOptions,
  SortOrder,
  UpdateQuery,
  QueryFilter,
  ProjectionType,
} from "mongoose";
import { IPaginationForm } from "../interfaces/pagination";
import { CountOptions, DeleteOptions, UpdateOptions } from "mongodb";
import { IMongoObject } from "../interfaces/mongo-object";

export class Controller<T extends IMongoObject> {
  protected model: Model<T>;
  constructor(model: Model<T>) {
    this.model = model;
  }
  public getMany(
    option: {
      query?: QueryFilter<T>;
      sort?: Record<keyof T & string, SortOrder>;
      pagination?: IPaginationForm;
      select?: ProjectionType<T>;
    },
    session: ClientSession | null = null,
  ) {
    let doc = this.model.find(option.query ?? {});

    if (option.sort) {
      doc = doc.sort(option.sort);
    }

    if (option.pagination) {
      const limit = option.pagination.limit ?? 20;
      const skip = ((option.pagination.page ?? 1) - 1) * limit;
      doc = doc.skip(skip).limit(limit);
    }

    if (option.select) {
      doc = doc.select(option.select);
    }

    return doc.session(session);
  }

  public count(query: QueryFilter<T> = {}, options?: CountOptions) {
    return this.model.countDocuments(query, options).exec();
  }

  public countAll(options?: QueryOptions<T>) {
    return this.model.estimatedDocumentCount(options).exec();
  }

  public async exist(query: QueryFilter<T> = {}) {
    return (await this.model.exists(query).exec()) != null;
  }

  public getOne(
    option: {
      query?: QueryFilter<T>;
      sort?: { [key in keyof T]?: SortOrder };
      select?: ProjectionType<T>;
    },
    session: ClientSession | null = null,
  ) {
    let doc = this.model.findOne(option.query || {});
    if (option.sort) {
      doc = doc.sort(option.sort as any);
    }

    if (option.select) {
      doc = doc.select(option.select);
    }
    return doc.session(session);
  }

  public getById(id: string | ObjectId, session: ClientSession | null = null) {
    return this.model.findById(id).session(session);
  }

  public create(data: T, options?: SaveOptions) {
    return this.model.create(data as any, options);
  }

  public insertMany(data: T[], options: InsertManyOptions = {}) {
    return this.model.insertMany(data, options);
  }

  public update(
    query: QueryFilter<T>,
    data: UpdateQuery<T>,
    options: QueryOptions<T> = {},
  ) {
    return this.model.findOneAndUpdate(query, data, { new: true, ...options });
  }

  public updateMany(
    query: QueryFilter<T>,
    data: UpdateQuery<T>,
    options: UpdateOptions = {},
  ) {
    return this.model.updateMany(query, data, { ...options });
  }

  public delete(query: QueryFilter<T>, options?: DeleteOptions) {
    return this.model.deleteOne(query, options);
  }

  public deleteMany(query: QueryFilter<T>, options?: DeleteOptions) {
    return this.model.deleteMany(query, options);
  }

  public aggregate<ReslutTemplate>(
    pipeline?: PipelineStage[],
    options?: AggregateOptions,
  ) {
    return this.model.aggregate<ReslutTemplate>(pipeline, options);
  }
}
