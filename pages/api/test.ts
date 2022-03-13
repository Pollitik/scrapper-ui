import { google } from "googleapis";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const scopes = ["https://www.googleapis.com/auth/drive.file", "profile"];

  const creds = process.env["GOOGLE_APPLICATION_CREDENTIALS"];

  const authDrive = new google.auth.GoogleAuth({
    keyFile: creds,
    scopes: scopes,
  });

  const authSheets = new google.auth.GoogleAuth({
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets.readonly",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  const drive = google.drive({ version: "v3", auth: authDrive });

  
  const choosenFolder = req.body.folderId;

  const sheetName = req.body.sheetName;

  const fileMetaData = {
    name: sheetName,
    mimeType: "application/vnd.google-apps.spreadsheet",
    parents: [choosenFolder],
  };



  async function sendGoogleSheet() {

    const media = {
      mimeType: "text/csv",
      body: await fs.createReadStream("test.csv"),
    };

    await drive.files.create({
      auth: authDrive,
      requestBody: fileMetaData,
      media:media
    });
  }

  if(req.method === "POST"){
    sendGoogleSheet();
  }


  if (req.method !== "POST") res.status(404).send("Folder doesn't exist");
}