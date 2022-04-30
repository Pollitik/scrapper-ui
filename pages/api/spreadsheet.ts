import { google } from "googleapis";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(404).send("route doesn't exist");

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

  const { data } = req.body;

  data.forEach((row: any[]) => {
      const aTags = row[row.length - 1];
  

      if(typeof aTags === "object"){
        aTags.forEach((linkMeta: any) => {
        row[linkMeta[1]] = `=HYPERLINK("${linkMeta[0]}", "${row[linkMeta[1]]}")`;

      });
      row.pop();
    }
  });

  console.log(data);

  const choosenFolder = req.body.folderId;
  const sheetName = req.body.sheetName;

  try {
    let newSheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: sheetName,
        },
      },
    });

    const googleSheetsOptions = {
      auth: authSheets,
      spreadsheetId: String(newSheet.data.spreadsheetId),
      range: `A:${String.fromCharCode(65 + data[0].length - 2)}`, //${sheetName}! ${String.fromCharCode(65 + data[0].length - 2)}
      valueInputOption: "USER_ENTERED",
      resource: { values: data },
    };

    await drive.files.update({
      fileId: String(newSheet.data.spreadsheetId),
      addParents: `${choosenFolder}`,
      fields: "id, parents",
    });

    await sheets.spreadsheets.values.append(googleSheetsOptions);

    res.status(200).send("Stored in the sheets");
  } catch (err) {
    res.status(500).send("something went wrong");
  }
}
