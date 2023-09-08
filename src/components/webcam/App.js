"use client"

import { useEffect, useRef } from 'react';

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket('ws://192.168.30.161:8080/ws/chat');
    socket.onopen = () => console.log('WebSocket is connected.');
    socket.onmessage = (event) => {
      console.log(event.data)
    }

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error(err));

    const intervalId = setInterval(() => {
      if (canvasRef.current && videoRef.current && socket?.readyState === WebSocket.OPEN) {
        const context = canvasRef.current.getContext('2d');
        context?.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');

        socket.send(dataUrl);
      }
    }, 200); 

    return () => {
      clearInterval(intervalId);

      if (socket) {
        socket.close();
      }
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}