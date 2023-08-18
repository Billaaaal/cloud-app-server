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
function getElementContentFromDB(path, originalName, newName, uid) {
    var db = firebase_admin_1.default.database();
    //for realtime database
    var pathToElement = "users/" + uid + path.split(".").join(",");
    db.ref(pathToElement)
        .once("value")
        .then(function (snapshot) {
        if (snapshot.exists()) {
            //console.log("user already exists")
            const originalElement = snapshot.val();
            deleteElementInDB(path, originalName, newName, uid, originalElement);
        }
        else {
        }
    });
}
function deleteElementInDB(path, originalName, newName, uid, data) {
    var db = firebase_admin_1.default.database();
    //for realtime database
    var pathToElement = "users/" + uid + path.split(".").join(",");
    db.ref(pathToElement)
        .remove()
        .then(function () {
        recreateWithNewNameInDB(path, originalName, newName, uid, data);
    })
        .catch(function (error) {
        //console.log("Remove failed: " + error.message);
    });
}
function processItems(obj, oldPath, newPath) {
    for (const key in obj) {
        const item = obj[key];
        if (item.type === "folder") {
            // Update path for folders
            //item.path = item.path.replace(item, ",");
            item.path = item.path.replace(oldPath, newPath).split(".").join(",");
            // Recursively process nested items
            if (typeof item === "object" && item !== null) {
                //processItems(item, folderPath);
                obj[key] = processItems(obj, oldPath, newPath);
            }
        }
        else {
            item.path = item.path.replace(oldPath, newPath).split(".").join(",");
            // Update path for files
            //item.path = `${basePath}${item.name}`;
            // Perform actions for files (replace with your logic)
            // Example: Update recentFilesList
        }
    }
    return obj;
}
// Example data
// Call the function with the data
function recreateWithNewNameInDB(path, originalName, newName, uid, data) {
    var db = firebase_admin_1.default.database();
    //for realtime database
    var pathToNewElement = "users/" + uid + path.replace(originalName, newName).split(".").join(",");
    var pathToNewElement__ = path.replace(originalName, newName);
    data.name = newName;
    data.path = pathToNewElement__;
    if (data.type == "folder") {
        //var dataToSendToDB = processItems(data, path, pathToNewElement__);
        //sendToDB
        var tempData = JSON.stringify(data);
        //console.log(tempData)
        tempData = tempData.split(path).join(path.split(originalName).join(newName));
        //console.log("/////")
        //console.log(tempData)
        var dataToSendToDB = JSON.parse(tempData);
        db.ref(pathToNewElement)
            .set(dataToSendToDB)
            .then(function () {
            //renameElementInFileSystem(path, originalName, newName, uid, data);
            (0, fs_1.renameSync)("files_folder/" + uid + path, "files_folder/" + uid + path.replaceAll(originalName, newName));
        })
            .catch(function (error) {
            //console.log("Remove failed: " + error.message);
        });
    }
    else {
        //means it is a file
        db.ref(pathToNewElement)
            .set(data)
            .then(function () {
            //renameElementInFileSystem(path, originalName, newName, uid, data);
            (0, fs_1.renameSync)("files_folder/" + uid + path, "files_folder/" + uid + path.replaceAll(originalName, newName));
        })
            .catch(function (error) {
            //console.log("Remove failed: " + error.message);
        });
    }
}
function renameElementInFileSystem(path, originalName, newName, uid, data) { }
router.post("/", (req, res) => {
    const idToken = req.headers.authorization.split(" ")[1];
    const path = req.body.path;
    const originalName = req.body.originalName;
    const newName = req.body.newName;
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
            getElementContentFromDB(path, originalName, newName, uid);
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
