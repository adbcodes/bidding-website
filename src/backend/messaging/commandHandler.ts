/**
 * The consumer.run method in Kafka is used to process messages from a Kafka topic. It is typically run continuously to handle incoming 
 * messages as they arrive. Before calling consumer.run, you must subscribe to a topic using the subscribe method. 
 * The subscribe method itself does not read messages; it only specifies the topics of interest. 
 * The consumer.run method is necessary to actively poll and process messages from the subscribed topics. 1 2
 */


import { kafka, TOPICS } from "../config/kafka";
import {
  Bid,
  BidRejectedEvent,
  BidPlacedEvent,
  PlaceBidCommand,
  Command,
} from "../models/types";
import { produceEvent } from "./producer";
import { dbOperations } from "../db/operations";

const consumer = kafka.consumer({ groupId: "command-processor" });

export const initializeCommandProcessor = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: TOPICS.COMMANDS, fromBeginning: false });
  await processMessages();
  console.log('Command handler initialized');
};

async function processMessages() {
  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        if (!message.value) return;
        const command: Command = JSON.parse(message.value.toString());
        console.log(`Processing command: ${command.type}`);

        switch (command.type) {
          case "PLACE_BID":
            await handlePlaceBidCommand(command as PlaceBidCommand);
            break;
          default:
            console.warn(`Unknown command type ${command.type}`);
        }
      } catch (error) {
        console.error("Error processing command:", error);
      }
    },
  });
}

async function handlePlaceBidCommand(command: PlaceBidCommand) {
  const bid: Bid = command.payload;

  // Validate Bid
  if (bid.bid_amount <= 0) {
    await produceEvent({
      type: "BID_REJECTED",
      payload: {
        bid,
        reason: "Bid amount must be greater than zero",
      },
      timestamp: Date.now(),
    });
    return;
  }

  try {
    let event: BidPlacedEvent = {
      type: "BID_PLACED",
      payload: bid,
      timestamp: Date.now(),
    };

    await produceEvent(event);
    await dbOperations.insertBid(bid);
    console.log(`Bid placed: ${bid}`);
  } catch (error) {
    console.log("error producing bid event");
    await produceEvent({
      type: "BID_REJECTED",
      payload: {
        bid,
        reason: "error while producing bid event",
      },
      timestamp: Date.now(),
    });
  }
}
