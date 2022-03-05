import React from "react";
import { GetServerSideProps } from "next";
import puppeteer from "puppeteer";
import TableData from "#/components/layouts/TableData";

const morningconsult = ({
  googleSheetsInput,
}: {
  googleSheetsInput: any[];
}) => {
  return (
    <div className="">
      {googleSheetsInput.map((data, index) => (
        <TableData key={index} data={data} />
      ))}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const googleSheetsInput: any[] = [];
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto("https://morningconsult.com/global-leader-approval/", {
    waitUntil: "domcontentloaded",
  });
  const data = await page.evaluate(() => {
    // @ts-ignore
    return mc_timeline_filterable;
  });

  const inputData = (
    index: number,
    amountOfData: number,
    presidentArr: any[]
  ) => {
    for (let b = 0; b < amountOfData; b++) {
      const date = new Date(data[1][0][index][b][0] * 1000);
      const dateTime = date.toLocaleDateString();
      const presidentNameInput = data["1"][0][index][b][1];
      const approvalRateInput = data["1"][0][index][b][2];
      const disapprovalInput = data["1"][0][index][b][3];

      presidentArr.push([
        presidentNameInput,
        dateTime,
        approvalRateInput,
        disapprovalInput,
      ]);
    }
  };

  for (let t = 0; t < 2; t++) {
    const presidentArr: any[] = [];
    inputData(t, data["1"][0][t].length, presidentArr);
    googleSheetsInput.push(presidentArr);
  }

  return {
    props: {
      googleSheetsInput,
    },
  };
};

export default morningconsult;
