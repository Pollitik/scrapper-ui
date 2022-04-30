import React, { useRef, useState } from "react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import puppeteer from "puppeteer";
import TableWrapper from "#/components/common/TableData/TableWrapper";
import axios from "axios";
import Link from "next/link";

const production = "https://pollitik-scrapper.herokuapp.com/";
const development = "http://localhost:3000/";
const main_url = process.env.NODE_ENV ? production : development;

const Morningconsult = ({
  data,
  countries,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [view, setView] = useState<string>("");
  return (
    <div className="flex flex-col justify-center items-center px-10">
      <ul>
        <li>
          <Link href="/">
            <a style={{ color: "black" }}>Go Back</a>
          </Link>
        </li>
      </ul>
      <select
        id="viewSelect"
        onChange={(e) => {
          setView(String(e.target.value));
        }}
      >
        <option id="viewOption1">View all tables</option>
        <option id="viewOption2">View one table at a time</option>
      </select>

      <TableWrapper data={data} folders={countries} tableView={view} />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const data: any[][] = [];
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--incognito",
      "--single-process",
      "--no-zygote",
      "--disable-setuid-sandbox",
    ],
  });

  const client = axios.create({
    baseURL: main_url,
    withCredentials: false,
  });

  const page = await browser.newPage();
  await page.goto("https://morningconsult.com/global-leader-approval/", {
    waitUntil: "domcontentloaded",
  });
  const tableData = await page.evaluate(() => {
    // @ts-ignore
    return mc_timeline_filterable;
  });

  const inputData = (index: number, amountOfData: number) => {
    const tempArr: any[] = [];

    tempArr.push(["Name", "Date", "Approval", "Disapproval"]);
    for (let b = 0; b < amountOfData; b++) {
      const date = new Date(tableData[1][0][index][b][0] * 1000);
      const dateTime = date.toLocaleDateString();
      const presidentNameInput = tableData["1"][0][index][b][1];
      const approvalRateInput = tableData["1"][0][index][b][2];
      const disapprovalInput = tableData["1"][0][index][b][3];

      tempArr.push([
        presidentNameInput,
        dateTime,
        approvalRateInput,
        disapprovalInput,
      ]);
    }
    data.push(tempArr);
  };

  for (let t = 0; t < tableData["1"][0].length; t++) {
    inputData(t, tableData["1"][0][t].length);
  }

  const res = await client.post("api/googledrive", {
    query: "'0B1t8CP92v4NSdnRGMVR0Y3NKckE'" + " in parents",
  });

  return {
    props: {
      data,
      countries: res.data,
    },
  };
};

export default Morningconsult;
