import React, { useState, useRef, useEffect } from "react";
import TableData from ".";

interface Props {
  tables: any[][];
  folders: string[];
}

const TableNav: React.FC<Props> = ({ tables, folders }) => {
  // const tableIndex = useRef<String>("");
  const [tableIndex, setTableIndex] = useState<String>("");
  const [isRender, renderTable] = useState(false);


  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col w-100 justify-center items-center">
        <div className={`grid grid-cols-6 grid-flow-row`}>
          {tables?.map((table, index: number) => {
            return (
              <button
                className={`px-4 py-1 text-sm text-black-600 ${table[0].length <= 3 ? "bg-[red]" : ""} font-semibold rounded-full border  hover:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
                key={index}
                title={table.length <= 3 ? "No data" : table[1]}
                onClick={() => {
                  renderTable(false);
                  setTableIndex(String(index));
                }}
              >
                {`table-${index + 1}`}
               
              </button>
            );
          })}
        </div>
        <br />
        <button
          className="px-4 py-1 text-sm text-blue-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-blue-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          onClick={() => {
            renderTable(true);
          }}
        >
          Refresh
        </button>

        <h1>Last clicked table: {`table-${tableIndex === "" ? "" : Number(tableIndex) + 1}`}</h1>
        {console.log(tables[Number(tableIndex)])}
      </div>
      <br />
      {isRender && (
        <TableData
          data={tables[Number(tableIndex)]}
          countries={folders}
          id={String(tableIndex)}
        />
      )}
    </div>
  );
};

export default TableNav;
