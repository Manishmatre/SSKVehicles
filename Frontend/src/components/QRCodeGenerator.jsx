import React, { useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { FaDownload } from 'react-icons/fa';

const QRCodeGenerator = ({ value, size = 200, includeDownload = true }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (value && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      }, (error) => {
        if (error) {
          console.error('Error generating QR code:', error);
        }
      });
    }
  }, [value, size]);
  
  const downloadQRCode = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'attendance-qr-code.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <canvas ref={canvasRef} />
      </div>
      
      {includeDownload && (
        <button 
          onClick={downloadQRCode}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
        >
          <FaDownload />
          <span>Download QR Code</span>
        </button>
      )}
    </div>
  );
};

export default QRCodeGenerator;
