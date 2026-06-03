import React, { useCallback, useState } from 'react';
import { Upload, FileImage, X } from 'lucide-react';

interface DragDropUploadProps {
  onUpload: (file: File) => void;
  accept?: string;
}

export const DragDropUpload: React.FC<DragDropUploadProps> = ({ 
  onUpload, 
  accept = 'image/png, image/jpeg, image/svg+xml' 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setFileDetails({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB'
      });
      
      onUpload(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setFileDetails(null);
  };

  return (
    <div
      className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8 text-center cursor-pointer overflow-hidden
        ${isDragging 
          ? 'border-electric-blue bg-electric-blue/10 scale-[1.02]' 
          : 'border-white/20 bg-white/5 hover:border-electric-blue/50 hover:bg-white/10'
        }
        ${preview ? 'min-h-[300px]' : 'min-h-[240px]'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !preview && document.getElementById('file-upload')?.click()}
    >
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />

      {preview ? (
        <div className="absolute inset-0 w-full h-full p-4 flex flex-col items-center justify-center bg-navy-900/80 backdrop-blur-sm z-10">
          <div className="relative max-w-full max-h-[80%] rounded-lg overflow-hidden border border-white/20 shadow-2xl">
            <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain" />
          </div>
          
          <div className="mt-4 flex items-center justify-between w-full max-w-md bg-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-3 overflow-hidden">
              <FileImage className="w-6 h-6 text-electric-blue shrink-0" />
              <div className="text-left overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{fileDetails?.name}</p>
                <p className="text-xs text-gray-400">{fileDetails?.size}</p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 bg-rose-500/20 text-rose-400 rounded-full hover:bg-rose-500/40 transition-colors shrink-0 ml-2"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={`p-4 rounded-full bg-white/5 border border-white/10 mb-4 transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
            <Upload className="w-8 h-8 text-electric-blue" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Drag & Drop your UML Diagram
          </h3>
          <p className="text-sm text-gray-400 mb-6 max-w-sm">
            Upload your Class, Use Case, or Sequence diagrams. We support PNG, JPG, and SVG files.
          </p>
          <span className="px-5 py-2.5 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-electric-blue-dark transition-colors shadow-lg shadow-electric-blue/20">
            Browse Files
          </span>
        </>
      )}
    </div>
  );
};
