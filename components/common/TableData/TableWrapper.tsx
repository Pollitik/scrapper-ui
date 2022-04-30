import React, { useState, useRef } from "react";
import LoadingIcon from "../LoadingIcon";
import TableData from ".";
import axios from "axios";
import TableNav from "./TableNav";


interface Props {
  folders: string[];
  data: any[][];
  tableView: string;
}

const production = "https://pollitik-scrapper.herokuapp.com/";
const development = "http://localhost:3000/";
const main_url = process.env.NODE_ENV ? production : development;

const client = axios.create({
  baseURL: main_url,
  withCredentials: false,
});

const addAllTables = (tableData: any[][] | undefined) => {
  let allTables: any[][] = [];
  let trackIndex = 0;

  tableData?.map((table, table_index) => {
    table.map((row, row_index) => {
      if (table_index == 0) {
        const header: string[] = row;
        allTables.push(header);
      } else {
        if (row_index != 0) allTables.push(row);

        if (table_index != trackIndex) {
          trackIndex = table_index;
          allTables.push([]);
        }
      }
    });
  });

  return allTables;
};

const TableWrapper: React.FC<Props> = ({ data, folders, tableView }) => {
  const fileName = useRef<HTMLInputElement>(null);
  const choosenFolder = useRef<String>("0B1t8CP92v4NSOUExcVFpNjBlZGs");
  const [loading, setLoading] = useState<boolean>(false);

  const tableDisplay = (view: String) => {
    if (view == "View one table at a time") {
      return <TableNav folders={folders} tables={data} />;
    }
    return data?.map((table: any, index: number) => {
      return (
        <TableData
          id={String(index)}
          key={index}
          data={table}
          countries={folders}
        />
      );
    });
  };

  return (
    <div className="">
      <br />
      <div className="flex flex-col justify-center items-center px-10">
        <h1>Add all tables</h1>
        <input
          type="text"
          placeholder="FileName"
          className="border-2 border-black"
          ref={fileName}
        />
        <button
          onClick={async () => {
            await setLoading(true);
            const res = await client.post(
              "api/spreadsheet",
              {
                folderId: choosenFolder.current,
                sheetName: fileName.current?.value || "trash",
                data: addAllTables(data),
              }
            );

            await setLoading(false);
          }}
        >
          Submit
        </button>

        <select
          onChange={(e: any) => {
            const selectedFolder = document.getElementById(`${e.target.value}`);
            choosenFolder.current = String(
              selectedFolder?.getAttribute("data-id")
            );
            console.log(choosenFolder);
          }}
        >
          {folders.map((element: any, index: any) => {
            return (
              <option
                id={element.name}
                className="cursor-pointer"
                data-id={element.id}
                key={element.id}
              >
                {element.name}
              </option>
            );
          })}
        </select>

        {loading && <LoadingIcon />}
      </div>
      <br />
      {tableDisplay(tableView)}
    </div>
  );
};

export default TableWrapper;
