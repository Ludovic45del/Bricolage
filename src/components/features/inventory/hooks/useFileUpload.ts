import { useState, useCallback, ChangeEvent } from 'react';

interface UploadedFile {
    name: string;
    url: string;
    size?: number;
    mimeType?: string;
}

interface UseFileUploadOptions {
    maxSizeBytes?: number;
    acceptedTypes?: string[];
    onSuccess?: (file: UploadedFile) => void;
    onError?: (error: string) => void;
}

interface UseFileUploadReturn {
    upload: (e: ChangeEvent<HTMLInputElement>) => void;
    uploadMultiple: (e: ChangeEvent<HTMLInputElement>) => void;
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Reusable hook for file uploads
 * Handles validation, reading as DataURL, and error states
 * 
 * @example
 * const { upload, isLoading } = useFileUpload({
 *   maxSizeBytes: 5 * 1024 * 1024,
 *   acceptedTypes: ['image/png', 'image/jpeg', 'application/pdf'],
 *   onSuccess: (file) => setFormData({ ...formData, invoice: file.url })
 * });
 */
export const useFileUpload = (options: UseFileUploadOptions = {}): UseFileUploadReturn => {
    const {
        maxSizeBytes = DEFAULT_MAX_SIZE,
        acceptedTypes,
        onSuccess,
        onError
    } = options;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateFile = useCallback((file: File): string | null => {
        // Check file size
        if (file.size > maxSizeBytes) {
            const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
            return `Le fichier dépasse la taille maximale de ${maxMB}MB`;
        }

        // Check file type
        if (acceptedTypes && acceptedTypes.length > 0) {
            if (!acceptedTypes.includes(file.type)) {
                return `Type de fichier non accepté. Types autorisés: ${acceptedTypes.join(', ')}`;
            }
        }

        return null;
    }, [maxSizeBytes, acceptedTypes]);

    const readFileAsDataURL = useCallback((file: File): Promise<UploadedFile> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = () => {
                if (reader.result) {
                    resolve({
                        name: file.name,
                        url: reader.result as string,
                        size: file.size,
                        mimeType: file.type
                    });
                } else {
                    reject(new Error('Échec de lecture du fichier'));
                }
            };

            reader.onerror = () => {
                reject(new Error('Erreur lors de la lecture du fichier'));
            };

            reader.readAsDataURL(file);
        });
    }, []);

    const upload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input value to allow re-upload of same file
        e.target.value = '';

        setError(null);
        setIsLoading(true);

        try {
            // Validate
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                onError?.(validationError);
                return;
            }

            // Read file
            const uploadedFile = await readFileAsDataURL(file);
            onSuccess?.(uploadedFile);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [validateFile, readFileAsDataURL, onSuccess, onError]);

    const uploadMultiple = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Reset input value
        e.target.value = '';

        setError(null);
        setIsLoading(true);

        try {
            const filePromises = Array.from(files).map(async (file) => {
                const validationError = validateFile(file);
                if (validationError) {
                    throw new Error(`${(file as File).name}: ${validationError}`);
                }
                return readFileAsDataURL(file);
            });

            const uploadedFiles = await Promise.all(filePromises);
            uploadedFiles.forEach(file => onSuccess?.(file));

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [validateFile, readFileAsDataURL, onSuccess, onError]);

    const clearError = useCallback(() => setError(null), []);

    return {
        upload,
        uploadMultiple,
        isLoading,
        error,
        clearError
    };
};

export default useFileUpload;
