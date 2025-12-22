export const getPlaceholderImage = (id: string) => {
    return `https://picsum.photos/seed/${id}/300/200`;
};

export const openDocument = (url: string, filename?: string) => {
    if (url.startsWith('data:')) {
        // Extract mime type from Data URL
        const mimeMatch = url.match(/^data:([^;]+);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

        // Convert Data URL to Blob
        const byteString = atob(url.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);

        // If it's a PDF, open in new tab
        if (mimeType === 'application/pdf') {
            window.open(blobUrl, '_blank');
            return;
        }

        // For other file types, download with original filename
        const extMap: Record<string, string> = {
            'image/png': '.png',
            'image/jpeg': '.jpg',
            'image/jpg': '.jpg',
            'image/gif': '.gif',
            'image/webp': '.webp',
        };

        const ext = extMap[mimeType] || '';
        let downloadName = filename || 'document';

        // Add extension only if not already present
        if (ext && !downloadName.toLowerCase().endsWith(ext)) {
            downloadName += ext;
        }

        // Use Blob URL for download to ensure proper filename
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = downloadName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up blob URL after download
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } else {
        // For regular URLs, open in new tab
        window.open(url, '_blank');
    }
};
