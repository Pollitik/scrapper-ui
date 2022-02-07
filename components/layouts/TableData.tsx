import React from "react";
import TableRow from "#/components/common/TableRow";

interface Props {
  data: any[][];
}

const TableData: React.FC<Props> = ({ data }) => {
  return (
    <table className="my-10">
      <tbody>
        {data.map((tr, index) => (
          <TableRow key={index}>
            {tr.map((td, index) => (
              <td className="px-2" key={index}>
                {td}
              </td>
            ))}
          </TableRow>
        ))}
      </tbody>
    </table>
  );
};

export default TableData;
