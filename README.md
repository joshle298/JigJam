# [JigJam](https://jigjam.live)

## 🗺️ Overview
Figma’s collaborative whiteboard platform. There are many features that FigJam offers, but we decided to focus on a few canvas/graphics tools and implemented them to work in a multi-user experience. FigJam has become an essential tool for real-time brainstorming, visualizing, and collaborating (especially in developing this project), so we thought it would be a fun challenge to recreate!
Our remake is called JigJam. It is a multi-user whiteboard where users can collaboratively add, delete, and modify graphics on a canvas in real-time. When first opening JigJam, users are prompted to enter their name. Users then advance to the home screen with options for different “rooms” or canvases to edit (work in progress currently; only one room is available). Once selecting a room, users will advance to the multi-user canvas.  

## 📽️ Video Demo

https://github.com/joshle298/JigJam/assets/59464508/d1d66b4f-0bcb-4af5-a927-fce83f7f46e7

# 📍 Milestone 1

## Data Model

The application will store the layers created on the canvas - allowing for restoring the current state of the global canvas

* Layers contain all attributes needed to render onto clients' canvases
  * uniqueID: generated uuid -> `String`
  * graphicType: Sticky, Line, Shape, Sticker, Text -> `String`
  * x: x position on the canvas -> `Number`
  * y: y position on the canvas -> `Number`
  * s: scale of the layer -> `Number`
  * author: who created the layer -> `String`
  * text (optional): for text layer type -> `String`
  * color (optional): rgb value of color -> `String`
  * ...
* Each layer in the database should be dynamically deleted/added depending on client interaction

An Example Layer:

```javascript
{
  uniqueID: "5bf1afbb-8765-4ce7-b0c9-8fd337cc93ae",
  graphicType: "Sticky",
  x: 43.983,
  y: 10.024,
  s: 2.051,
  author: "Joshua Le",
  text: "Hello JigJamers!",
  color: "rgb(178,34,34)"
}
```

## [Link to Commented First Draft Schema](db.mjs)

## Wireframes

/home

![home](documentation/landing.png)

/home (once user submits name)

![home rooms](documentation/rooms.png)

/home (once user enters a canvas)

![home canvas](documentation/canvas.png)

## Site map

![site map](documentation/site_map.png)


## System Design
![system design map](documentation/system_design_map.png)


## User Stories or Use Cases

1. as a user, I can enter a display name for myself
2. as a user, I can choose from one of three global canvases
3. as a user, I can see all previously created designs, ideas, and creativity from all users that preceeded me
4. as a user, I can freely express my own designs and ideas on the canvas using the tools at my disposal (lines, shapes, sticky notes, stickers, text)
5. as a user, I can edit all layers on the canvas (resizing, editing the color, changing the thickness, etc.)
6. as a user, I can see all other live users in the canvas creating and moving in real-time
7. as a user, I can change the music that is playing
8. as a user, I can save the current state of the canvas via a .png export

## Research Topics

