import React, { useRef, useEffect, useState } from 'react';

const Whiteboard = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#1A1A1A');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    
    // Set white background if empty
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Support both mouse and touch events
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = color;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full p-2">
      <div className="neobrutal-card neobrutal-shadow border-[2.5px] border-zinc-900 rounded-3xl overflow-hidden bg-white w-full h-full flex flex-col">
        <div className="bg-zinc-100 border-b-2 border-zinc-900 p-3 flex justify-between items-center">
          <div className="flex gap-2">
            {['#1A1A1A', '#FF4F4F', '#4CAF50', '#2196F3'].map(c => (
              <button 
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 border-zinc-900 transition-transform ${color === c ? 'scale-125' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={clear}
              className="material-symbols-outlined text-lg p-1 hover:bg-white rounded-lg transition-colors"
            >
              delete
            </button>
            {onClose && (
              <button 
                onClick={onClose}
                className="material-symbols-outlined text-lg p-1 hover:bg-white rounded-lg transition-colors"
              >
                close
              </button>
            )}
          </div>
        </div>
        <canvas 
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair touch-none bg-white"
        />
      </div>
    </div>
  );
};

export default Whiteboard;
