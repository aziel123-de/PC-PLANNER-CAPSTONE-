import React, { useState, useRef } from 'react';
import './ImageUpload.css';

const ImageUpload = ({ onImageSave, existingImage = null }) => {
  const [selectedImage, setSelectedImage] = useState(existingImage);
  const [previewUrl, setPreviewUrl] = useState(existingImage);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 10MB');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setSelectedImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!selectedImage) return;
    
    setIsUploading(true);
    if (errorMessage) setErrorMessage('');
    try {
      await onImageSave(selectedImage);
    } catch (error) {
      console.error('Upload failed:', error);
      setErrorMessage('Failed to upload image. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload-container">
      <div className="image-placeholder" onClick={() => fileInputRef.current?.click()}>
        {previewUrl ? (
          <img src={previewUrl} alt="Build preview" className="preview-image" />
        ) : (
          <div className="placeholder-content">
            <div className="upload-icon">📷</div>
            <p>Click to upload build image</p>
            <span className="upload-hint">JPEG, PNG • Max 10MB</span>
          </div>
        )}
      </div>
      
      {selectedImage && (
        <div className="upload-actions">
          <button 
            className="save-image-btn" 
            onClick={handleSave}
            disabled={isUploading}
          >
            {isUploading ? 'Saving...' : 'Save Image'}
          </button>
          <button className="remove-image-btn" onClick={handleRemove}>
            Remove
          </button>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />
      
      {errorMessage && (
        <div className="error-popup">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;