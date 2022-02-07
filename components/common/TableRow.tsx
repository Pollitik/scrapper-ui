import React from "react";

interface Props {}

const TableRow: React.FC<Props> = ({ children }) => {
  return <tr className="my-2">{children}</tr>;
};

export default TableRow;
