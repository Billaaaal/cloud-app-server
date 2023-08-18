"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const fs_1 = require("fs");
const multer_1 = __importDefault(require("multer"));
var router = express_1.default.Router();
var serviceAccount = require("../../credentials.json");
const upload = (0, multer_1.default)();
function writeFileToDisk(uid, filePath, fileName, fileBuffer) {
    //console.log("Writing file to disk...")
    //console.log(filePath + fileName)
    //mkdirSync("files_folder/" + uid + filePath, { recursive: true })
    try {
        (0, fs_1.writeFileSync)("files_folder/" + uid + filePath + "/" + fileName, fileBuffer);
    }
    catch (e) {
        //console.log("Error");
        //console.log;
    }
    //match error
}
function convertSize(sizeToConvert) {
    var units = ["B", "KB", "MB", "GB", "TB"], bytes = sizeToConvert, i;
    for (i = 0; bytes >= 1024 && i < 4; i++) {
        bytes /= 1024;
    }
    return bytes.toFixed(1) + units[i];
}
function createFileRecordInDB(uid, filePath, fileName, fileBuffer) {
    var db = firebase_admin_1.default.database();
    //for realtime database
    db.ref("users/" + uid)
        .once("value")
        .then(function (snapshot) {
        if (!snapshot.exists()) {
            //console.log("user already exists")
            //return error
        }
        else {
            const dbRef = "users/" + uid + filePath + "/" + fileName.split(".").join(",");
            //console.log("Uploading to " + dbRef)
            //console.log("Uploading file...");
            //console.log(filePath);
            ////console.log(fileName);
            //console.log(dbRef);
            db.ref(dbRef)
                .update({
                date: Date.now(),
                name: fileName,
                size: fileBuffer.length,
                path: filePath + "/" + fileName,
                type: fileName.split(".").pop(),
            })
                .then(() => {
                writeFileToDisk(uid, filePath, fileName, fileBuffer);
                //createNewUserFolder(uid)
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
        (0, fs_1.mkdirSync)(`./files_folder/${uid}`);
        //console.log("user folder created");
    }
}
router.post("/", upload.array("files"), (req, res) => {
    //console.log(req.headers)
    //console.log(req.headers)
    //console.log("Uploading...")
    if (!req.files) {
        res.status(400).json({ message: `Error` }).send();
    }
    //console.log(req.file?.originalname)
    //const fileName = req.file!.originalname
    //const fileBuffer = req.file!.buffer
    //const filePath = req.body.pathToFile
    //console.log(req.file?.buffer)
    const path = req.body.path;
    var fileKeys = Object.keys(req.files);
    //console.log(req.body.pathToFile)
    const idToken = req.headers.authorization.split(" ")[1];
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
            const uploadedFiles = req.files;
            for (const file of uploadedFiles) {
                // Handle the file, save it to disk, process it, etc.
                const fileName = file.originalname;
                const fileBuffer = file.buffer;
                createFileRecordInDB(uid, path, fileName, fileBuffer);
            }
            //createFileRecordInDB(uid, path, files[])
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
