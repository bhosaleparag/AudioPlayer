import React, { useState, useEffect, useRef } from "react";
import "../index.css";

const AudioPlayer = () => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const audioRef = useRef();
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

    useEffect(() => {
        const keys = Object.keys(localStorage);
        const archive = keys
            .filter(key => key !== "currentTrackIndex" && key !==  "currentTime")
            .map(key => ({ id: key, src: localStorage.getItem(key) }));
        setUploadedFiles(archive ?? []);

        const savedCurrentTrackIndex = parseInt(localStorage.getItem("currentTrackIndex") ?? 0);
        setCurrentTrackIndex(savedCurrentTrackIndex);      
    }, []);

    useEffect(() => {
        localStorage.setItem("currentTrackIndex", currentTrackIndex);
    }, [currentTrackIndex]);

    const handleAudioCanPlay = () => {
        audioRef.current.removeEventListener('canplay', handleAudioCanPlay);
        audioRef.current.play();
    };

    const resetAndPlayAudio = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.addEventListener('canplay', handleAudioCanPlay);
            audioRef.current.load();
        }
        localStorage.setItem("currentTrackIndex", currentTrackIndex);
    };
    
    const handleFileUpload = (e) => {
        const files = e.target.files;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileData = e.target.result;
                const fileId = file.name.slice(0, -4);
                const newTrack = {
                    id: fileId,
                    src: fileData,
                };
                if (!localStorage.getItem(fileId)) {
                    setUploadedFiles(prev => [...prev, newTrack]);
                    localStorage.setItem(fileId, fileData);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePlayNextSong = () => {
        if (currentTrackIndex === uploadedFiles.length - 1) {
            setCurrentTrackIndex(0);
        } else {
            setCurrentTrackIndex((prevIndex) => prevIndex + 1);
        }
        resetAndPlayAudio();
    };

    const handleAudioChange = (id) => {
        const index = uploadedFiles.findIndex(item => item.id === id);
        setCurrentTrackIndex(index);
        resetAndPlayAudio();
    };

    const handleTimeUpdate = () => {
        localStorage.setItem("currentTime", audioRef.current.currentTime);
    };
    const handleTimeStart = () => {
        audioRef.current.currentTime = parseFloat(localStorage.getItem("currentTime") ?? 0);
    };

    return (
        <div className="audio-player">
            <input type="file" multiple onChange={handleFileUpload} accept="audio/*" />
            <div className="player">
                <h2>Audio Player</h2>
                {uploadedFiles.length >= 1 ? (
                    <audio
                        src={uploadedFiles[currentTrackIndex].src}
                        onEnded={handlePlayNextSong}
                        ref={audioRef}
                        onLoadStart={handleTimeStart}
                        controls 
                        onTimeUpdate={handleTimeUpdate}
                    />
                ):(<h3>please upload files...</h3>)}
                <ul>
                    {uploadedFiles.map((item, i) => (
                        <li key={i} onClick={() => handleAudioChange(item.id)}>{item.id}</li>
                    ))}
                </ul>
            </div>
            
        </div>

    );
};

export default AudioPlayer;
