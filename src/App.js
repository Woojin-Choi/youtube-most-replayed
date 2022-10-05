import "./App.css";

import React, { useState } from "react";
const XMLHttpRequest = require("xhr2");

function App() {
  const [youtubeLink, setYoutubeLink] = useState("");
  const [heatMarkerPeakArr, setHeatMarkerPeakArr] = useState([]);

  const timeDiffSec = 30;
  const showVideoNum = 5;

  const onYoutubeLinkInputChange = (e) => {
    setYoutubeLink(e.target.value);
  };

  const onYoutubeLinkInputButtonClick = () => {
    const videoId = youtubeLink.split("v=")[1];

    let heatMarkerArr = [];
    let heatMarkerPeakArr = [];
    let scoreArr = [];

    const requestUrl = `https://yt.lemnoslife.com/videos?part=mostReplayed&id=${videoId}`;

    let xhr = new XMLHttpRequest();

    xhr.open("GET", requestUrl);

    xhr.onreadystatechange = () => {
      //   console.log("xhr.readyState", xhr.readyState);
      if (xhr.readyState === 4) {
        // console.log("xhr.status", xhr.status);
        // console.log(JSON.parse(xhr.responseText).items[0].mostReplayed.heatMarkers);
        for (let marker of JSON.parse(xhr.responseText).items[0].mostReplayed
          .heatMarkers) {
          heatMarkerArr.push(marker.heatMarkerRenderer);
          scoreArr.push(
            marker.heatMarkerRenderer.heatMarkerIntensityScoreNormalized
          );
        }

        console.log(heatMarkerArr);
        console.log(scoreArr);

        const scorePeakArrSorted = getPeakFromArr(scoreArr).sort(
          (a, b) => b.val - a.val
        );
        console.log(scorePeakArrSorted);

        for (let peak of scorePeakArrSorted) {
          heatMarkerPeakArr.push(heatMarkerArr[peak.idx]);
        }

        console.log(heatMarkerPeakArr);

        setHeatMarkerPeakArr(heatMarkerPeakArr);
      }
    };

    xhr.send();
  };

  const getPeakFromArr = (arr) => {
    var peakObj = [];
    if (arr.length > 2) {
      var pos = -1;
      for (let i in arr) {
        if (arr[i] > arr[i - 1]) {
          pos = i;
        } else if (arr[i] < arr[i - 1] && pos != -1) {
          peakObj.push({ idx: pos, val: arr[pos] });
          pos = -1;
        }
      }
    }
    return peakObj;
  };

  const getHourMinuteSecondObjectFromSecond = (timeInFloat) => {
    let ff = parseInt((timeInFloat * 1000) % 1000, 10);

    let intPart = parseInt(timeInFloat, 10);
    let ss = intPart % 60;

    let mm = ((intPart % (60 * 60)) - ss) / 60;
    let hh = (intPart - mm * 60 - ss) / (60 * 60);
    return { hour: hh, minute: mm, second: ss, microsecond: ff };
  };

  const pad = (n, width, z) => {
    z = z || "0";
    n = n + "";

    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  };

  const convertSecondToHHMMSS = (timeInFloat, numberOfTrailingZeros = 2) => {
    let hhmmssff = getHourMinuteSecondObjectFromSecond(timeInFloat);

    const hh = hhmmssff["hour"];
    const mm = hhmmssff["minute"];
    const ss = hhmmssff["second"];

    let timeDisplayStr = `${pad(hh, 2)}:${pad(mm, 2)}:${pad(ss, 2)}`;

    if (numberOfTrailingZeros > 0) {
      let ff = hhmmssff["microsecond"];
      ff = pad(ff, numberOfTrailingZeros);
      ff = ff.substring(0, numberOfTrailingZeros);

      timeDisplayStr += `:${ff}`;
    }

    return timeDisplayStr;
  };

  return (
    <div className="App">
      <input onChange={onYoutubeLinkInputChange} value={youtubeLink} />
      <button
        className="mainPageLinkInputButton"
        onClick={onYoutubeLinkInputButtonClick}
      >
        입력 완료
      </button>
      <div className="videoListContainer">
        {heatMarkerPeakArr.map((marker, idx) => {
          if (idx > showVideoNum - 1) return "";
          return (
            <div className="oneVideoContainer">
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/uRYIAKkQyL4?start=${Math.floor(
                  marker.timeRangeStartMillis / 1000 - timeDiffSec
                )}`}
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              />
              <div>
                <div>
                  점수:{" "}
                  {(marker.heatMarkerIntensityScoreNormalized * 100).toFixed(2)}
                </div>
                <div>
                  가장 많이 본 시각:{" "}
                  {convertSecondToHHMMSS(
                    Math.floor(marker.timeRangeStartMillis / 1000)
                  )}
                </div>
                <div>
                  영상 재생 시각:
                  {convertSecondToHHMMSS(
                    Math.floor(marker.timeRangeStartMillis / 1000 - timeDiffSec)
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
