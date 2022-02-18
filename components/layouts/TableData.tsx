import React, { useState } from "react";
import TableRow from "#/components/common/TableRow";

interface Props {
  data: any[][];
}

interface IUndoObj {
  index: number;
  data: any[];
  type: "row" | "col" | "replace";
}



// [[1,2,4],[a,b,d],[q,w,r]]
// the inner arrays are the rows

const TableData: React.FC<Props> = ({ data }) => {
  const [stateData, setStateDate] = useState(data);
  const [undoData, setUndoData] = useState<Array<IUndoObj>>([]);

  const [inputData, setInput] = useState("");
  const [replaceData, setReplaceInput] = useState("");

  const handleRowDelete = (id: number) => {
    setStateDate((prev) => prev.filter((_, index) => index != id));
    setUndoData([...undoData, { index: id, data: stateData[id], type: "row" }]);
  };

  // [1,2,3,4]

  const handleColDelete = (id: number) => {
    const delCol: any[] = [];

    const newArr = stateData.map((row) => {
      delCol.push(row.splice(id, 1)[0]);
      return row;
    });

    setStateDate(newArr);
    setUndoData([...undoData, { index: id, data: delCol, type: "col" }]);

    // setStateDate((prev) =>
    //   prev.map((row) => {
    //     row.splice(id, 1);
    //     console.log(row);
    //     return row;
    //   })
    // );
  };

  /* 

   When user clicks on undo return the row or col

    step 1: Anytime a user deletes a col or row collect the data. Obtain the index of row or col and the data
      (How do can we tell from a column and a row?): In the row handler initialize the row type. With the column handler initialize the column type.
    step 2: When user clicks on undo return the most recent deleted row or col
      (What happens when most recent data was a row?):We can access through the table row and return the row.
      (What happens when the most recent data was a column?):We can access through the table column and return the column.

  */

  const handleUndo = () => {
    const undoEl = undoData.pop();

    if (!undoEl) return;

    if (undoEl.type === "col")
      stateData.forEach((row: any) => {
        let restoreItem = undoEl.data.shift();
        row.splice(undoEl.index, 0, restoreItem);
      });

    if (undoEl.type == "row") stateData.splice(undoEl.index, 0, undoEl.data);

    if(undoEl.type == "replace"){
      stateData.forEach((row) => {
        row.map((element, index) => {
          if(String(element).match(undoEl.data[1])){
            row[index] = String(row[index]).replace(undoEl.data[1],undoEl.data[0]);
          }
        })
      })
    }

    setStateDate([...stateData]);
    setUndoData([...undoData]);
  };

  /*
    Step 1: Obtain data from the left input and the right input
      (How are we going to obtain this data?): 
    Step 2: Find the words through each array and change that word into the replace word 
  */

  const replace = (searchWord: string, replaceWord: string) => {
    const undoReplaceItem = [searchWord,replaceWord];
    stateData.forEach((row) => {
      row.map((element, index) => {
        if (String(element).match(searchWord)) {
          row[index] = String(row[index]).replace(searchWord, replaceWord);
        }
      });
    });

    setStateDate([...stateData]);
    setUndoData([...undoData, {index:0, data:undoReplaceItem, type:"replace"}]);
  };

  return (
    <div>
      <div>
        <button onClick={handleUndo}>Undo</button>
        <input
          onChange={(e) => setInput(e.target.value)}
          type="text"
          className="border-2 border-black"
        />
        <input
          onChange={(e) => setReplaceInput(e.target.value)}
          type="text"
          className="border-2 border-black"
        />
        <button onClick={() => replace(inputData, replaceData)}>replace</button>
      </div>
      <table className="my-10">
        <tbody>
          {/*  */}
          {stateData[0] && (
            <tr>
              <td></td>
              {stateData[0].map((_, index) => (
                <td
                  onClick={() => {
                    handleColDelete(index);
                  }}
                  className="cursor-pointer"
                  key={index}
                >
                  - {index}
                </td>
              ))}
            </tr>
          )}

          {stateData.map((tr, index) => (
            <TableRow id={index} handleRowDelete={handleRowDelete} key={index}>
              {tr.map((td, index) => (
                <td className="px-2" key={index}>
                  {td}
                </td>
              ))}
            </TableRow>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableData;
