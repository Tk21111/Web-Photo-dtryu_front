import { google } from 'googleapis';

const serviceAccSelector = (serviceAccId) => {
  let key;

  // Select the service account credentials based on the ID
  switch (serviceAccId) {
    case 0:
      key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}');
      break;
    case 1:
      key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON1 || '{}');
      break;
    case 2:
      key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON2 || '{}');
      break;
    case 3:
      key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON3 || '{}');
      break;
    case 4:
      key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON4 || '{}');
      break;
    case 5:
      key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON5 || '{}');
      break;
    default:
      throw new Error('Invalid serviceAccId');
  }

  // Set up Google Auth with the selected credentials
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  // Initialize the Drive API client
  const drive = google.drive({ version: 'v3', auth });
  console.log('Service account email:', drive._options?.auth?.client_email);

  return drive;
};

export default serviceAccSelector;
