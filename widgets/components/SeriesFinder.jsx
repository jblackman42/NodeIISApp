import React, { useState, useEffect } from 'react';
import Loader from "./Loader.jsx";

const SeriesFinder = ({ targeturl, watchurl, requestURL, setError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [seriesList, setSeriesList] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const seriesPerPage = 12;

  const getSeries = async () => {
    return fetch(`${requestURL}/api/widgets/series`)
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
  
  const watchLatest = (seriesID) => {
    fetch(`${requestURL}/api/widgets/sermon-series/${seriesID}`)
      .then(response => response.json())
      .then(series => {
        const { Sermon_ID } = series[0];
        window.location = `${watchurl}?series=${seriesID}&id=${Sermon_ID}`
      })
      .catch(() => {
        console.log('Could not retrieve latest sermon.')
      })
    // const currSeriesID = this.seriesList[0].Sermon_Series_ID;
    // Promise.resolve(fetch(`${fetchURL}/sermons?SeriesID=${currSeriesID}`))
    //     .then(response => response.json())
    //     .then(data => {
    //         const seriesSermons = data.sort((a,b) => new Date(b.Sermon_Date) - new Date(a.Sermon_Date))
    //         const recentSermonID = seriesSermons[0].Sermon_ID;
    //     })
  }
  
  useEffect(() => {
    if (!targeturl) setError("Missing target URL");
    if (!watchurl) setError("Missing watch URL");
    getSeries().then((series) => {
      // console.log(series);
      setSeriesList(series);

      setIsLoading(false);
    });
  }, [setIsLoading, setSeriesList]);


  return <>
    <div className="series-card-container">
      {seriesList
      .slice(seriesPerPage * pageIndex, seriesPerPage * (pageIndex + 1))
      .map((series, i) => {
        const { Sermon_Series_ID, UniqueFileId, Title } = series;
        return (
          <div className="series" key={Sermon_Series_ID}>
            {i === 0 && pageIndex === 0 && (
              <div className="series-banner">
                <p>Current Series</p>
                <a href={null} onClick={() => watchLatest(Sermon_Series_ID)}>Watch Latest Sermon</a>
              </div>
            )}
            <a className="series-image-container" tabIndex={-1} href={`${targeturl}?series=${Sermon_Series_ID}`}>
              <img src={`https://my.pureheart.org/ministryplatformapi/files/${UniqueFileId}`} alt={Title} />
            </a>
            <a className="view-more-link" href={`${targeturl}?series=${Sermon_Series_ID}`}>View More</a>
          </div>
        )
      })}
    </div>
    <div className="series-button-container">
      {pageIndex > 0 && <button onClick={() => setPageIndex(pageIndex > 0 ? pageIndex - 1 : 0)} style={{marginRight: 'auto'}}>Newer</button>}
      {pageIndex < Math.round(seriesList.length / seriesPerPage) && <button onClick={() => setPageIndex(pageIndex < Math.round(seriesList.length / seriesPerPage) ? pageIndex + 1 : Math.round(seriesList.length / seriesPerPage))} style={{marginLeft: 'auto'}}>Older</button>}
    </div>
  </>
    
}

export default SeriesFinder;