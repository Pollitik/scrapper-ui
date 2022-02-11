import React from "react";

interface Props {
  handleRowDelete: (id: number) => void;
  id: number;
}

const TableRow: React.FC<Props> = ({ children, handleRowDelete, id }) => {
  return (
    <tr className="my-2">
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
