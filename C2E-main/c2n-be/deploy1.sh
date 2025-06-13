#!/usr/bin/env sh
 
echo "***********start to init docker env file***********"
cp deployment/docker-env/portal-api.env.example deployment/docker-env/portal-api.env
 
检查mvn命令是否存在
if ! (command -v mvn &> /dev/null); then
    echo "Maven (mvn) could not be found. Please install Maven before continuing."
    exit 1
fi
 
echo "***********start to maven install java project***********"
mvn clean install -Dmaven.test.skip
 
echo "***********start to check docker installation***********"
if ! (command -v docker &> /dev/null) || ! (command -v docker-compose &> /dev/null); then
    echo "Docker or docker-compose could not be found. Please install Docker before continuing."
    echo "You can download Docker from https://www.docker.com/products/docker-desktop"
    exit 1
fi
 
echo "***********start to build docker image***********"
cd portal-api

# 注释说明已经通过docker compose up构建，所以这里不需要再使用docker build
# ./docker-build.sh
 
echo "***********start to start docker***********"
cd ../deployment
docker compose up -d --build
 
echo "***********docker started successful***********"