import { connect } from 'amqplib';
import env from './env.js';

const connection = await connect(env.AMQP_URL);
export const amqp = await connection.createChannel();
export const queue = env.AMQP_QUEUE;

await amqp.assertQueue(queue, { durable: true });
