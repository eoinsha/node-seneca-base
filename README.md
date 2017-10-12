seneca-node-base
===

An npm module and Docker base image comprising a few dependencies commonly used in Node.js microservices. This repo demonstrates how using a base layer for microservices can significantly reduce build and deployment time and reduce resources on the runtime host.

See [this post](https://medium.com/@eoins/it-s-all-about-the-base-11f057faebc1) for an overview.

# Why

Node.js microservices normally have very little code, sometimes less than 100 lines of JavaScript.  Having a few NPM dependencies can result in large Docker image layers (100s of MB). This effect increases the time and cost of builds, deployment, transfer and storage.
By pushing infrequently updated dependencies into a base layer, time and resource waste can be avoided.
- `docker build` times can be reduced from minutes to a few seconds or less
- `docker push` times can be reduced from minutes to a few seconds or less
- Continuous build is faster
- Development bringup is faster
- Time spent updating dependencies across many microservices, e.g. in the event of a security patch, is optimised to one core update
- Resources on the Docker host where multiple microservices are deployed can be optimised by the host kernel as they are sharing the same virtual filesystem.

# How

Common dependencies from your microservice toolkit can be wrapped in a Node module and exposed to dependent modules. Using `npm link`, containers can use the base layer to find these dependencies.
Each of your microservices can include `seneca-node-base` as a package dependency. You can choose to `npm link` it for development or `npm install`. For build, test and deployment, no `npm install `occurs as the dependency is linked from the filesystem in the base layer.

# What

This repo is a simple example of how to do this. It contains
- A set of dependencies, like Seneca.js, Hapi and Lodash
- A module for exposing those dependencies to derived modules (microservices)
- A `Dockerfile` for building the base layer to be reused in microservice image builds
- A set of three example derives containers - two microservices and an API gateway

# Try It

The included examples provide `Dockerfile`s to show how this works. Together, they make up a primitive user messaging app. The three containers are:
- A microservice that can add and list users
- A microservie that allows users to post and view message
- An API gateway that exposes the first two with HTTP APIs
- The RabbitMQ library image, used for Seneca transport between microservices

It can be tried like this. The base layer is already built and published on DockerHub, so the examples can be built and run with Docker Compose.

```
cd examples
docker-compose up -d
```

This builds and runs up each of the required containers. The API can be exercised to see the full application in action.

```
curl -H 'Content-Type: application/json' -X POST -d '{"email":"jo@example.com","name":"Jo"}' http://$DOCKER_HOST:3000/api/user/add
```

```
curl http://$DOCKER_HOST:3000/api/user/list
```

```
curl -H 'Content-Type: application/json' -X POST -d '{"user":{"email":"jo@example.com","name":"Jo"}, "text":"Hello there!"}' http://$DOCKER_HOST:3000/api/message/post
```

```
curl http://$DOCKER_HOST:3000/api/message/list
```
