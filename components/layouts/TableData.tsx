import React, { useState, useRef } from "react";
import TableRow from "#/components/common/TableRow";
import axios from "axios";

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
  const sheetRef = useRef<HTMLInputElement>(null);

  const currentStyle = useRef("white");
  const currentDraggedItem = useRef("");

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

    if (undoEl.type == "replace") {
      stateData.forEach((row) => {
        row.map((element, index) => {
          if (String(element).match(undoEl.data[1])) {
            row[index] = String(row[index]).replace(
              undoEl.data[1],
              undoEl.data[0]
            );
          }
        });
      });
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
    const undoReplaceItem = [searchWord, replaceWord];
    stateData.forEach((row) => {
      row.map((element, index) => {
        if (String(element).match(searchWord)) {
          row[index] = String(row[index]).replace(searchWord, replaceWord);
        }
      });
    });

    setStateDate([...stateData]);
    setUndoData([
      ...undoData,
      { index: 0, data: undoReplaceItem, type: "replace" },
    ]);
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
    const target = e.target;
    e.dataTransfer?.setData("id", String(index));
    currentDraggedItem.current = "row";

    // console.log("Drag Start on Row");
    // console.log("Dragged Item Index" + index);
    console.log(currentDraggedItem.current);
  };

  const onDragColStart = (index: number, e: React.DragEvent) => {
    const target = e.target;
    e.dataTransfer.setData("id", String(index));

    currentDraggedItem.current = "col";

    console.log(currentDraggedItem.current);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDragEnd = () => {
    //This is where we clear the animations
    console.log("Drag End");
  };

  const onDropped = (droppedIndex: number, e: React.DragEvent) => {
    //Where we switch the dragged item with the item that was dropped on
    //Add a functionnality to check if the dragged item type(col or row) matches with the dropped item type
    console.log("Dropped");

    var data: number = +e.dataTransfer.getData("id");
    var droppedIndexItem = stateData[droppedIndex];

    if (currentDraggedItem.current === "col") {
      var temp: any = "";
      stateData.forEach((row) => {
        temp = row[data];
        row[data] = row[droppedIndex];
        row[droppedIndex] = temp;
      });
      setStateDate([...stateData]);
    }

    if (currentDraggedItem.current === "row") {
      stateData[droppedIndex] = stateData[data];
      stateData[data] = droppedIndexItem;
      setStateDate([...stateData]);
    }
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
        <input type="text" className="border-2 border-black" ref={sheetRef} />
        <button
          onClick={async () => {
            const res = await axios.post("/api/spreadsheet", {
              data: stateData,
              sheetName: sheetRef.current?.value || "Trash",
            });
          }}
        >
          Add table
        </button>
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
                  className="cursor-pointer"
                  key={index}
                >
                  - {index}
                </td>
              ))}
            </tr>
          )}

          {stateData.map((tr, index) => (
            <TableRow
              id={index}
              handleRowDelete={handleRowDelete}
              onDragOver={onDragOver}
              onDragStart={onDragRowStart}
              onDrop={onDropped}
              onDragEnd={onDragEnd}
              key={index}
              setStyle={currentStyle.current}
            >
              {tr.map((td, index) => (
                <td
                  dangerouslySetInnerHTML={{ __html: td }}
                  className="px-2"
                  key={index}
                ></td>
              ))}
            </TableRow>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableData;
