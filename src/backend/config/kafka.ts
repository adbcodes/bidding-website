import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

export const kafka = new Kafka({
    clientId: 'bidding-service',
    brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
});

export const TOPICS = {
    COMMANDS: 'bidding-commands',
    EVENTS: 'bidding-events',
  };
  