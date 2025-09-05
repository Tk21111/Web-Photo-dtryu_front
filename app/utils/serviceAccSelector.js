import { google } from 'googleapis';

const serviceAccSelector = (serviceAccId) => {
  const key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)[serviceAccId];

  // Select the service account credentials based on the ID
  
  // Set up Google Auth with the selected credentials
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  // Initialize the Drive API client
  const drive = google.drive({ version: 'v3', auth });

  return drive;
};

export default serviceAccSelector;
