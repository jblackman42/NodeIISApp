import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { FaTrash } from "react-icons/fa6";
import { FaRegPenToSquare } from "react-icons/fa6";



const Table = ({columns, data, rowKeyField}) => {
  // Create a new array excluding the last column, without mutating the original columns array
  const updatedColumns = columns.slice(0, -1);
  // console.log(updatedColumns)

  return(
    <div id='table-wrapper'>
      <table className='wpad-table'>
        <thead>
          <tr>
            {updatedColumns.map(column => (
              <th key={column}>{column}</th>
            ))}
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row[rowKeyField]}>
              {updatedColumns.map(header => (
                <td key={`${row[rowKeyField]}-${header}`}>{row[header]}</td>
              ))}
              <td className='icon'><FaRegPenToSquare /></td>
              <td className='icon'><FaTrash /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


const PrayerLog = ({ requestURL }) => {
  const UserGUID = '153606b5-aaf6-4ad2-84ad-643909e664fb';
  const [array, setDataArray] = useState([]);
  const [headers, setHeaders] = useState([]);

  const getPrayerInformation = async (UserGUID) => {
    if (!UserGUID) return;
    return axios({
      method:"GET",
      url:`${requestURL}/api/wpad/mySchedules/${UserGUID}`
    }).then(response => {
      if (response.data) {
        const data = response.data
        return data
      }
      throw new Error('No data');
    }).catch(error => {
      console.error("error", error);
      throw error;
    });
  };
  const formatDateString = (isoString) => {
    const date = new Date(isoString);
    const dateString = date.toLocaleDateString('en-us', {year: 'numeric', month: 'short', day: 'numeric'});
    const timeString = date.toLocaleTimeString('en-us', {hour: 'numeric', minute: 'numeric'});
    return `${dateString} - ${timeString}`
  }

  useEffect(() => {
    getPrayerInformation(UserGUID)
      .then(prayerinfo => {
        const updatedData = prayerinfo.map(item => {
          const formattedDate = formatDateString(item.Start_Date);
          return { ...item, Start_Date: formattedDate };
        });
        console.log(updatedData)
        setDataArray(updatedData)
        setHeaders(prayerinfo.length > 0 ? Object.keys(prayerinfo[0]) : [])
      })
      .catch(err => {
        console.error(err);
      })
  }, [])
  return (
    <Table
      columns={headers}
      data={array}
      rowKeyField={'Prayer_Schedule_ID'}
      />
  );
};

export default PrayerLog