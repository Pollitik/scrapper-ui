import React, { Children } from "react";

interface Props{
    
}

const TableDropDown:React.FC<Props> = ({children}) => {
    // const options = data.map((element,index) => {
    //     return <option key={index} value={element}>{element}</option>;
    // });

    // const options = data.
    return(
        <div>
            <select>
                {children}
            </select>
        </div>
    );
}

export default TableDropDown;