import apiClient from './apiClient';

const fileService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Using apiClient but overriding content-type header
    const response: any = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.code === 200) {
      return response.data; // Assuming data is the url string
    }
    throw new Error(response.message || 'Upload failed');
  }
};

export default fileService;

