import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(res:NextApiResponse, req:NextApiRequest){


    if(req.method !== "POST")
        res.status(404).send("404");

    
    res.status(200).send("Great");
}