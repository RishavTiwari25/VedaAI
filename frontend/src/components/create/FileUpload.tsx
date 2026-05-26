'use client';

import { useCallback, useState } from 'react';
import { Upload, CheckCircle, X, FileText } from 'lucide-react';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  selectedFile: File | null;
}

export default function FileUpload({ onFileChange, selectedFile }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSet(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
    e.target.value = '';
  };

  function validateAndSet(file: File) {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      alert('Only JPEG, PNG, GIF, and PDF files are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB.');
      return;
    }
    onFileChange(file);
  }

  return (
    <div>
      {!selectedFile ? (
        <label
          className={`file-upload-zone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          htmlFor="file-upload-input"
          style={{ cursor: 'pointer' }}
        >
          <div className="file-upload-icon">
            <Upload size={26} />
          </div>
          <div className="file-upload-text">
            {isDragOver ? 'Drop your file here' : 'Choose a file or drag & drop it here'}
          </div>
          <div className="file-upload-hint">JPEG, PNG, PDF • Up to 10MB</div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('file-upload-input')?.click();
            }}
          >
            Browse Files
          </button>
          <input
            id="file-upload-input"
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.pdf"
            onChange={handleFileInput}
            className="sr-only"
            aria-label="Upload file"
          />
        </label>
      ) : (
        <div className="file-selected">
          <FileText size={16} />
          <span style={{ flex: 1 }}>{selectedFile.name}</span>
          <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </span>
          <button
            type="button"
            onClick={() => onFileChange(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center' }}
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <p className="file-upload-caption" style={{ marginTop: '8px' }}>
        Upload images of your preferred document/image (optional)
      </p>
    </div>
  );
}
