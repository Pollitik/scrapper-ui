import React, { useState } from "react";
import TableRow from "#/components/common/TableRow";

interface Props {
  data: any[][];
}

interface IUndoObj {
  index: number;
  row: any;
}

const TableData: React.FC<Props> = ({ data }) => {
  const [stateData, setStateDate] = useState(data);
  const [undoData, setUndoData] = useState<Array<IUndoObj>>([]);

  const handleRowDelete = (id: number) => {
    setStateDate((prev) => prev.filter((_, index) => index != id));
    setUndoData([...undoData, { index: id, row: stateData[id] }]);
  };

  /*
    step1 : Collect the previous index 
      (when do u collect it?): When the user deletes a row
      (how do you store the element and index?): The element and index is stored in a object. This object will also be stored in an array
    step2 : when undoed, pop the object thats infront of the array, since the object is the most recent update.
  */

  // const handleRowUndo = (id: number) => {
  //   setUndoData([{index: id , row: data[id]}]);
  // };

  const handleRowUndo = () => {
    const undoRow = undoData.pop();

    if (!undoRow) return;

    stateData.splice(undoRow.index, 0, undoRow.row);

    setStateDate([...stateData]);
    setUndoData([...undoData]);
  };

  return (
    <div>
      <div>
        <button onClick={handleRowUndo}>Undo</button>
      </div>
      <table className="my-10">
        <tbody>
          {stateData[0] && (
            <tr>
              {stateData[0].map((_, index) => (
                <td key={index}>-</td>
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
