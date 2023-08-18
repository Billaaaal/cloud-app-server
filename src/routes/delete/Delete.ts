import express from "express";
import admin from "firebase-admin";
import {
  readdirSync,
  rmSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  renameSync,
} from "fs";

var router = express.Router();

var serviceAccount = require("../../credentials.json");

router.use(express.json());

router.post("/", (req, res) => {
  const idToken = req.headers.authorization!.split(" ")[1];
  //console.log(idToken);
  const path = req.body.path;

  if (!idToken) {
    res.status(400).json({ message: `Error` }).send();
  } else {
    //console.log("Verifying token...")

    admin
      .auth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        const uid = decodedToken.uid;

        //return res.json({ message: `Welcome, this is the backend ${decodedToken.email}` });
        //createNewUser(uid)

        //createFolderInDB(uid, path, folderName);

        var db = admin.database();
        //for realtime database

        var pathToElement = "users/" + uid + path.split(".").join(",");

        db.ref(pathToElement)
          .remove()
          .then(function () {
            //recreateWithNewNameInDB(path, originalName, newName, uid, data);
            //console.log("Removing " + "./files/" + uid + path);
            rmSync("./files_folder/" + uid + path, {
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

export default router;
