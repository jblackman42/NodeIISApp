import React, { useEffect, useState } from 'react'
import axios from 'axios';

const Table = ({columns, data, rowKeyField}) => {
  columns.pop()
  return(
    <div id='table-wrapper'>
      <table className='wpad-table'>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr id={row.rowKeyField}>
              {columns.map(header => (
                <td key={`${row.rowKeyField}-${header}`}>{String(row[header])}</td>
              ))}
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

  useEffect(() => {
    getPrayerInformation(UserGUID)
      .then(prayerinfo => {
        setDataArray(prayerinfo)
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