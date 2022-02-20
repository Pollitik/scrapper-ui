import React, { useState, useRef } from "react";

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
  onDragOver
}) => {
  return (
    <tr
      draggable="true"
      onDragOver={onDragOver}
      onDrop={(event: React.DragEvent) => onDrop(id, event)}
      onDragStart={(event: React.DragEvent) => onDragStart(id, event)}
      onDragEnd={() => onDragEnd()}
      className="my-2 cursor-pointer"
   
    >
      <i
        className="cursor-pointer"
        onClick={() => {
          handleRowDelete(id);
        }}
      >
        -
      </i>
      {children}
    </tr>
  );
};

export default TableRow;
