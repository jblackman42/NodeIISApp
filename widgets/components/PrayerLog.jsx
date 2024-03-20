import React, { useEffect, useState } from 'react'
import axios from 'axios';
import DatePicker from 'react-datepicker';

import { FaTrash, FaMinus, FaFloppyDisk } from "react-icons/fa6";
import { FaRegPenToSquare } from "react-icons/fa6";
import { confirmAlert } from 'react-confirm-alert'; // https://www.npmjs.com/package/react-confirm-alert?activeTab=readme

const formatDateString = (isoString) => {
  const date = new Date(isoString);
  const dateString = date.toLocaleDateString('en-us', {year: 'numeric', month: 'short', day: 'numeric'});
  const timeString = date.toLocaleTimeString('en-us', {hour: 'numeric', minute: 'numeric'});
  return `${dateString} - ${timeString}`
}

const updatePrayers = (updateData, requestURL) => {
  const runUpdate = async () => {
    return axios({
      method:"PUT",
      url:`${requestURL}/api/wpad/mySchedules/update`,
      data: {
        updateData: updateData,
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
  runUpdate()
}

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
    title: `Are you sure you want to cancel prayer on: ${formatDateString(prayerTime)}?`,
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


const FuturePrayers = ({ columns, data, rowKeyField, requestURL, handleDelete, handleUpdate }) => {
  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [currStartDate, setCurrStartDate] = useState();
  const [deleteOrCancel, setDeleteOrCancel] = useState('Delete');
  const [saveOrEdit, setSaveOrEdit] = useState('Edit')
  const displayHeaders = JSON.parse(localStorage.getItem('DisplayPrayerHeaders') ?? '[]');

  // console.log(editFormData)
  // console.log(editingRowId)
  const handleEditClick = (row) => {
    setEditingRowId(row[rowKeyField]);
    const formValues = {
      Start_Date: row.Start_Date,
      First_Name: row.First_Name,
      Last_Name: row.Last_Name,
      Phone: row.Phone,
      // Include other fields as needed
    };
    setEditFormData(formValues);
    setCurrStartDate(new Date(row.Start_Date)); // Ensure DatePicker has the correct initial date
  };
  

  const handleEditFormChange = (value, column) => {
    let updatedValue = value;
  
    // If the value is an event, extract the value from the event target
    if (value && value.target) {
      updatedValue = value.target.value;
    }
  
    const newFormData = { ...editFormData, [column]: updatedValue };
    setEditFormData(newFormData);
  
    if (column === 'Start_Date') {
      // Assuming updatedValue is a date string if directly passed from DatePicker
      setCurrStartDate(new Date(updatedValue)); // Update if Start_Date changes
    }
  };
  
  

  const handleSaveClick = () => {
    let Prayer_Schedule_ID = 'Prayer_Schedule_ID'
    editFormData[Prayer_Schedule_ID] = editingRowId
    handleUpdate(editFormData);
    setCurrStartDate(null);
    setEditingRowId(null);
    // Reset or clear editFormData if necessary
  };
  

  return (
    <div id='table-wrapper'>
      <table className='wpad-table'>
        <thead>
          <tr>
            {displayHeaders.map(column => {
              if (column === 'Prayer Schedule ID' || column === ' Prayer Schedule GUID') {
                return null;
              }
              return (<th key={column}>{column}</th>);
            })}
            <th>{saveOrEdit}</th>
            <th>{deleteOrCancel}</th>
          </tr>
        </thead>
        <tbody>
          {data.filter(row => new Date(row.Start_Date) > new Date()) // Filter for past dates
            .map(row => (
            <tr key={row[rowKeyField]}>
              {columns.map(column => {
                const isEditable = editingRowId === row[rowKeyField] && column !== 'Prayer_Schedule_ID' && column !== '_Prayer_Schedule_GUID';
                if (column === 'Start_Date' && isEditable) {
                  return (
                    <td key={`${row[rowKeyField]}-${column}`}>
                      <DatePicker
                        selected={currStartDate || new Date(row[column])}
                        onChange={(date) => {
                          setCurrStartDate(date); // Update the state with the new date
                          handleEditFormChange(date.toISOString(), column); // Update your form data
                        }}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={60}
                        timeCaption="time"
                      />
                    </td>
                  );
                } else if (isEditable && column === 'Phone') {
                  return (
                    <td key={`${row[rowKeyField]}-${column}`}>
                      <input
                        type="tel"
                        name={column}
                        value={editFormData[column]}
                        onChange={(event) => handleEditFormChange(event, column)}
                      />
                    </td>
                  ); 
                } else if (isEditable) {
                  return (
                    <td key={`${row[rowKeyField]}-${column}`}>
                      <input
                        type="text"
                        name={column}
                        value={editFormData[column]}
                        onChange={(event) => handleEditFormChange(event, column)}
                      />
                    </td>
                  );
                } else if (column==='Start_Date'){
                return(
                  <td key={`${row[rowKeyField]}-${column}`}>{formatDateString(row[column])}</td>
                )} else {
                  return column !== 'Prayer_Schedule_ID' && column !== '_Prayer_Schedule_GUID' ? (
                    <td key={`${row[rowKeyField]}-${column}`}>{row[column]}</td>
                  ) : null;
                }
              })}
              <td className='icon'>
                {editingRowId === row[rowKeyField] ? (
                  <FaFloppyDisk  onClick={() => {handleSaveClick(); setDeleteOrCancel('Delete'); setSaveOrEdit('Edit')}} />
                ) : (
                  <FaRegPenToSquare onClick={() => {handleEditClick(row); setDeleteOrCancel('Cancel'); setSaveOrEdit('Save')}} />
                )}
              </td>
              <td className='icon'>
                {editingRowId === row[rowKeyField] ? (
                  <FaMinus onClick={() => {setEditingRowId(null); setDeleteOrCancel('Delete'); setSaveOrEdit('Edit')}} />
                ) : (
                  <FaTrash onClick={() => deletePrayerTime({prayerTime: row.Start_Date, prayerID: row.Prayer_Schedule_ID, requestURL: requestURL, prayerGUID: row._Prayer_Schedule_GUID, onDelete: handleDelete})}/>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
const PastPrayers = ({ columns, data, rowKeyField }) => {
  const displayHeaders = JSON.parse(localStorage.getItem('DisplayPrayerHeaders') ?? '[]')
  return (
    <div id='table-wrapper'>
      <table className='wpad-table'>
        <thead>
          <tr>
            {displayHeaders.map(column => {
              if (column === 'Prayer Schedule ID' || column === ' Prayer Schedule GUID') {
                return null;
              }
              return (<th key={column}>{column}</th>);
            })}
          </tr>
        </thead>
        <tbody>
          {data
            .filter(row => new Date(row.Start_Date) < new Date()) // Filter for past dates
            .map(row => (
              <tr key={row[rowKeyField]}>
                {columns.map(column => {
                  if (column !== 'Prayer_Schedule_ID' && column !== '_Prayer_Schedule_GUID') {
                    if (column === 'Start_Date') {
                      return (<td key={`${row[rowKeyField]}-${column}`}>{formatDateString(row[column])}</td>);
                    } else {
                      return (<td key={`${row[rowKeyField]}-${column}`}>{row[column]}</td>);
                    }
                  }
                  return null;
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

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
          const updatedData = response.data;
          localStorage.setItem(UserGUID, JSON.stringify(updatedData));
          localStorage.setItem('DisplayPrayerHeaders', JSON.stringify(response.data.length > 0 ? Object.keys(response.data[0]).map(key => key.replace(/_/g, ' ')) : []));
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
  const handleUpdate = async (updatedFields) => {
    // Update the local state
    const updatedData = userPrayerData.map(item => {
      if (item.Prayer_Schedule_ID === updatedFields.Prayer_Schedule_ID) {
        // Merge updatedFields into the current item
        return { ...item, ...updatedFields };
      }
      return item;
    });
    setUserPrayerData(updatedData);
    localStorage.setItem(UserGUID, JSON.stringify(updatedData));

    updatePrayers(updatedFields, requestURL)
  }

  return (
    <div id='prayer-log-container'>
      <h1>Future Prayers</h1>
      <FuturePrayers
        columns={prayerHeaders}
        data={userPrayerData} // Filtered data for future prayers
        rowKeyField={'Prayer_Schedule_ID'}
        requestURL={requestURL}
        handleDelete={handleDelete}
        handleUpdate={handleUpdate}
      />
      <h1>Past Prayers</h1>
      <PastPrayers
        columns={prayerHeaders}
        data={userPrayerData} // Filtered data for past prayers
        rowKeyField={'Prayer_Schedule_ID'}
      />
    </div>
  );
  
};

export default PrayerLog;
