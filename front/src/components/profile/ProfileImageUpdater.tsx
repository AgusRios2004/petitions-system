'use client';

import React, { useState, useRef } from 'react';
import { FiCamera, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadService } from '@/service/uploadService';
import { updateUser } from '@/service/profileService'; // Assuming this function exists
import { useAuth } from '@/context/AuthContext';

interface ProfileImageUpdaterProps {
  imageUrl: string | null | undefined;
  userId: number;
  onUpdate: () => void; // Callback to refetch data in parent
}

const ProfileImageUpdater: React.FC<ProfileImageUpdaterProps> = ({ imageUrl, userId, onUpdate }) => {
  const { user, updateUser: updateAuthUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      setError(null);

      const uploadResult = await uploadService.uploadProfileImage(file);
      if (uploadResult.error || !uploadResult.data) {
        throw new Error(uploadResult.error || 'Failed to get image URL.');
      }
      
      // 2. Update user profile with the new URL
      const updatedUser = await updateUser(userId, { profile_image: uploadResult.data });

      return updatedUser;
    },
    onSuccess: (data) => {
      // Update the user in the auth context
      if (user) {
        updateAuthUser({ profile_image: data.profile_image });
      }
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['providerPublicProfile', userId] });
      queryClient.invalidateQueries({ queryKey: ['customerProfile', userId] });
      onUpdate();
    },
    onError: (err: Error) => {
      setError(err.message || 'An unexpected error occurred.');
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const handleImageClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      mutation.mutate(file);
    }
  };

  return (
    <div className="relative w-32 h-32" onClick={handleImageClick}>
      <img
        src={imageUrl || '/default-avatar.png'} // Provide a default avatar
        alt="Profile"
        className={`w-full h-full rounded-full object-cover border-4 border-cyan-600 shadow-lg transition-all duration-300 cursor-pointer ${
          isUploading ? 'opacity-50' : 'hover:opacity-80'
        }`}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300">
        {!isUploading && <FiCamera className="text-white text-3xl" />}
      </div>

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <FiLoader className="animate-spin text-white text-4xl" />
        </div>
      )}

      {error && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-red-500 text-xs flex items-center gap-1">
          <FiAlertCircle /> {error}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
};

export default ProfileImageUpdater;
