/**
 * The groupId parameter in the KafkaJS consumer configuration is used to specify the consumer group that this consumer will join.
 * 'event-processor' is the name of the consumer group. This means that all consumers that pass 'event-processor' as groupId will be part
 * of the same consumer group and the messages in the topic(s) they are listening to will be distributed among them.
 */

import { kafka, TOPICS } from "../config/kafka";
import { Event } from "../models/types";
import { broadcastEvent } from "../api/websocket";

const consumer = kafka.consumer({ groupId: "event-processor" });

export const initialiseEventProcessor = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: TOPICS.EVENTS, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        if (!message.value) return;

        const event: Event = JSON.parse(message.value.toString());
        console.log(`Processing event: ${event.type}`);

        broadcastEvent(event);
      } catch (error) {
        console.error("Error processing event:", error);
      }
    },
  });

  console.log("Event handler initialized");
};
