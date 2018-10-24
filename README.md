# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 1

For the **Restaurant Reviews** projects, I have incrementally converted a static webpage to a mobile-ready web application. In **Stage One**, I took a static design that lacks accessibility and converted the design to be responsive on different sized displays and accessible for screen reader use. I have also added a service worker to begin the process of creating a seamless offline experience for my users. On top of this I have leveraged Jake Archibalds IDB promise library to increase the performance of this app.

### Specification

This project has been forked from udacity/mws-restaurant-stage-1 repo. The code purposely had issues, and my task was to solve these issues, and optimize wherever possible. My job was to make the app work well when offline, make sure the app was accessible, and had very high performance. The current performance of the app matches or exceeds the lighthouse audits (score of 90) in three categories (PWA, Accessibility, and Performance). 

### What do I do from here?

1. In this folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer. 

In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.
2. Also be sure to clone the API server from this [repository](https://github.com/strangenectar/mws-restaurant-stage-3).
3. With your front-end server running, and the API server running, visit the site: `http://localhost:8000`, and feel free to look around.

## Leaflet.js and Mapbox:

This repository uses [leafletjs](https://leafletjs.com/) with [Mapbox](https://www.mapbox.com/). Mapbox is free to use, and does not require any payment information. 

### Note about ES6

Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write. 

