import React, { useState } from "react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import puppeteer from "puppeteer";
import TableWrapper from "#/components/common/TableData/TableWrapper";
import axios from "axios";
import Link from "next/link";

const production = "https://pollitik-scrapper.herokuapp.com/";
const development = "http://localhost:3000/";
const main_url = process.env.NODE_ENV === 'production' ? production : development;

const Scrape = ({
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
      <TableWrapper
        tableView={view}
        data={data?.length ? data : [[]]}
        folders={countries}
      />
    </div>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const url = ctx.query.url as string;
  const client = axios.create({
    baseURL: main_url,
    withCredentials: false,
  });

  if (!url)
    return {
      redirect: {
        destination: "/",
      },
      props: {},
    };

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: [
      "--no-sandbox",
      "--incognito",
      "--single-process",
      "--no-zygote",
      "--disable-setuid-sandbox",
    ],
  });
  const page = await browser.newPage();

  if (url === "https://morningconsult.com/global-leader-approval/") {
    const data: any[][] = [];
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

    const googleDriveFolders = await client.post("api/googledrive", {
      query: "'0B1t8CP92v4NSdnRGMVR0Y3NKckE'" + " in parents",
    });

    console.log(googleDriveFolders);
    return {
      props: {
        data,
        countries: googleDriveFolders.data,
      },
    }
  }

  
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const data: any[][] = await page.evaluate(() => {
    const isDate = (date: string) => {
      return !isNaN(Date.parse(date));
    };

    const tables = document.querySelectorAll("table");
    const returnData: any[][] = [];

    tables.forEach((table) => {
      const tableRows = table.querySelectorAll("tr");
      const tableDataArr: any[] = [];
      tableRows.forEach((tr) => {
        const tableHeader = tr.querySelectorAll("th");
        let tableExist;
        if (tableHeader.length) tableExist = tableHeader;
        else tableExist = tr.querySelectorAll("td");
        const rowData: any[] = [];
        let aTags: any[][] = [];

        tableExist.forEach((td, index) => {
          const a = td.querySelector("a");

          if (td.dataset.sortValue) {
            const date = isDate(td.dataset.sortValue);

            if (date) {
              const dateObj = new Date(td.dataset.sortValue as string);

              rowData.push(dateObj.toLocaleDateString("en-us"));
            } else rowData.push(td.dataset.sortValue);

            return;
          }
          if (a) {
            aTags.push([a.href, index]);
          }

          rowData.push(
            td.innerText.replaceAll("\n", "") &&
              td.innerText.replaceAll(",", "")
          );
        });

        if (rowData.length == 0) return;

        if (aTags.length > 0) rowData.push(aTags);

        tableDataArr.push(rowData);
      });

      tableDataArr.splice(1, 1);
      returnData.push(tableDataArr);
    });

    return returnData;
  });

  const googleDriveFolders = await axios.post("https://pollitik-scrapper.herokuapp.com/api/googledrive", {
    query: "'0B1t8CP92v4NSdnRGMVR0Y3NKckE'" + " in parents",
  });

  console.log(process.env.NODE_ENV)
  console.log(googleDriveFolders.data);

  // console.log(data);

  return {
    props: { data, countries: googleDriveFolders.data},
  };
};

export default Scrape;
