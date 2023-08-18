"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const fs_1 = require("fs");
var router = express_1.default.Router();
var serviceAccount = require("../../credentials.json");
function createFolderInDB(uid, path, folderName) {
    var db = firebase_admin_1.default.database();
    //for realtime database
    db.ref("users/" + uid)
        .once("value")
        .then(function (snapshot) {
        if (!snapshot.exists()) {
            //console.log("user already exists")
            db.ref("users/" + uid + "/My Files")
                .set({
                name: "My Files",
                path: "/My Files/",
                type: "folder",
                date: Date.now(),
                size: "2 MB",
            })
                .then(() => {
                //   createNewUserFolder(uid)
                const dbRef = "users/" + uid + path + folderName;
                //console.log("Uploading to " + dbRef)
                //console.log("Creating folder in DB...");
                db.ref(dbRef.split(".").join(","))
                    .update({
                    date: Date.now(),
                    name: folderName,
                    path: path + folderName,
                    type: "folder",
                })
                    .then(() => {
                    //always handle file doesn't exist and also always give its properties such as name etc...
                    createFolder(uid, path, folderName);
                    //createNewUserFolder(uid)
                });
            });
        }
        else {
            const dbRef = "users/" + uid + path + "/" + folderName;
            //console.log("Uploading to " + dbRef)
            //console.log("Creating folder in DB...");
            db.ref(dbRef.split(".").join(","))
                .update({
                date: Date.now(),
                name: folderName,
                path: path + "/" + folderName,
                type: "folder",
                size: "2 MB",
            })
                .then(() => {
                //always handle file doesn't exist and also always give its properties such as name etc...
                createFolder(uid, path, folderName);
                //createNewUserFolder(uid)
            });
        }
    });
}
function createFolder(uid, path, folderName) {
    try {
        (0, fs_1.mkdirSync)("files_folder/" + uid + path + "/" + folderName);
    }
    catch (e) {
        //console.log("Error");
    }
}
router.use(express_1.default.json());
router.post("/", (req, res) => {
    //console.log(req.headers)
    //console.log(req.headers)
    //console.log("Uploading...")
    //console.log(req.file?.buffer)
    //console.log(req.body.pathToFile)
    const idToken = req.headers.authorization.split(" ")[1];
    const path = req.body.path;
    //console.log("Trying  " + path);
    const folderName = req.body.folderName;
    if (!idToken) {
        res.status(400).json({ message: `Error` }).send();
    }
    else {
        //console.log("Verifying token...")
        firebase_admin_1.default
            .auth()
            .verifyIdToken(idToken)
            .then((decodedToken) => {
            const uid = decodedToken.uid;
            //return res.json({ message: `Welcome, this is the backend ${decodedToken.email}` });
            //createNewUser(uid)
            createFolderInDB(uid, path, folderName);
            res.status(200).json({ message: `Success` }).send();
            //console.log("Welcome " + decodedToken.email)
        })
            .catch((error) => {
            // Handle error
            res.status(400).json({ message: `Error` }).send();
            //console.log(error);
        });
    }
});
exports.default = router;
