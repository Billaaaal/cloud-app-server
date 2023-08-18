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
router.use(express_1.default.json());
router.post("/", (req, res) => {
    const idToken = req.headers.authorization.split(" ")[1];
    //console.log(idToken);
    const path = req.body.path;
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
            //createFolderInDB(uid, path, folderName);
            var db = firebase_admin_1.default.database();
            //for realtime database
            var pathToElement = "users/" + uid + path.split(".").join(",");
            db.ref(pathToElement)
                .remove()
                .then(function () {
                //recreateWithNewNameInDB(path, originalName, newName, uid, data);
                //console.log("Removing " + "./files/" + uid + path);
                (0, fs_1.rmSync)("./files_folder/" + uid + path, {
                    recursive: true,
                    force: true,
                });
                res.status(200).json({ message: `Success` }).send();
            })
                .catch(function (error) {
                //console.log("Remove failed: " + error.message);
                res
                    .status(400)
                    .json({ message: `Error while  checking token` })
                    .send();
            });
            //console.log("Welcome " + decodedToken.email)
        })
            .catch((error) => {
            // Handle error
            //console.log(error)
            res.status(400).json({ message: `Error while  checking token` }).send();
            //console.log(error);
        });
    }
});
exports.default = router;
