"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const fs_1 = require("fs");
const zip_a_folder_1 = require("zip-a-folder");
const crypto_1 = __importDefault(require("crypto"));
var router = express_1.default.Router();
var serviceAccount = require("../../credentials.json");
router.use(express_1.default.json());
router.get("/", (req, res) => {
    const idToken = req.headers.authorization.split(" ")[1];
    const path = req.headers.path;
    const type = req.headers.type;
    const elementName = req.headers.name;
    console.log("Received download request");
    //console.log(req.headers);
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
            console.log("Token verified successfully");
            if (type === "folder") {
                if (!(0, fs_1.existsSync)("./temp")) {
                    (0, fs_1.mkdirSync)("./temp");
                }
                const tempPath = "./temp/" + crypto_1.default.randomBytes(4).readUInt32LE(0) + ".zip";
                (0, zip_a_folder_1.zip)("./files_folder/" + uid + path, tempPath).then(() => {
                    //res.download(tempPath, () => {
                    //  rmSync(tempPath);
                    //});
                    console.log("ZIP written successfully");
                    const stream = (0, fs_1.createReadStream)(tempPath);
                    stream.on("start", () => {
                        console.log("Started downloading file...");
                    });
                    stream.on("error", (err) => {
                        console.log(err);
                    });
                    stream.on("end", () => {
                        console.log("Downloaded file !");
                        (0, fs_1.rmSync)(tempPath);
                    });
                    //res.setHeader("Content-Type", "application/pdf");
                    //res.setHeader("Content-Disposition", 'inline; filename="js.pdf"');
                    res.setHeader("Content-Type", "application/zip");
                    res.setHeader("Content-Disposition", `inline; filename="${elementName}.zip}"`);
                    res.setHeader("Content-Length", (0, fs_1.statSync)(tempPath).size);
                    //DELETE TEMP FILE UNLINK OR RM
                    stream.pipe(res);
                });
            }
            else {
                const stream = (0, fs_1.createReadStream)("./files_folder/" + uid + path);
                //console.log("./files_folder/" + uid + path)
                //console.log("Content-Type" + ` application/${type}`);
                //console.log(
                //  "Content-Disposition" + ` inline; filename="${elementName}"`
                //);
                //res.setHeader("Content-Type", "application/pdf");
                //res.setHeader("Content-Disposition", 'inline; filename="js.pdf"');
                res.setHeader("Content-Type", `application/${type}`); /////////////
                res.setHeader("Content-Disposition", `inline; filename="${elementName}"`);
                res.setHeader("Content-Length", (0, fs_1.statSync)("./files_folder/" + uid + path).size);
                stream.on("start", () => {
                    //console.log("Started downloading file...");
                });
                stream.on("error", (err) => {
                    //console.log(err);
                });
                stream.on("end", () => {
                    //console.log("Downloaded file !");
                });
                stream.pipe(res);
                //console.log("Downloading file..." + "./files_folder/" + uid + path);
                //res.download("./files_folder/" + uid + path);
            }
            //return res.json({ message: `Welcome, this is the backend ${decodedToken.email}` });
            //createNewUser(uid)
            //createFolderInDB(uid, path, folderName);
            //var db = admin.database();
            //for realtime database
            //var pathToElement = "users/" + uid + path.replace(".", ",");
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
//
//const tempPath =
//        "./temp/" + crypto.randomBytes(4).readUInt32LE(0) + ".zip";
//const stream = createWriteStream(tempPath);
//zip("./files_folder/" + uid + path, undefined, {
//  customWriteStream: stream,
//}).then(() => {
//console.log("Wrote to zip file");
//res.setHeader("Content-Type", "application/zip");
//res.setHeader(
//  "Content-Disposition",
//  `inline; filename="${elementName}.zip}"`
//);
//const readStream = createReadStream(tempPath);
//DELETE TEMP FILE UNLINK OR RM
//readStream.pipe(res);
