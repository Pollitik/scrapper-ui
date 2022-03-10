import { google } from "googleapis";
import type { NextApiRequest, NextApiResponse } from "next";
import FormData from "form-data";
import { drive } from "googleapis/build/src/apis/drive";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const dateFilter = new Date('January 01, 2022').toISOString();

  // axios.create({
  //   baseURL:'https://www.googleapis.com/drive/v3/files',
  //   params : {
  //     q: `createdTime >= '${dateFilter}' or modifiedTime >= '${dateFilter}'`,
  //     fields: 'files(id,name,modifiedTime,createdTime,mimeType,size)',
  //     spaces: 'drive',
  //  },
  //     headers : {
  //       authorization: `Bearer ${accessToekn}`
  //     }
  // });
  const scopes = ["https://www.googleapis.com/auth/drive", "profile"];
  const creds = process.env["GOOGLE_APPLICATION_CREDENTIALS"];

  const auth = new google.auth.GoogleAuth({
    keyFile: creds,
    scopes: scopes,
  });

  if (req.method != "POST") res.status(404).send("Invalid route");

  var pageToken: any = null;



  const drive = google.drive({ version: "v3", auth });
  // const query = "'0B1t8CP92v4NSdnRGMVR0Y3NKckE'" + " in parents";

  const query2 = req.body.query



  
  async function list() { 
    const response = drive.files.list(
      {
        q: `${query2} and mimeType = 'application/vnd.google-apps.folder'`,
        pageSize: 200,
        fields: "nextPageToken, files(id,name)",
        spaces: "drive",
        pageToken: pageToken
      }).then((resApi) => {
        switch(resApi.status){
          case 200:
            const folders = resApi.data.files;
            res.status(200).json(folders);
        }
      })
  }

  if(req.method === "POST"){
    list();
  }

  // if(req.method === "GET"){

  // }

  if(req.method !== "POST"){
    res.status(405).send("Only POST reuests allowed")
  }
  
}
