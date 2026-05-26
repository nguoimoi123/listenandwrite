/**
 * Google Drive REST API Utilities for ListenWrite App
 */

export interface GDriveFile {
  id: string;
  name: string;
  mimeType: string;
}

async function throwDriveError(res: Response, action: string): Promise<never> {
  let details = res.statusText || 'Unknown error';

  try {
    const data = await res.json();
    details = data?.error?.message || details;
  } catch {
    try {
      details = await res.text();
    } catch {
      // Keep statusText when the body is unavailable.
    }
  }

  throw new Error(`Google Drive API error ${action}: ${res.status} ${details}`);
}

/**
 * Searches and lists folders in the user's primary Google Drive
 */
export async function gdriveListFolders(token: string): Promise<GDriveFile[]> {
  const q = encodeURIComponent("mimeType = 'application/vnd.google-apps.folder' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType)&spaces=drive&pageSize=1000&orderBy=modifiedTime desc`;
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    await throwDriveError(res, 'listing folders');
  }
  const data = await res.json();
  return data.files || [];
}

/**
 * Creates a brand new folder in Google Drive
 */
export async function gdriveCreateFolder(token: string, name: string, parentId?: string): Promise<string> {
  const metadata: any = {
    name,
    mimeType: 'application/vnd.google-apps.folder'
  };
  if (parentId) {
    metadata.parents = [parentId];
  }

  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });

  if (!res.ok) {
    await throwDriveError(res, 'creating folder');
  }
  const data = await res.json();
  return data.id;
}

/**
 * Searches for a file/folder inside a specified parent folder by name
 */
export async function gdriveFindFile(token: string, filename: string, parentId?: string): Promise<GDriveFile | null> {
  let query = `name = '${filename.replace(/'/g, "\\'")}' and trashed = false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }
  const q = encodeURIComponent(query);
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,parents)&spaces=drive`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    await throwDriveError(res, 'finding file');
  }
  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0];
  }
  return null;
}

/**
 * Reads plain text or JSON content from a specific file ID
 */
export async function gdriveReadFileText(token: string, fileId: string): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    await throwDriveError(res, 'reading file content');
  }
  return await res.text();
}

/**
 * Reads binary content as Blob for a specific file ID
 */
export async function gdriveReadFileBlob(token: string, fileId: string): Promise<Blob> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    await throwDriveError(res, 'reading binary content');
  }
  return await res.blob();
}

/**
 * Saves (creates or updates content using Media Stream PATCH) a file in an active folder
 */
export async function gdriveSaveFile(
  token: string,
  folderId: string,
  filename: string,
  content: string | Blob,
  mimeType: string
): Promise<string> {
  // 1. Check if the file already exists in this folder
  const existingFile = await gdriveFindFile(token, filename, folderId);
  let fileId = existingFile?.id;

  if (!fileId) {
    // 2. Create metadata first
    const metadata = {
      name: filename,
      parents: [folderId],
      mimeType: mimeType
    };

    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });

    if (!createRes.ok) {
      await throwDriveError(createRes, 'creating file metadata');
    }
    const createData = await createRes.json();
    fileId = createData.id;
  }

  // 3. Upload content to the file ID
  const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
  const uploadRes = await fetch(uploadUrl, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': mimeType
    },
    body: content
  });

  if (!uploadRes.ok) {
    await throwDriveError(uploadRes, 'updating file content');
  }

  return fileId!;
}

/**
 * Safely deletes a file from Google Drive by ID or name
 */
export async function gdriveDeleteFile(token: string, fileId: string): Promise<void> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    await throwDriveError(res, 'deleting file');
  }
}

/**
 * Lists all non-trash files in a specific folder on Google Drive
 */
export async function gdriveListFilesInFolder(token: string, folderId: string): Promise<GDriveFile[]> {
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType)&spaces=drive&pageSize=1000`;
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    await throwDriveError(res, 'listing files in folder');
  }
  const data = await res.json();
  return data.files || [];
}
