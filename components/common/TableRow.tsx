import React from "react";

interface Props {
  handleRowDelete: (id: number) => void;
  onDragStart: (id: number, e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (id: number, e: React.DragEvent) => void;
  setStyle: any;
  id: number;
}

const TableRow: React.FC<Props> = ({
  children,
  handleRowDelete,
  id,
  onDragStart,
  onDrop,
  onDragEnd,
  onDragOver,
}) => {
  return (
    <tr
      draggable="true"
      onDragOver={onDragOver}
      onDrop={(event: React.DragEvent) => onDrop(id, event)}
      onDragStart={(event: React.DragEvent) => onDragStart(id, event)}
      onDragEnd={() => onDragEnd()}
      className="row my-2 cursor-pointer"
      id={"" + id}
    >
      <td
        className="cursor-pointer"
        onClick={() => {
          handleRowDelete(id);
        }}
      >
        -
      </td>
      {children}
    </tr>
  );
};

export default TableRow;
