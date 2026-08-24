import React, { useRef, useState, useEffect } from 'react';
import { Modal } from './UIElements';

export default function ImageCropperModal({ imageSrc, onCrop, onCancel }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgObj, setImgObj] = useState(null);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImgObj(img);
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (!imgObj || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 260;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    const centerX = size / 2 + offset.x;
    const centerY = size / 2 + offset.y;
    ctx.translate(centerX, centerY);

    const aspect = imgObj.width / imgObj.height;
    let drawWidth = size * zoom;
    let drawHeight = (size / aspect) * zoom;
    if (aspect < 1) {
      drawHeight = size * zoom;
      drawWidth = size * aspect * zoom;
    }

    ctx.drawImage(imgObj, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    // Circular overlay mask
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.beginPath();
    ctx.rect(0, 0, size, size);
    ctx.arc(size / 2, size / 2, size / 2 - 12, 0, Math.PI * 2, true);
    ctx.fill();

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }, [imgObj, zoom, offset]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Mobile Touch Support
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
  };

  const applyCrop = () => {
    if (!imgObj) return;
    // High-resolution 360x360 HD avatar size for crisp Retina & Mobile displays
    const cropSize = 360;
    const outCanvas = document.createElement('canvas');
    outCanvas.width = cropSize;
    outCanvas.height = cropSize;
    const outCtx = outCanvas.getContext('2d');
    outCtx.imageSmoothingEnabled = true;
    outCtx.imageSmoothingQuality = 'high';

    outCtx.save();
    outCtx.beginPath();
    outCtx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
    outCtx.clip();

    const scale = cropSize / 260;
    const centerX = (260 / 2 + offset.x) * scale;
    const centerY = (260 / 2 + offset.y) * scale;
    outCtx.translate(centerX, centerY);

    const aspect = imgObj.width / imgObj.height;
    let drawWidth = cropSize * zoom;
    let drawHeight = (cropSize / aspect) * zoom;
    if (aspect < 1) {
      drawHeight = cropSize * zoom;
      drawWidth = cropSize * aspect * zoom;
    }

    outCtx.drawImage(imgObj, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    outCtx.restore();

    // High-definition quality JPEG encoding preserving rich detail
    const highQualityBase64 = outCanvas.toDataURL('image/jpeg', 0.90);
    onCrop(highQualityBase64);
  };

  return (
    <Modal title="Crop & Adjust Profile Picture" onClose={onCancel}>
      <div className="cropper-container">
        <p className="cropper-tip">Drag or touch photo to center it inside circle.</p>
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab', borderRadius: '12px', touchAction: 'none' }}
          />
        </div>

        <div className="field-group" style={{ marginTop: '16px', width: '100%' }}>
          <label>Zoom: {Math.round(zoom * 100)}%</label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="text-input"
          />
        </div>

        <div className="two-col-fields" style={{ marginTop: '20px', width: '100%' }}>
          <button type="button" className="btn-outline full-width" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-primary full-width" onClick={applyCrop}>
            Apply & Save Photo ✨
          </button>
        </div>
      </div>
    </Modal>
  );
}
