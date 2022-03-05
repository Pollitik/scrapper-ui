import React, { useState, useRef, useEffect } from "react";
import TableRow from "#/components/common/TableRow";
import axios from "axios";

interface Props {
  data: any[][];
  id: String;
}

interface IUndoObj {
  index: number;
  data: any[];
  type: "row" | "col" | "replace" | "replace_num" | "drag-col" | "drag-row";
}

// [[1,2,4],[a,b,d],[q,w,r]]
// the inner arrays are the rows

const TableData: React.FC<Props> = ({ data, id }) => {
  const [stateData, setStateDate] = useState(data);
  const [undoData, setUndoData] = useState<Array<IUndoObj>>([]);

  const [inputData, setInput] = useState("");
  const [replaceData, setReplaceInput] = useState("");
  const sheetRef = useRef<HTMLInputElement>(null);

  const [numReplace, setNumReplace] = useState<Array<Number[]>>([]);

  const currentDraggedItem = useRef("");
  const currentFilter = useRef("");
  const numsRef = useRef<Array<Number[]>>([]);

  const currentStyle = useRef("");


 

  const handleRowDelete = (id: number) => {
    setStateDate((prev) => prev.filter((_, index) => index != id));
    setUndoData([...undoData, { index: id, data: stateData[id], type: "row" }]);
  };


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
      let filter = undoEl?.data[2]; 

      for (let a = 0; a <= filter.length; a++) {
        if (number.test(filter)) {
          filter = filter.slice(1);
        }
      }

        stateData.forEach((row) => {
          row.map((element, index) => {
            row[index] = String(row[index]).replace(
              undoEl.data[1],
              undoEl.data[0]
            );
          });
        });
      
    }

    if(undoEl.type == "replace_num"){
      undoEl.data[1].forEach((element1:number[]) => {
        stateData[element1[0]][element1[1]] = String(stateData[element1[0]][element1[1]]).replace(
          undoEl.data[2],
          undoEl.data[0]
        )
      })

      console.log(undoEl.data[1]);
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

  // const comparatorOperator = (operator:string) => {
  //   if(operator.)
  // }



  const replace = (searchWord: string, replaceWord: string, filter: string) => {
    let undoReplaceItem:unknown[] = [];
    let indicies:any[][] = [];
    let number = "";
  

        if(filter.length === 0){
          stateData.forEach((row) => {
            row.forEach((element,index) => {
              if(String(element).match(searchWord)){
                row[index] = row[index].replace(searchWord,replaceWord);
              }
            })
          })
          undoReplaceItem = [searchWord, replaceWord, filter];
          setUndoData([
            ...undoData,
            { index: 0, data: undoReplaceItem, type: "replace" },
          ]);
        }
        else{
          stateData.forEach((row ,rowIndex) => {
            row.forEach((element,colIndex) => {
              if (filter[0] === ">" || ( filter[0] === ">" && filter[1] === "=")){
                if (
                  String(element).match(searchWord) &&
                  (numsRef.current[rowIndex][colIndex] >= Number(filter.substring(2))) &&
                  filter[0] === ">" &&
                  filter[1] === "="
                ) {
                  stateData[rowIndex][colIndex] = stateData[rowIndex][colIndex].replace(searchWord, replaceWord);
                  console.log(rowIndex,colIndex);
                  indicies.push([rowIndex,colIndex]);
                
                } else if (
                  String(element).match(searchWord) &&
                  (numsRef.current[rowIndex][colIndex] > Number(filter.substring(2))) &&
                  filter[0] === ">"
                ) {
                  stateData[rowIndex][colIndex] = String(stateData[rowIndex][colIndex]).replace(searchWord, replaceWord);
                  indicies.push([rowIndex,colIndex]);
                }
              } else if (filter[0] === "<" || filter[0] === "<=") {
                if (
                  String(element).match(searchWord) &&
                  (numsRef.current[rowIndex][colIndex] <= Number(filter.substring(2))) &&
                  filter[0] === "<" &&
                  filter[1] === "="
                ) {
                  stateData[rowIndex][colIndex] = String(stateData[rowIndex][colIndex]).replace(searchWord, replaceWord);
                  indicies.push([rowIndex,colIndex]);
                } else if (
                  String(element).match(searchWord) &&
                  (numsRef.current[rowIndex][colIndex] < Number(filter.substring(2))) &&
                  filter[0] === "<"
                ) {
                  stateData[rowIndex][colIndex] = String(  stateData[rowIndex][colIndex]).replace(searchWord, replaceWord);
                  indicies.push([rowIndex,colIndex]);
                }
              } else if (filter[0] === "=") {
                if (String(element).match(searchWord) &&
                (numsRef.current[rowIndex][colIndex] === Number(filter.substring(1)))) {
                  stateData[rowIndex][colIndex] = String( stateData[rowIndex][colIndex]).replace(searchWord, replaceWord);
                  indicies.push([rowIndex,colIndex]);
                } 
                
              
              }
            })
          })

          undoReplaceItem = [searchWord,indicies,replaceWord,filter];
          setUndoData([
            ...undoData,
            { index: 0, data: undoReplaceItem, type: "replace_num" },
          ]);
        }
        indicies = []

    setStateDate([...stateData]);
 

    console.log(undoData);
    console.log(indicies);

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

    if (
      currentDraggedItem.current === "col" ||
      currentDraggedItem.current === "row"
    ) {
      if (currentDraggedItem.current === "col") {
        var temp: any = "";
        stateData.forEach((row) => {
          temp = row[data];
          row[data] = row[droppedIndex];
          row[droppedIndex] = temp;
        });
        setUndoData([
          ...undoData,
          { index: 0, data: [droppedIndex, data], type: "drag-col" },
        ]);
      }

      if (currentDraggedItem.current === "row") {
        stateData[droppedIndex] = stateData[data];
        stateData[data] = droppedIndexItem;
        setUndoData([
          ...undoData,
          { index: 0, data: [droppedIndex, data], type: "drag-row" },
        ]);
      }
      setStateDate([...stateData]);
    }

   
  };

  useEffect(() => {
    let traceNumbers:number[][] = [];
    let nums:number[] = [];
    let number = "";

    // const regex = new RegExp(`(\W+)/g`);

    console.log("Inputting Numbers");
    stateData.forEach((row) => {
      row.map((_,index) => {
        number = row[index].replace(/[^0-9.A-Za-z//]/g,"");
        nums.push(Number(number))
      })
      traceNumbers.push(nums);
      nums = []
    });

    
    numsRef.current = traceNumbers;

  
    return () => {
      // console.log("Clean Up");
     
    };
  },[stateData])


  return (
    <div className={"" + id}>
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

        <input
          type="text"
          className="border-2 border-black"
          onChange={(e) => (currentFilter.current = e.target.value)}
        />
        <button
          onClick={() => replace(inputData, replaceData, currentFilter.current)}
        >
          replace

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
                  className="cursor-pointer column"
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
