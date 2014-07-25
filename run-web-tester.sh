#!/usr/bin/env bash

cd java
mvn clean compile install assembly:single
java -jar target/on-the-road_web-tester-0.1-SNAPSHOT-jar-with-dependencies.jar &
cd ..
cd node
node web_server.js

