import React from "react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import puppeteer from "puppeteer";
import TableData from "#/components/common/TableData";
import axios from "axios";
import Link from "next/link";


const production = "https://pollitik-scrapper.herokuapp.com/";
const development = "http://localhost:3000/";
const main_url = (process.env.NODE_ENV ? production : development);

const scrape = ({
  data,
  countries
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div className="flex flex-col justify-center items-center px-10">
      <ul>
        <li>
          <Link href="/">
            <a style={{ color: "black" }}>Go Back</a>
          </Link>
        </li>
      </ul>
      {/* {data?.length &&
        data.map((table, index) => (
          <TableData
            countries={countries}
            key={index}
            data={table}
            id={String(index)}
          />
        ))} */}
        {countries}
    </div>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const url = ctx.query.url as string;
  const client = axios.create({
    baseURL : main_url,
    withCredentials: false,
  })

  if (!url)
    return {
      redirect: {
        destination: "/",
      },
      props: {},
    };


 
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport:null,
    args: ["--no-sandbox","--incognito", "--single-process", "--no-zygote","--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // data = await page.title();
  const data = await page.evaluate(() => {
    const isDate = (date: string) => {
      return !isNaN(Date.parse(date));
    };

    const tables = document.querySelectorAll("table");
    const data: any[] = [];

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

        if(aTags.length > 0) rowData.push(aTags);
        
        tableDataArr.push(rowData);
      });

      tableDataArr.splice(1,1);
      data.push(tableDataArr);
    });

    return data;
  });

  // const res2 = await axios.post("https://pollitik-scrapper.herokuapp.com//api/googledrive", {
  //   query: "'0B1t8CP92v4NSdnRGMVR0Y3NKckE'" + " in parents",
  // });

  const res = await client.get("api/googledrive");

  console.log(res);


  return {
    props: { data, countries:res.data},
  };
};

export default scrape;
