import { MongoClient } from 'mongodb';
import env from './env.js';

export const mongodb = new MongoClient(env.DATABASE_URL, {

});

export const db = mongodb.db("bhut");
