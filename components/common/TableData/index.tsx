import React, { useState, useRef, useEffect, ReactEventHandler } from "react";
import TableRow from "#/components/common/TableRow";
import LoadingIcon from "../LoadingIcon";
import axios from "axios";


interface Props {
  data: any[][];
  id: String;
  countries: string[];
  
}

interface IUndoObj {
  index: number;
  data: any[];
  type: "row" | "col" | "replace" | "replace_num" | "drag-col" | "drag-row";
}


const TableData: React.FC<Props> = ({ data, id, countries }) => {
  const [stateData, setStateDate] = useState(data);
  const [undoData, setUndoData] = useState<Array<IUndoObj>>([]);

  const [inputData, setInput] = useState("");
  const [replaceData, setReplaceInput] = useState("");
  const [loading,setLoading] = useState<boolean>(false);

  const sheetRef = useRef<HTMLInputElement>(null);

  const currentDraggedItem = useRef("");
  const currentFilter = useRef("");
  const numsRef = useRef<Array<Number[]>>([]);
  const selectedFolder = useRef<string>("0B1t8CP92v4NSOUExcVFpNjBlZGs");

  const currentStyle = useRef("");

  
  const production = "https://pollitik-scrapper.herokuapp.com/";
  const development = "http://localhost:3000/";
  const main_url = (process.env.NODE_ENV ? production : development);

  const client = axios.create({
    baseURL : main_url,
    withCredentials: false,
  })



  const handleRowDelete = (id: number) => {
    setStateDate((prev) => prev.filter((_, index) => index != id));
    setUndoData([...undoData, { index: id, data: stateData[id], type: "row" }]);
  };

  const handleColDelete = (id: number) => {
    const delCol: any[] = [];

    const newArr = stateData.map((row) => {
      if (row[id] === undefined) {
        delCol.push("");
      } else {
        delCol.push(row.splice(id, 1)[0]);
      }
      return row;
    });

    setStateDate(newArr);
    setUndoData([...undoData, { index: id, data: delCol, type: "col" }]);
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
    const number = new RegExp("(>|=|<)");
    // const numberwithCommas = new RegExp(`(${undoEl?.data[1]})`)
    let number2 = "";
    let inds = undoEl?.data[1];

    if (!undoEl) return;

    if (undoEl.type === "col")
      stateData.forEach((row: any) => {
        let restoreItem = undoEl.data.shift();
        row.splice(undoEl.index, 0, restoreItem);
      });

    if (undoEl.type == "row") stateData.splice(undoEl.index, 0, undoEl.data);

    if (undoEl.type == "replace") {
      undoEl.data[1].forEach((element1: number[]) => {
        stateData[element1[0]][element1[1]] = String(
          stateData[element1[0]][element1[1]]
        ).replace(undoEl.data[2], undoEl.data[0]);
      });

      console.log(undoData);
    }

    if (undoEl.type == "replace_num") {
      undoEl.data[1].forEach((element1: number[]) => {
        if (undoEl.data[2] === "") {
          stateData[element1[0]][element1[1]] =
            String(stateData[element1[0]][element1[1]]).substring(
              0,
              element1[2]
            ) +
            undoEl.data[0] +
            String(stateData[element1[0]][element1[1]]).substring(element1[2]);
        } else {
          stateData[element1[0]][element1[1]] = String(
            stateData[element1[0]][element1[1]]
          ).replace(undoEl.data[2], undoEl.data[0]);
        }
      });
    }

    if (undoEl.type == "drag-row") {
      const droppedItem = stateData[undoEl.data[1]];
      stateData[undoEl.data[1]] = stateData[undoEl.data[0]];
      stateData[undoEl.data[0]] = droppedItem;
      console.log("Check");
    }

    if (undoEl.type == "drag-col") {
      var temp: any = "";
      stateData.forEach((row) => {
        temp = row[undoEl.data[1]];
        row[undoEl.data[1]] = row[undoEl.data[0]];
        row[undoEl.data[0]] = temp;
      });
    }

    setStateDate([...stateData]);
    setUndoData([...undoData]);

    console.log(undoData);
  };

  /*
    Step 1: Obtain data from the left input and the right input
      (How are we going to obtain this data?): 
    Step 2: Find the words through each array and change that word into the replace word 
  */



  const replace = (searchWord: string, replaceWord: string, filter: string) => {
    let undoReplaceItem: unknown[] = [];
    let indicies: any[][] = [];

    const searchWordPattern = new RegExp("[" + searchWord + "]");

    if (
      (searchWord.length === 0 || replaceWord.length === 0) &&
      filter.length === 0
    )
      return;

    if (searchWord === "space") searchWord = "";

    if (replaceWord === "space") replaceWord = "";

    if (filter.length === 0) {
      stateData.forEach((row, rowIndex) => {
        row.forEach((element, colIndex) => {
          if (String(element).match(searchWordPattern)) {
            row[colIndex] = row[colIndex].replace(searchWord, replaceWord);
            indicies.push([rowIndex, colIndex]);
          }
        });
      });

      console.log(indicies);
      undoReplaceItem = [searchWord, indicies, replaceWord, filter];
      setUndoData([
        ...undoData,
        { index: 0, data: undoReplaceItem, type: "replace" },
      ]);
    } else {
      stateData.forEach((row, rowIndex) => {
        row.forEach((element, colIndex) => {
          const searchWordIndex =
            stateData[rowIndex][colIndex].indexOf(searchWord);
          if (filter[0] === ">" || (filter[0] === ">" && filter[1] === "=")) {
            if (
              String(element).match(searchWord) &&
              numsRef.current[rowIndex][colIndex] >=
                Number(filter.substring(2)) &&
              filter[0] === ">" &&
              filter[1] === "="
            ) {
              stateData[rowIndex][colIndex] = stateData[rowIndex][
                colIndex
              ].replace(searchWord, replaceWord);

              indicies.push([rowIndex, colIndex, searchWordIndex]);
            } else if (
              String(element).match(searchWord) &&
              numsRef.current[rowIndex][colIndex] >
                Number(filter.substring(1)) &&
              filter[0] === ">"
            ) {
              stateData[rowIndex][colIndex] = String(
                stateData[rowIndex][colIndex]
              ).replace(searchWord, replaceWord);
              indicies.push([rowIndex, colIndex, searchWordIndex]);
            }
          } else if (filter[0] === "<" || filter[0] === "<=") {
            if (
              String(element).match(searchWord) &&
              numsRef.current[rowIndex][colIndex] <=
                Number(filter.substring(2)) &&
              filter[0] === "<" &&
              filter[1] === "="
            ) {
              stateData[rowIndex][colIndex] = String(
                stateData[rowIndex][colIndex]
              ).replace(searchWord, replaceWord);
              indicies.push([rowIndex, colIndex, searchWordIndex]);
            } else if (
              String(element).match(searchWord) &&
              numsRef.current[rowIndex][colIndex] <
                Number(filter.substring(1)) &&
              filter[0] === "<"
            ) {
              stateData[rowIndex][colIndex] = String(
                stateData[rowIndex][colIndex]
              ).replace(searchWord, replaceWord);
              indicies.push([rowIndex, colIndex, searchWordIndex]);
            }
          } else if (filter[0] === "=") {
            if (
              String(element).match(searchWord) &&
              numsRef.current[rowIndex][colIndex] ===
                Number(filter.substring(1))
            ) {
              stateData[rowIndex][colIndex] = String(
                stateData[rowIndex][colIndex]
              ).replace(searchWord, replaceWord);
              indicies.push([rowIndex, colIndex, searchWordIndex]);
            }
          }
        });
      });

      undoReplaceItem = [searchWord, indicies, replaceWord, filter];
      setUndoData([
        ...undoData,
        { index: 0, data: undoReplaceItem, type: "replace_num" },
      ]);
      console.log(undoData);
    }
    indicies = [];

    setStateDate([...stateData]);
  };

  /*
  Goal:Drag and Drop row onto another row. Then switch
    step 1: Click and hold on the row
      What happens when you click and drag the row?(The row index is collected)


      What are the animations when there is a click and hold on the row?(row is turned green)
        What happens when you click and hold on another row , when another row was already clicked?(check for change in id)
          How do you check for change in ID?(Comapre two variables. One variable containing the last cliked row and the other variable containing the current clicked row)
      
      
    step 2: Drag the row to another row or (col)
      What happens when you drag the element on another onto to the other same element?(pull the index of the dropped on element. Then switch the row)

*/

  const onDragRowStart = (index: number, e: React.DragEvent) => {
    //Where I obtain the dragged item
    e.dataTransfer?.setData("id", String(index));
    currentDraggedItem.current = "row";

    var object = document.getElementById(`#${id}`);

    object?.style.backgroundColor.replace("", "green");
  };

  const onDragColStart = (index: number, e: React.DragEvent) => {
    e.dataTransfer.setData("id", String(index));
    currentDraggedItem.current = "column";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDragEnd = () => {
   
  };

  const onDropped = (
    dropTargetIndex: number,
    e: React.DragEvent | React.SyntheticEvent
  ) => {
    //Where we switch the dragged item with the item that was dropped on
    //Add a functionnality to check if the dragged item type(col or row) matches with the dropped item type


    var dropItemIndex: number = +(e as React.DragEvent).dataTransfer.getData(
      "id"
    );
    var dropTarget = (e as React.SyntheticEvent).currentTarget;

    var dropTargetItem = stateData[dropTargetIndex];


    if (dropTarget.classList[0] == currentDraggedItem.current) {
      if (
        currentDraggedItem.current === "column" &&
        dropTarget.classList[0] === "column"
      ) {
        let temp: any = "";
        stateData.forEach((row) => {
          temp = row[dropItemIndex] != [] ? row[dropItemIndex] : "";
          row[dropItemIndex] =
            row[dropTargetIndex] != [] ? row[dropTargetIndex] : "";
          row[dropTargetIndex] = temp;
        });
        setUndoData([
          ...undoData,
          {
            index: 0,
            data: [dropTargetIndex, dropItemIndex],
            type: "drag-col",
          },
        ]);
      }

      if (
        currentDraggedItem.current === "row" &&
        dropTarget.classList[0] === "row"
      ) {
        stateData[dropTargetIndex] = stateData[dropItemIndex];
        stateData[dropItemIndex] = dropTargetItem;
        setUndoData([
          ...undoData,
          {
            index: 0,
            data: [dropTargetIndex, dropItemIndex],
            type: "drag-row",
          },
        ]);
      }
    } else return;

    setStateDate([...stateData]);

    console.log(stateData)
  };

  /*
    Objective: Add newly created google sheet into a specific folder
      Step 1: Collect the id of the chosen folder and collect the meta file data of the created google sheets file
        (How do we do that?): We can pull this data from the post we made to the server. With both google drive api and google sheets api
  */

  useEffect(() => {
    let traceNumbers: number[][] = [];
    let nums: number[] = [];
    let number = "";

    console.log("Inputting Numbers");
    stateData.forEach((row) => {
      row.map((element, index) => {
        if (index == row.length - 1) {
          return;
        }

        if (element !== null) {
          number = row[index].replace(/[^0-9.A-Za-z//]/g, "");
          nums.push(Number(number));
        }
      });
      traceNumbers.push(nums);
      nums = [];
    });

    numsRef.current = traceNumbers;

    return () => {};
  }, [stateData]);

  return (
    <div className={"" + id + " " + "flex flex-col justify-center items-center"}>
      <div className="flex flex-row">
        <button onClick={handleUndo}>Undo</button>
        <input
          onChange={(e) => setInput(e.target.value)}
          type="text"
          className="border-2 border-black"
          placeholder="Search Word"
        />
        <input
          onChange={(e) => setReplaceInput(e.target.value)}
          type="text"
          className="border-2 border-black"
          placeholder="Replace Word"
        />
        <input
          type="text"
          className="border-2 border-black"
          onChange={(e) => (currentFilter.current = e.target.value)}
          placeholder="Filter"
        />
        <button
          onClick={() => replace(inputData, replaceData, currentFilter.current)}
        >
          replace
        </button>

        <button
          onClick={async () => {

            await setLoading(true);
            await axios.post("http://localhost:3000/api/spreadsheet", {
              folderId: selectedFolder.current,
              sheetName: sheetRef.current?.value || "trash",
              data: stateData,
            });
        

            await setLoading(false);

          }}
        >
          Add table
        </button>
        <input type="text" placeholder="File Name" className="border-2 border-black" ref={sheetRef} />

        <select
          id="selectBox"
          onChange={(e: any) => {
            const selectFolder = document.getElementById(`${e.target.value}`);
            selectedFolder.current = String(
              selectFolder?.getAttribute("data-id")
            );
            console.log(selectedFolder.current);
          }}
        >
          {countries.map((element: any, index: any) => (
            <option
              id={element.name}
              className="cursor-pointer"
              data-id={element.id}
              key={element.id}
            >
              {element.name}
            </option>
          ))}
        </select>
        {loading && <LoadingIcon/>}
      </div>
      <table className="my-10">
        <tbody>
          {/*  */}
          {stateData[0] && (
            <tr>
              <td></td>
              {stateData[0].map((_, index) => (
                <td
                  draggable
                  onDragStart={(e: React.DragEvent) => onDragColStart(index, e)}
                  onDrop={(e: React.DragEvent) => onDropped(index, e)}
                  onDragOver={(e: React.DragEvent) => onDragOver(e)}
                  onClick={() => {
                    handleColDelete(index);
                  }}
                  className="column cursor-pointer"
                  key={index}
                >
                  - {index}
                </td>
              ))}
            </tr>
          )}

          {stateData.map((tr, row_index) => (
            <TableRow
              id={row_index}
              handleRowDelete={handleRowDelete}
              onDragOver={onDragOver}
              onDragStart={onDragRowStart}
              onDrop={onDropped}
              onDragEnd={onDragEnd}
              key={row_index}
              setStyle={currentStyle.current}
            >
              {tr.map((element, col_index) => {
                if (col_index === tr.length - 1 && typeof element === "object") {
                  return <td key={col_index}>Link</td>;
                } else if (tr) {
                  return (
                    <td className="px-2" key={col_index}>
                      {element}
                    </td>
                  );
                }
              })}
            </TableRow>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default TableData;


