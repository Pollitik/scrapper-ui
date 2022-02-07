import React from "react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import puppeteer from "puppeteer";
import TableData from "#/components/layouts/TableData";

const scrape = ({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div className="flex flex-col justify-center items-center px-10">
      {data?.length &&
        data.map((table, index) => <TableData key={index} data={table} />)}
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

  const browser = await puppeteer.launch();
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
        const tableData = tr.querySelectorAll("td");
        const rowData: any[] = [];

        tableData.forEach((td) => {
          const boldTag = td.querySelector("b");

          if (td.dataset.sortValue) {
            const date = isDate(td.dataset.sortValue);

            if (date) {
              const dateObj = new Date(td.dataset.sortValue as string);

              rowData.push(dateObj.toLocaleDateString("en-us"));
            } else rowData.push(td.dataset.sortValue);

            return;
          }

          if (boldTag) {
            rowData.push(boldTag.innerText);
          } else {
            rowData.push(td.innerText);
          }
        });
        tableDataArr.push(rowData);
      });
      data.push(tableDataArr);
    });

    return data;
  });

  return {
    props: { data },
  };
};

export default scrape;
