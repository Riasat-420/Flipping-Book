import React from 'react';
import { Printer, Download, Volume2, VolumeX } from 'lucide-react';

const QuickActionsMenu = ({ 
  isOpen, 
  onClose, 
  onPrint, 
  onDownload, 
  onToggleSound,
  soundEnabled,
  isDownloading 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl p-2 min-w-[180px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => { onPrint(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded transition-colors text-gray-800"
        >
          <Printer className="w-5 h-5" />
          <span className="font-medium">Print</span>
        </button>
        
        <button
          onClick={() => { onDownload(); onClose(); }}
          disabled={isDownloading}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded transition-colors text-gray-800 disabled:opacity-50"
        >
          {isDownloading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800"></div>
          ) : (
            <Download className="w-5 h-5" />
          )}
          <span className="font-medium">Download PDF</span>
        </button>
        
        <button
          onClick={() => { onToggleSound(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded transition-colors text-gray-800"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          <span className="font-medium">Sound</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActionsMenu;
