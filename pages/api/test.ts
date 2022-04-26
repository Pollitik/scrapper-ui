import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(res:NextApiResponse, req:NextApiRequest){

    

    if(req.method == "GET"){
        res.json({data:"Server"})
        res.status(200).send("GET");
    }
    else if(req.method == "POST")
        res.status(200).send("POST");
    else
        res.status(404).send("404");
}