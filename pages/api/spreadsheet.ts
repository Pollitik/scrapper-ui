import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = new google.auth.GoogleAuth({
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets.readonly",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env["SHEET_ID"];


  if (req.method == "GET") {
    const data = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A1:D1",
    });

    return res.json(data.data);
  }

  if (req.method != "POST") res.status(404).send("Invalid route");

  const sheetName = req.body.sheetName;
  const data = req.body.data;

  if (!sheetName || !data) res.status(400).send("missing parameters");

  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: sheetName } } }],
      },
    });
  } catch (e) {
    console.log(e);
  }

  const googleSheetsOptions = {
    auth,
    spreadsheetId: process.env["SHEET_ID"],
    range: `${sheetName}!A:${String.fromCharCode(65 + data[0].length - 1)}`,
    valueInputOption: "USER_ENTERED",
    resource: { values: data },
  };

  let store = await sheets.spreadsheets.values.append(googleSheetsOptions);

  res.status(200).json(store);
}
