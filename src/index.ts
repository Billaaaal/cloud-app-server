//create an express app

import express from "express";
import cors from "cors";
//import middleware from "./middleware/index";
import admin from "firebase-admin";
import { readdirSync, rmSync, writeFileSync, mkdirSync } from "fs";
//import the realtime database
import createuser from "./routes/createuser/createuser";
import upload from "./routes/upload/upload";
import newfolder from "./routes/newfolder/newfolder";
import rename from "./routes/rename/rename";
import Delete from "./routes/delete/Delete";
import download from "./routes/download/download";
var serviceAccount = require("./credentials.json");

//

//console.log("Hello world !");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://cloudapp-b1e10-default-rtdb.europe-west1.firebasedatabase.app",
});

const app = express();

const port = 5000;

//app.use(express.json({limit: '5000mb'}));

app.use(cors());


app.use("/api/create-user", createuser);

app.use("/api/upload", upload);

app.use("/api/new-folder", newfolder);

app.use("/api/rename", rename);


app.use("/api/delete", Delete);


app.use("/api/download", download);


//app.use(middleware.decodeToken)

//app.get("/api/listfiles")

//app.get("/api/uploadfile")

//app.get("/api/downloadfile")

//app.get("/api/deletefile")

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
