#!/usr/bin/env sh
 
echo "***********start to start docker***********"
cd deployment
docker compose up -d --build
 
echo "***********docker started successful***********"