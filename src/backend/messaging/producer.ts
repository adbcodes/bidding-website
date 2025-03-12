import { kafka, TOPICS } from "../config/kafka";
import { Command, Event } from "../models/types";

const producer = kafka.producer();
let isConnected = false;

export const initializeProducer = async () => {
  await producer.connect();
  isConnected = true;
  console.log("Kafka producer connected");
};

export const produceCommand = async (command: Command) => {
  if (!isConnected) {
    throw new Error("Producer not connected");
  }

  try {
    producer.send({
      topic: TOPICS.COMMANDS,
      messages: [{ key: command.type, value: JSON.stringify(command) }],
    });
    console.log(`Command produced: ${command.type}`);
  } catch (error) {
    console.log("Error while producing bid command: ", error);
    throw error;
  }
};

export const produceEvent = async (event: Event) => {
  if (!isConnected) {
    throw new Error("Producer not connected");
  }

  try {
    producer.send({
      topic: TOPICS.EVENTS,
      messages: [
        {
          key: event.type,
          value: JSON.stringify(event),
        },
      ],
    });
    console.log(`Command produced: ${event.type}`);
  } catch (error) {
    console.log("Error while producing bid command: ", error);
    throw error;
  }
};
