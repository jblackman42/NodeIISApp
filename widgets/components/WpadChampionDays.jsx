import React, { useEffect, useState } from 'react';
import Loader from "./Loader.jsx";

const WpadChampionDays = ({ requestURL, setError, communityid, maxlength=3 }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [championedDays, setChampionedDays] = useState([]);

  const getOrdinalIndicator = (dateString) => {
    const n = new Date(dateString).getDate();
    let ord = 'th';
  
    if (n % 10 === 1 && n % 100 !== 11)
    {
      ord = 'st';
    }
    else if (n % 10 === 2 && n % 100 !== 12)
    {
      ord = 'nd';
    }
    else if (n % 10 === 3 && n % 100 !== 13)
    {
      ord = 'rd';
    }
  
    return ord;
  }

  const getChampionedDays = async (id) => {
    return fetch(`${requestURL}/api/wpad/championedDays/${id}`)
      .then((response) => {
        if (!response.ok) {
          setError(response.json())
          return null;
        }
        return response.json()
      })
      .catch(() => {
        setError("Something terrible happened, please try again or reach out to support.");
      });
  };

  useEffect(() => {
    if (!communityid) setError("Missing community ID");
    getChampionedDays(communityid).then((days) => {
      setChampionedDays(days.slice(0,maxlength));

      setIsLoading(false);
    });
  }, [setIsLoading, setChampionedDays]);

  if (isLoading) return <Loader />;

  return (
    <div className="championed-days-row">
      {championedDays.map(day => {
        const { WPAD_Community_Reservation_ID, Reservation_Date } = day;
        const currDate = new Date(Reservation_Date);
        const dateString = currDate.toLocaleDateString('en-us', {month:'short', day:'numeric'}) + getOrdinalIndicator(currDate);
        const link = `https://weprayallday.com/signup?date=${currDate.toDateString()}`
        return (
          <div className="championed-day" key={WPAD_Community_Reservation_ID}>
            <a href={link}>{dateString}</a>
            <img src={`${requestURL}/api/widgets/generate-qrcode?url=${link}`} alt={link} />
          </div>
        )
      })}
    </div>
  )
};

export default WpadChampionDays;