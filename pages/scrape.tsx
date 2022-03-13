import React from "react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import puppeteer from "puppeteer";
import TableData from "#/components/layouts/TableData";
import axios from "axios";

const scrape = ({
  data,
  countries,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div className="flex flex-col justify-center items-center px-10">
      {data?.length &&
        data.map((table, index) => (
          <TableData
            countries={countries}
            key={index}
            data={table}
            id={String(index)}
          />
        ))}
    </div>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const url = ctx.query.url as string;
  if (!url)
    return {
      redirect: {
        destination: "/",
      },
      props: {},
    };

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

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
        let aTag: HTMLAnchorElement | undefined;
        tableExist.forEach((td) => {
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
            a.href = a.href;
            a.target = "_blank";
            
            aTag = a;
          }
          rowData.push(td.innerText);
        });

        if (rowData.length == 0) return;
        rowData.push(aTag?.href);
        tableDataArr.push(rowData);
      });
      data.push(tableDataArr);
    });

    return data;
  });

  const res = await axios.post("http://localhost:3000/api/googledrive", {
    query: "'0B1t8CP92v4NSdnRGMVR0Y3NKckE'" + " in parents",
  });

  console.log(res.data);

  return {
    props: { data, countries: res.data },
  };
};

export default scrape;
