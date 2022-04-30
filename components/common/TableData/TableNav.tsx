import React, { useState, useRef, useEffect } from "react";
import TableData from ".";

interface Props {
  tables: any[][];
  folders: string[];
}

const TableNav: React.FC<Props> = ({ tables, folders }) => {
  const tableIndex = useRef<String>("");
  const [isRender, renderTable] = useState(false);


  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col w-100 justify-center items-center">
        <div className={`grid grid-cols-${Math.round(tables.length / 5)} grid-flow-row place-items-center`}>
          {tables?.map((table, index: number) => {
            return (
              <button
                className="px-4 py-1 text-sm text-blue-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-blue-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                key={index}
                title={table[1] == "" ? "Bad" : table[1]}
                onClick={() => {
                  renderTable(false);
                  tableIndex.current = String(index);
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

        <h1>Last rendered table: {`table-${tableIndex.current === "" ? "" : Number(tableIndex.current) + 1}`}</h1>
      </div>
      <br />
      {isRender && (
        <TableData
          data={tables[Number(tableIndex.current)]}
          countries={folders}
          id={String(tableIndex)}
        />
      )}
    </div>
  );
};

export default TableNav;
