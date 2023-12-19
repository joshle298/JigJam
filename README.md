# JigJam

## 🗺️ Overview
Figma’s collaborative whiteboard platform. There are many features that FigJam offers, but we decided to focus on a few canvas/graphics tools and implemented them to work in a multi-user experience. FigJam has become an essential tool for real-time brainstorming, visualizing, and collaborating (especially in developing this project), so we thought it would be a fun challenge to recreate!
Our remake is called JigJam. It is a multi-user whiteboard where users can collaboratively add, delete, and modify graphics on a canvas in real-time. When first opening JigJam, users are prompted to enter their name. Users then advance to the home screen with options for different “rooms” or canvases to edit (work in progress currently; only one room is available). Once selecting a room, users will advance to the multi-user canvas.  

## 📽️ Demo
![E1CCDCBE-E82E-448C-8A49-033AAE50458A_1_102_o](https://github.com/joshle298/JigJam/assets/59464508/fb8ef6c9-7155-409c-829e-2214865e2318)

## 🛠️ Todo
- Migrate hosting to AWS, Google Cloud, or Heroku (and publish to JigJam's official domain)
- Multi-Canvas experience
- Google-authentication login for users
- /# of users in canvas and who
- Live cursor tracking
- Storing the current state of canvases for new users
- More tools!
- Commenting
- And so much more!!

## 🌐 Running Local Instance of JigJam
1. `yarn install` (only do once globally)
2. `yarn node server.js`
3. Navigate to `localhost:3000`
