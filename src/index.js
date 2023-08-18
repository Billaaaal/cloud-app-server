"use strict";
//create an express app
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
//import middleware from "./middleware/index";
const firebase_admin_1 = __importDefault(require("firebase-admin"));
//import the realtime database
const createuser_1 = __importDefault(require("./routes/createuser/createuser"));
const upload_1 = __importDefault(require("./routes/upload/upload"));
const newfolder_1 = __importDefault(require("./routes/newfolder/newfolder"));
const rename_1 = __importDefault(require("./routes/rename/rename"));
const Delete_1 = __importDefault(require("./routes/delete/Delete"));
const download_1 = __importDefault(require("./routes/download/download"));
var serviceAccount = require("./credentials.json");
//
//console.log("Hello world !");
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
    databaseURL: "https://cloudapp-b1e10-default-rtdb.europe-west1.firebasedatabase.app",
});
const app = (0, express_1.default)();
const port = 5000;
//app.use(express.json({limit: '5000mb'}));
app.use((0, cors_1.default)());
app.use("/api/create-user", createuser_1.default);
app.use("/api/upload", upload_1.default);
app.use("/api/new-folder", newfolder_1.default);
app.use("/api/rename", rename_1.default);
app.use("/api/delete", Delete_1.default);
app.use("/api/download", download_1.default);
//app.use(middleware.decodeToken)
//app.get("/api/listfiles")
//app.get("/api/uploadfile")
//app.get("/api/downloadfile")
//app.get("/api/deletefile")
app.listen(port, () => {
    console.log(`server is listening on ${port}`);
});
