"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const fs_1 = require("fs");
var router = express_1.default.Router();
function createNewUserInDatabase(uid) {
    var db = firebase_admin_1.default.database();
    //for realtime database
    db.ref("users/" + uid + "/My Files")
        .once("value")
        .then(function (snapshot) {
        if (snapshot.exists()) {
            //console.log("user already exists");
        }
        else {
            db.ref("users/" + uid + "/My Files/")
                .set({
                name: "My Files",
                path: "/My Files/",
                type: "folder",
                date: Date.now(),
                size: "2 MB",
            })
                .then(() => {
                createNewUserFolder(uid);
            });
        }
    });
}
function createNewUserFolder(uid) {
    //create a new user folder inside the file system
    //mkdirSync(`./files_folder/${uid}`)
    if (!(0, fs_1.existsSync)("./files_folder")) {
        (0, fs_1.mkdirSync)("./files_folder");
    }
    if ((0, fs_1.readdirSync)("./files_folder").includes(uid)) {
        //console.log("user folder already exists");
    }
    else {
        (0, fs_1.mkdirSync)(`./files_folder/${uid}/`);
        (0, fs_1.mkdirSync)(`./files_folder/${uid}/My Files/`);
        //console.log("user folder created");
    }
}
router.post("/", (req, res) => {
    //console.log(req.headers)
    //console.log(req.headers)
    const idToken = req.headers.authorization.split(" ")[1];
    if (!idToken) {
        res.status(400).json({ message: `Error` }).send();
    }
    else {
        //console.log("Verifying token...");
        firebase_admin_1.default
            .auth()
            .verifyIdToken(idToken)
            .then((decodedToken) => {
            const uid = decodedToken.uid;
            //        return res.json({ message: `Welcome, this is the backend ${decodedToken.email}` });
            //createNewUser(uid)
            createNewUserInDatabase(uid);
            res.status(200).json({ message: `Success` }).send();
            //console.log("Welcome " + decodedToken.email);
        })
            .catch((error) => {
            // Handle error
            res.status(400).json({ message: `Error` }).send();
            //console.log(error);
        });
    }
});
exports.default = router;
