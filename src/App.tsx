import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import mediaJSON from "./data";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogContent,
  MenuItem,
  MenuList,
  Card,
  Switch,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import YouTubeIcon from "@mui/icons-material/YouTube";
import PictureInPictureAltIcon from "@mui/icons-material/PictureInPictureAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import FullscreenIcon from "@mui/icons-material/Fullscreen";

import HdrAutoIcon from "@mui/icons-material/HdrAuto";

function App() {
  const videoRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playbackSettingsOpen, setPlaybackSettingsOpen] = useState(false);
  const [loadedDurationSec, setLoadedDurationSec] = useState(0);
  const [remainingDurationSec, setRemainingDurationSec] = useState(0);
  const [currentVid, setCurrentVid] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [first, setFirst] = useState(true);
  const [autoplay, setAutoplay] = useState(false);

  const sec2Min = (sec: number) => {
    const min = Math.floor(sec / 60);
    const secRemain = Math.floor(sec % 60);
    return {
      min,
      sec: secRemain,
    };
  };
  const openSettings = () => {
    setSettingsOpen(true);
  };

  const closeSettings = () => {
    setSettingsOpen(false);
    setPlaybackSettingsOpen(false);
  };

  const openPlaybackSettings = () => {
    setPlaybackSettingsOpen(true);
    setSettingsOpen(false);
  };

  const closePlaybackSettings = () => {
    setPlaybackSettingsOpen(false);
    setSettingsOpen(true);
  };

  useEffect(() => {
    if (videoRef.current && isPlaying) {
      const duration = videoRef.current.duration;
      setDurationSec(duration);

      const interval = setInterval(() => {
        setCurrentTimeSec(videoRef.current.currentTime);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const handlePlay = () => {
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentVid < mediaJSON.categories[0].videos.length - 1) {
      setCurrentVid(currentVid + 1);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      setVolume(videoRef.current.muted ? 0 : 1);
    }
  };

  const toggleFullScreen = () => {
    if (isFullScreen) {
      setIsFullScreen(false);
    } else {
      setIsFullScreen(true);
    }
  };

  const changeVolume = (value: React.SetStateAction<number>) => {
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  };

  const changeSpeed = (rate: React.SetStateAction<number>) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const togglePiP = async () => {
    if (document.pictureInPictureEnabled && videoRef.current) {
      try {
        if (!document.pictureInPictureElement) {
          await videoRef.current.requestPictureInPicture();
        } else {
          await document.exitPictureInPicture();
        }
      } catch (error) {
        console.error("Error toggling PiP mode:", error);
      }
    }
  };

  const handleWheel = (event: {
    preventDefault: () => void;
    deltaY: number;
  }) => {
    event.preventDefault();
    const newVolume = volume + (event.deltaY > 0 ? -0.1 : 0.1);
    setVolume(Math.min(1, Math.max(0, newVolume)));
  };
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.key === "k") {
        handlePlay();
      }
    };

    const handleKeyPress2 = (event: KeyboardEvent) => {
      if (event.key === "f") {
        toggleFullScreen();
      }
    };

    const handleKeyPress3 = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        videoRef.current.currentTime = videoRef.current.currentTime + 10;
      }
    };

    const handleKeyPress4 = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        videoRef.current.currentTime = videoRef.current.currentTime - 10;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keydown", handleKeyPress2);
    window.addEventListener("keydown", handleKeyPress3);
    window.addEventListener("keydown", handleKeyPress4);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keydown", handleKeyPress2);
      window.removeEventListener("keydown", handleKeyPress3);
      window.removeEventListener("keydown", handleKeyPress4);
    };
  }, [toggleFullScreen]);

  const { min: currentMin, sec: currentSec } = sec2Min(currentTimeSec);
  const { min: durationMin, sec: durationSecFormatted } = sec2Min(durationSec);

  useEffect(() => {
    const updateLoadedDuration = () => {
      if (videoRef.current) {
        const video = videoRef.current;
        const buffered = video.buffered;
        if (buffered.length > 0) {
          const loadedTime = buffered.end(0);
          setLoadedDurationSec(loadedTime);
        }
      }
    };

    const handleProgress = () => {
      updateLoadedDuration();
    };

    if (videoRef.current) {
      videoRef.current.addEventListener("progress", handleProgress);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("progress", handleProgress);
      }
    };
  }, []);

  useEffect(() => {
    setRemainingDurationSec(durationSec - (loadedDurationSec - currentTimeSec));

    if (durationSec === currentTimeSec && isChecked) {
      handleNext();
    }
  }, [loadedDurationSec, currentTimeSec, durationSec]);

  const handleThumbnailClick = (index: React.SetStateAction<number>) => {
    setCurrentVid(index);
    videoRef.current.load();
    setIsPlaying(true);
  };

  const handleMetadataLoaded = () => {
    setDurationSec(videoRef.current.duration);
    setLoadedDurationSec(0);
    setCurrentTimeSec(0);
    setRemainingDurationSec(0);
    if (!first) {
      handlePlay();
    }
    setFirst(false);
  };

  const [isChecked, setIsChecked] = useState(false);

  const handleChange = () => {
    setIsChecked((prev) => !prev);
  };

  return (
    <div
      className="container"
      style={{ display: "flex", flexDirection: "column", gap: "200px" }}
    >
      {!isFullScreen && (
        <AppBar sx={{ color: "white", backgroundColor: "black" }}>
          <Toolbar variant="dense">
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <YouTubeIcon sx={{ color: "red", fontSize: "40px" }} />
            <Typography variant="h6" color="inherit" component="div">
              <strong style={{ fontStretch: "semi-condensed" }}>Premium</strong>
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div>
          <div
            className="playerContainer"
            style={
              isFullScreen ? { height: "99vh", width: "1530px", left: 1 } : {}
            }
          >
            <video
              className="videoPlayer"
              ref={videoRef}
              src={mediaJSON.categories[0].videos[currentVid].sources[0]}
              // src="https://vidsrc.to/embed/tv/125928/1/1"
              onClick={handlePlay}
              loop={!isChecked}
              onLoadedMetadata={handleMetadataLoaded}
              style={isFullScreen ? {} : { minHeight: "450px", width: "800px" }}
            ></video>

            <div className="timelineContainer">
              <input
                type="range"
                min={0}
                max={durationSec}
                value={currentTimeSec}
                defaultValue={0}
                className="timeline"
                onChange={(e) => {
                  videoRef.current.currentTime = e.target.value;
                }}
                style={
                  isFullScreen
                    ? {
                        background: `linear-gradient(to right, red 0%, red ${
                          (currentTimeSec / durationSec) * 100
                        }%, white ${
                          (currentTimeSec / durationSec) * 100
                        }%, white ${
                          ((currentTimeSec + loadedDurationSec) / durationSec) *
                          100
                        }%, #666 ${
                          ((currentTimeSec + loadedDurationSec) / durationSec) *
                          100
                        }%, #666 ${
                          ((currentTimeSec +
                            loadedDurationSec +
                            remainingDurationSec) /
                            durationSec) *
                          100
                        }%, #666 100%)`,
                        width: 1520,
                      }
                    : {
                        background: `linear-gradient(to right, red 0%, red ${
                          (currentTimeSec / durationSec) * 100
                        }%, white ${
                          (currentTimeSec / durationSec) * 100
                        }%, white ${
                          ((currentTimeSec + loadedDurationSec) / durationSec) *
                          100
                        }%, #666 ${
                          ((currentTimeSec + loadedDurationSec) / durationSec) *
                          100
                        }%, #666 ${
                          ((currentTimeSec +
                            loadedDurationSec +
                            remainingDurationSec) /
                            durationSec) *
                          100
                        }%, #666 100%)`,
                        width: 780,
                      }
                }
              />
            </div>
            <div className="controlsContainer">
              <div className="controls">
                {isPlaying ? (
                  <button className="controlButton" onClick={handlePlay}>
                    <PauseIcon />
                  </button>
                ) : (
                  <button className="controlButton" onClick={handlePlay}>
                    <PlayArrowIcon />
                  </button>
                )}

                <button className="controlButton" onClick={handleNext}>
                  <SkipNextIcon />
                </button>

                <div className="duration">
                  {currentMin}:{currentSec}/{durationMin}:{durationSecFormatted}
                </div>
                <div className="volumeContainer">
                  <button className="controlButton" onClick={toggleMute}>
                    {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                  </button>
                  <input
                    onWheel={handleWheel}
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    defaultValue={1}
                    className="volume"
                    onChange={(e) => changeVolume(parseFloat(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, rgb(230, 230, 230) 0%, rgb(230, 230, 230) ${
                        volume * 100
                      }%, #5A5A5A ${1}%, #5A5A5A 100%)`,
                    }}
                  />
                </div>

                <div
                  style={
                    isFullScreen
                      ? { paddingLeft: "990px" }
                      : { paddingLeft: "250px" }
                  }
                >
                  <Dialog
                    open={settingsOpen}
                    onClose={closeSettings}
                    sx={{
                      backgroundColor: "rgba(1,1,1,0)", // Change background color
                      borderRadius: "10px", // Adjust border radius
                    }}
                    BackdropProps={{ invisible: true }}
                  >
                    <DialogContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "rgba(1,1,1,.6)",
                        color: "white",
                        position: "fixed",
                        top: "320px",
                        left: "620px",
                      }}
                    >
                      <Button
                        onClick={openPlaybackSettings}
                        sx={{ color: "white" }}
                      >
                        Playback Speed
                      </Button>
                      <Button sx={{ color: "white" }}>Captions</Button>
                      <Button sx={{ color: "white" }}>Quality</Button>
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={playbackSettingsOpen}
                    onClose={closePlaybackSettings}
                    sx={{ backgroundColor: "rgba(255,255,255,0)" }}
                    BackdropProps={{ invisible: true }}
                  >
                    <DialogContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "rgba(1,1,1,.6)",
                        color: "white",
                        position: "fixed",
                        top: "250px",
                        left: "640px",
                        alignItems: "center",
                      }}
                    >
                      <span>Playback Speed</span>
                      <MenuList>
                        <MenuItem
                          onClick={() => changeSpeed(0.5)}
                          selected={playbackRate === 0.5}
                        >
                          0.5x
                        </MenuItem>
                        <MenuItem
                          onClick={() => changeSpeed(1)}
                          selected={playbackRate === 1}
                        >
                          1x
                        </MenuItem>
                        <MenuItem
                          onClick={() => changeSpeed(1.5)}
                          selected={playbackRate === 1.5}
                        >
                          1.5x
                        </MenuItem>
                        <MenuItem
                          onClick={() => changeSpeed(2)}
                          selected={playbackRate === 2}
                        >
                          2x
                        </MenuItem>
                      </MenuList>
                    </DialogContent>
                  </Dialog>
                </div>
                <Switch
                  checked={isChecked}
                  onChange={handleChange}
                  icon={<HdrAutoIcon />}
                  checkedIcon={<HdrAutoIcon sx={{ color: "white" }} />}
                  className="switchy"
                  color="error"
                />
                <button
                  className="controlButton"
                  onClick={() => openSettings()}
                >
                  <SettingsIcon />
                </button>

                <button className="controlButton" onClick={togglePiP}>
                  <PictureInPictureAltIcon />
                </button>
                <button className="controlButton" onClick={toggleFullScreen}>
                  <FullscreenIcon />
                </button>
              </div>
            </div>
          </div>
          {!isFullScreen && (
            <div
              style={{
                color: "white",
                left: "-200px",
                position: "relative",
                height: "100px",
              }}
            >
              <h1>{mediaJSON.categories[0].videos[currentVid].title}</h1>
              <p
                style={{
                  width: "800px",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2 /* Limit number of lines */,
                  WebkitBoxOrient: "vertical",
                  textOverflow: "ellipsis",
                }}
              >
                {mediaJSON.categories[0].videos[currentVid].description}
              </p>
            </div>
          )}
        </div>
        {!isFullScreen && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {mediaJSON.categories[0].videos.slice(0, 5).map((item, index) => (
              <div key={index} className="thumbs">
                {false ? (
                  <div></div>
                ) : (
                  <Card
                    sx={{
                      backgroundColor: "inherit",
                      position: "relative",
                    }}
                  >
                    <img
                      src={item.thumb}
                      alt={`Thumbnail ${index}`}
                      onClick={() => handleThumbnailClick(index)}
                      style={{
                        width: "160px",
                        height: "100px",
                        cursor: "pointer",
                        borderRadius: "5px",
                      }}
                    />
                    <div style={{ color: "white", width: "160px" }}>
                      <strong>{item.title}</strong>
                    </div>
                  </Card>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
