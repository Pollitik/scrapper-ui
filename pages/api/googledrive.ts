import { google } from "googleapis";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  // if (req.method != "POST") {
  //   console.log(req.method);
  //   return res.status(404).send("Invalid route");
  // }
 
  const test:any[] = [2,3,4,3,2,2]
  const scopes = ["https://www.googleapis.com/auth/drive", "profile"];
  const creds = process.env["GOOGLE_APPLICATION_CREDENTIALS"];

  const auth = new google.auth.GoogleAuth({
    keyFile: creds,
    scopes: scopes,
  });

  var pageToken: any = null;

  const drive = google.drive({ version: "v3", auth });

  const query2 = req.body.query;

  if (req.method === "POST") {
    try {
      const resApi = await drive.files.list({
        q: `${query2} and mimeType = 'application/vnd.google-apps.folder'`,
        pageSize: 200,
        fields: "nextPageToken, files(id,name)",
        spaces: "drive",
        pageToken: pageToken,
        orderBy: "name asc",
      });
      const folders = resApi.data.files;
      res.status(200).json(folders);
    } catch (err) {
      return res.status(500).send("Something went wrong");
    }
  }

  //  if(req.method === "GET"){
  //   try{
  //      res.status(200).json(test);
  //   }
  //   catch(err){
  //      res.status(500).send("Sever error");
  //   }
  // }
  // else{
  //   res.status(404).send("Invalid route");
  // }

}
