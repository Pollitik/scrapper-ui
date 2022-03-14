import { google } from "googleapis";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(404).send("Folder doesn't exist");

  const { data } = req.body;

  data.forEach((row: any[]) => {
    const aTags = row[row.length - 1];
    aTags.forEach((linkMeta: any) => {
      row[linkMeta[1]] = `=HYPERLINK("${linkMeta[0]}", "${
        row[linkMeta[1]]
      }")`;
    });

    row.pop();
  });

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
  const sheets = google.sheets({ version: "v4", auth: authSheets });

  const choosenFolder = req.body.folderId;
  const sheetName = req.body.sheetName;

  const fileMetaData = {
    name: sheetName,
    mimeType: "application/vnd.google-apps.spreadsheet",
    parents: [choosenFolder],
  };

  const request = {
    spreadsheetId: process.env["SHEET_ID"],
    auth: authSheets,
    range: `${sheetName}!A:Z`,
  };

  async function sendGoogleSheet() {
    // try {
    //   await sheets.spreadsheets.batchUpdate({
    //     spreadsheetId: process.env["SHEET_ID"],
    //     requestBody: {
    //       requests: [{ addSheet: { properties: { title: sheetName } } }],
    //     },
    //   });
    // } catch (e) {
    //   console.log(e);
    // }

    // let sheet = await (
    //   await sheets.spreadsheets.values.get(request)
    // ).data.values;

    let newSheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: sheetName,
        },
      },
    });

    // const media = {
    //   mimeType: "text/csv",
    //   body: await fs.createReadStream("test.csv"),
    // };

    const updateSheet = await drive.files.update({
      fileId: String((newSheet).data.spreadsheetId),
      addParents:`${choosenFolder}`,
      fields: 'id, parents'
    })

    const googleSheetsOptions = {
      auth : authSheets,
      spreadsheetId: String(newSheet.data.spreadsheetId),
      range: `A:${String.fromCharCode(65 + data[0].length - 2)}`, //${sheetName}! ${String.fromCharCode(65 + data[0].length - 2)}
      valueInputOption: "USER_ENTERED",
      resource: { values: data}
    }

    let store = await sheets.spreadsheets.values.append(googleSheetsOptions);



    // await drive.files.create({
    //   auth: authDrive,
    //   requestBody: fileMetaData,
    //   media: media,
    // });

    res.status(200).send(store);
  }

  if (req.method === "POST") {
    sendGoogleSheet();
  }

  // try {
  //   await sendGoogleSheet();

  //   // res.send(await drive.files.list());
  // } catch (err) {
  //   res.status(500).send(err);
  // }
}
