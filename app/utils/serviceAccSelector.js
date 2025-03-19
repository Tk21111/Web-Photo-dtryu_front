import google from "googleapis"

const serviceAccSelector = (serviceAccId)  => {

    let key;

    switch (serviceAccId) {
        case 0:
            key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
            break;
        case 1:
            key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON1);
            break;
        case 2:
            key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON2);
            break;
        case 3:
            key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON3);
            break;
        case 4:
            key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON4);
            break;
        case 5:
            key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON5);
            break;
        default:
            throw new Error("Invalid serviceAccId");
    }

    
    const auth = new google.auth.GoogleAuth({
        credentials: key,
        scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const drive = google.drive({ version: 'v3', auth });


    return drive
}

export default serviceAccSelector
   

