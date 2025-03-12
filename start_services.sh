#!/bin/bash

# start_services.sh

# Function to check if a Kafka topic exists
check_topic_exists() {
    kafka-topics --describe --topic $1 --bootstrap-server localhost:9092 > /dev/null 2>&1
    return $?
}

# Function to create Kafka topic if it doesn't exist
create_topic_if_not_exists() {
    if ! check_topic_exists $1; then
        echo "Creating Kafka topic: $1"
        kafka-topics --create --topic $1 --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
    else
        echo "Topic $1 already exists"
    fi
}

# Start PostgreSQL
echo "Starting PostgreSQL..."
brew services start postgresql

# Start Zookeeper in the background
echo "Starting Zookeeper..."
zookeeper-server-start /opt/homebrew/etc/kafka/zookeeper.properties > /dev/null 2>&1 &

# Wait for Zookeeper to start
sleep 8

# Start Kafka in the background
echo "Starting Kafka..."
kafka-server-start /opt/homebrew/etc/kafka/server.properties > /dev/null 2>&1 &

# Wait for Kafka to start
sleep 8

# Create Kafka topics if they don't exist
create_topic_if_not_exists "bidding-commands"
create_topic_if_not_exists "bidding-events"

echo "All services started successfully!"
echo "To stop all services, run: brew services stop postgresql && kafka-server-stop && zookeeper-server-stop"
