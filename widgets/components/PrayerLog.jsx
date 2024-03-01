import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { FaTrash } from "react-icons/fa6";
import { FaRegPenToSquare } from "react-icons/fa6";
import { confirmAlert } from 'react-confirm-alert'; // https://www.npmjs.com/package/react-confirm-alert?activeTab=readme


const deletePrayerTime = ({prayerTime, prayerID, prayerGUID, requestURL, onDelete}) => {
  const runDelete = async () => {
    if(!prayerID) return
    onDelete(prayerID)
    return axios({
      method:"DELETE",
      url:`${requestURL}/api/wpad/mySchedules`,
      data: {
        guid: prayerGUID,
        id: prayerID
      }
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
  }

  confirmAlert({
    title: `Are you sure you want to cancel prayer on: ${prayerID }?`,
    message: 'Are you sure to do this.',
    buttons: [
      {
        label: 'Yes',
        onClick: () => (runDelete())
      },
      {
        label: 'No',
      }
    ]
  });
}

const Table = ({columns, data, rowKeyField, UserGUID, requestURL, handleDelete}) => {
  // Create a new array excluding the last column, without mutating the original columns array

  return(
    <div id='table-wrapper'>
      <table className='wpad-table'>
        <thead>
          <tr>
            {columns.map(column => {
              let tableHeader = null
              if (column === 'Prayer_Schedule_ID' | column === '_Prayer_Schedule_GUID'){
                tableHeader = null
              }
              else {
                tableHeader = (<th key={column}>{column}</th>)
              }return (tableHeader)})}
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row[rowKeyField]}>
              {columns.map(header => 
                {let tableData = (<td key={`${row[rowKeyField]}-${header}`}>{row[header]}</td>)
                if (header === 'Prayer_Schedule_ID' | header === '_Prayer_Schedule_GUID'){
                  tableData = null
                }return (tableData)})}
              <td className='icon' ><FaRegPenToSquare /></td>
              <td className='icon' onClick={() => deletePrayerTime({prayerTime: row.Start_Date, prayerID: row.Prayer_Schedule_ID, UserGUID: UserGUID, requestURL: requestURL, prayerGUID: row._Prayer_Schedule_GUID, onDelete: handleDelete})}><FaTrash /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


const PrayerLog = ({ requestURL }) => {
  const UserGUID = '153606b5-aaf6-4ad2-84ad-643909e664fb';
  const [userPrayerData, setUserPrayerData] = useState(JSON.parse(localStorage.getItem(UserGUID)) || []);
  const [prayerHeaders, setPrayerHeaders] = useState(JSON.parse(localStorage.getItem('prayerHeaders')) || []);

  useEffect(() => {
    const getPrayerInformation = async () => {
      if (!UserGUID) return;
      try {
        const response = await axios.get(`${requestURL}/api/wpad/mySchedules/${UserGUID}`);
        if (response.data) {
          const updatedData = response.data.map(item => {
            const formattedDate = formatDateString(item.Start_Date);
            return { ...item, Start_Date: formattedDate };
          });
          localStorage.setItem(UserGUID, JSON.stringify(updatedData));
          localStorage.setItem('prayerHeaders', JSON.stringify(response.data.length > 0 ? Object.keys(response.data[0]) : []));
          setUserPrayerData(updatedData);
          setPrayerHeaders(response.data.length > 0 ? Object.keys(response.data[0]) : []);
        }
      } catch (error) {
        console.error("error", error);
      }
    };

    getPrayerInformation();
  }, [UserGUID, requestURL]);

  const handleDelete = (prayerID) => {
    // Implement deletion logic here
    const updatedData = userPrayerData.filter(item => item.Prayer_Schedule_ID !== prayerID);
    setUserPrayerData(updatedData);
    localStorage.setItem(UserGUID, JSON.stringify(updatedData));
  };

  const formatDateString = (isoString) => {
    const date = new Date(isoString);
    const dateString = date.toLocaleDateString('en-us', {year: 'numeric', month: 'short', day: 'numeric'});
    const timeString = date.toLocaleTimeString('en-us', {hour: 'numeric', minute: 'numeric'});
    return `${dateString} - ${timeString}`
  }

  return (
    <Table
      columns={prayerHeaders}
      data={userPrayerData}
      rowKeyField={'Prayer_Schedule_ID'}
      UserGUID={UserGUID}
      requestURL={requestURL}
      handleDelete={handleDelete} // Pass the handleDelete function as a prop
    />
  );
};

export default PrayerLog;