import { google } from 'googleapis';
import { Readable } from 'stream';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const PARENT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '14ZUMACfoQpzYk84n0FDnNX7htDzr9lDr';

async function getDriveClient() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error('Kredensial OAuth2 Google Drive belum lengkap di .env');
  }
  const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, 'http://localhost');
  auth.setCredentials({ refresh_token: REFRESH_TOKEN });
  return google.drive({ version: 'v3', auth });
}

// Fungsi untuk mencari atau membuat sub-folder
async function getOrCreateSubFolder(drive: any, folderName: string) {
  try {
    // 1. Cari apakah folder sudah ada
    const response = await drive.files.list({
      q: `name = '${folderName}' and parents in '${PARENT_FOLDER_ID}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // 2. Jika tidak ada, buat folder baru
    console.log(`📁 Membuat folder baru di Drive: ${folderName}`);
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [PARENT_FOLDER_ID],
    };
    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });
    return folder.data.id;
  } catch (err: any) {
    console.error('[Drive Folder Error]', err.message);
    return PARENT_FOLDER_ID; // Fallback ke folder utama jika gagal
  }
}

export async function uploadToDrive(fileBuffer: ArrayBuffer, fileName: string, mimeType: string, folderName: string) {
  try {
    const drive = await getDriveClient();
    
    // Pastikan sub-folder tersedia
    const targetFolderId = await getOrCreateSubFolder(drive, folderName);

    const stream = new Readable();
    stream.push(Buffer.from(fileBuffer));
    stream.push(null);

    console.log(`[Drive] Mengunggah ${fileName} ke folder: ${folderName}`);

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [targetFolderId],
      },
      media: {
        mimeType: mimeType,
        body: stream,
      },
      fields: 'id',
    });

    return response.data.id;
  } catch (error: any) {
    console.error('[Drive OAuth2 Error]', error.message);
    return null;
  }
}