* (6 points) Use of **client-side** JavaScript library: [p5.js](https://p5js.org/)
  * p5.js is a JS client-side frontend library used for creating graphic and interactive tools and experiences
  * Artists and Design-heavy programmers choose p5.js as a common library to create randomly-generated art, interactive experiences, and quick components to render graphics

* (4 points) Load Balancing & Performance Optimizations (server-side JS library)
    * Sending over constant data of deleting, adding, and editing layers across multiple users can eventually overload the server
    * To mitigate this, using Socket.io's Node.js clusters can help with performance issues when many users are connected
    * Also known as [sticky load balancing](https://socket.io/docs/v4/using-multiple-nodes#using-nodejs-cluster) as per Socket.IO docs
    * [Performance Tuning](https://socket.io/docs/v4/performance-tuning/)

10 points total out of 10 required points

## [Link to Initial Main Project File](app.mjs)

## Annotations / References Used

1. [p5.js docs](https://p5js.org/reference/) - [sketch.js](./public/sketch.js): used for custom graphic/layer tools + canvas

# 📍 Milestone 2

## AJAX w/API Endpoints (2 Forms)

* [`api/room/join`](https://github.com/joshle298/JigJam/blob/a78544423400787e43d6cac665394dd38a96fa68/public/sketch.js#L129)
* [`api/user/create`](https://github.com/joshle298/JigJam/blob/a78544423400787e43d6cac665394dd38a96fa68/public/sketch.js#L101)

### POST/GET API & DATA (MongoDB) Demo

https://github.com/joshle298/JigJam/assets/59464508/b20a5cfe-5a9e-4ab9-ad2f-2ac3d704e3dc

## [Progress on Differential Synchronization Research Topic](https://github.com/joshle298/JigJam/blob/a78544423400787e43d6cac665394dd38a96fa68/db.js#L30)

# 📍 Milestone 3

## AJAX Interaction w/API Endpoints

* `api/layers/create`
  * This third AJAX form is used to save the current state of the canvas for new and returning users to see when they join JigJam (essentially picking up where you left off: save state).
  * With each line that is created by any user, the layer data is sent to the server where it is then stored in the `Layer` collection in our MongoDB database. Where such data can be retrieved on-load of new users and manipulated (delete, edit, etc.)
  * Layer data can be retrieved [here](https://jigjam.live/api/layers)
  * The post has only been implemented for new lines. However, the movements of the lines have also been implemented. The other tools are to come soon!

### POST/GET Layers API & Data Demo:
* The demo shows two separate users where, upon joining a canvas, all previously created layers are rendered
* The rightmost page is showing the layer data retrieved and updated to the database: [https://jigjam.live/api/layers](https://jigjam.live/api/layers)

https://github.com/joshle298/JigJam/assets/59464508/284c4ccc-c9a1-4415-a7ee-0211926c71ef

## Research Topics (Significant Progress)

### Use of **client-side** JavaScript library: [p5.js](https://p5js.org/)
(Used heavily [here](https://github.com/nyu-csci-ua-0467-001-002-spring-2024/final-project-joshle298/blob/bfd81260a591287a916651d99f12b39764a06116/public/sketch.js) but is not limited to most other p5.js components in the repo) p5.js's library has been used heavily throughout the project thus far. The continued exploration and implementation of its frontend components have helped create almost 100% of all the front-end of JigJam. It has been a journey navigating how to connect the nuances and quirks of Socket.io's behavior within the client-side library. The flow of creating a new front-end component and moving such data to our database to be retrieved and modified by users is complete and will be easily transferrable between the rest of the tools (only lines are available in the current working state)!

### Load Balancing & Performance Optimizations (server-side JS library)
When looking at ways to optimize the websocket server's performance, I came across a replacement module, [eiows](https://socket.io/docs/v3/server-installation/). However, after installing and deploying to my server, I realized that such implementations are either deprecated or not supported as much as socket.io's default, `ws`. Other ways I am planning to optimize the server is through [performance tuning](https://socket.io/docs/v4/performance-tuning/), where I can install `ws` native add-ons such as [bufferutil](https://www.npmjs.com/package/bufferutil) and [utf-8-validate](https://www.npmjs.com/package/utf-8-validate). Though not necessary, if for some reason JigJam reaches a substantial amount of live users at a given time, using [sticky load balancing](https://socket.io/docs/v4/using-multiple-nodes#using-nodejs-cluster) would be advantageous, which can be implemented in the next iteration.

# 🏁 Project Submission

## Research Topics (Complete)

### Use of **client-side** JavaScript library: [p5.js](https://p5js.org/)
(Used heavily [here](https://github.com/nyu-csci-ua-0467-001-002-spring-2024/final-project-joshle298/blob/bfd81260a591287a916651d99f12b39764a06116/public/sketch.js) but is not limited to most other p5.js components in the repo) p5.js's library has been used heavily throughout the project thus far. The continued exploration and implementation of its frontend components have helped create almost 100% of all the front-end of JigJam. It has been a journey navigating how to connect the nuances and quirks of Socket.io's behavior within the client-side library. The flow of creating a new front-end component and moving such data to our database to be retrieved and modified by users is complete and will be easily transferrable between the rest of the tools (only lines are available in the current working state)!

### Load Balancing & Performance Optimizations (server-side JS library)
When looking at ways to optimize the websocket server's performance, I came across a replacement module, [eiows](https://socket.io/docs/v3/server-installation/). However, after installing and deploying to my server, I realized that such implementations are either deprecated or not supported as much as socket.io's default, `ws`. Other ways I am planning to optimize the server is through [performance tuning](https://socket.io/docs/v4/performance-tuning/), where I can install `ws` native add-ons such as [bufferutil](https://www.npmjs.com/package/bufferutil) and [utf-8-validate](https://www.npmjs.com/package/utf-8-validate). Though not necessary, if for some reason JigJam reaches a substantial amount of live users at a given time, using [sticky load balancing](https://socket.io/docs/v4/using-multiple-nodes#using-nodejs-cluster) would be advantageous, which can be implemented in the next iteration.

# Miscellaneous (not related to AIT project guidelines)
## 🛠️ Todo
- [x] Migrate hosting to AWS, Google Cloud, or Heroku (and publish to JigJam's official domain)
- [ ] Save state for all tools (only line implemented - weights)
- [ ] Multi-Canvas experience
- [ ] Google-authentication login for users
- [ ] # of users in canvas and who
- [ ] Live cursor tracking
- [ ] Storing the current state of canvases for new users
- [ ] More tools!
- [ ] Commenting
- [ ] And so much more!!

## 🌐 Running Local Instance of JigJam
1. `npm install` (only do once globally)
2. `npx nodemon server.js`
3. Navigate to `localhost:3000`
