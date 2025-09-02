import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class ImageCacheService {

  private http = inject(HttpClient);

  public async cacheImage(url: string, emailParticipante: string): Promise<string> {
    const fileName = this.getFileName(emailParticipante);

    try {
      try {
        const readResult = await Filesystem.readFile({
          path: fileName,
          directory: Directory.Cache
        });

        console.log('Image from cache:', fileName);
        return `data:image/jpeg;base64,${readResult.data}`;
      } catch (readError) {
        console.log('Downloading image:', url);

        const response = await this.http.get(url, { responseType: 'blob' }).toPromise();
        if (!response) {
          throw new Error('Empty response');
        }

        const base64Data = await this.blobToBase64(response);

        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
          recursive: true
        });

        console.log('Image saved to cache:', fileName);
        return `data:image/jpeg;base64,${base64Data}`;
      }
    } catch (error) {
      console.error('Error in cacheImage:', error);
      return url;
    }
  }

  private getFileName(emailParticipante: string): string {
    const safeEmail = emailParticipante.replace(/[^a-zA-Z0-9]/g, '_');
    return `cache_${safeEmail}.jpg`;
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64 || result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  public async isImageCached(emailParticipante: string): Promise<boolean> {
    try {
      const fileName = this.getFileName(emailParticipante);
      await Filesystem.stat({
        path: fileName,
        directory: Directory.Cache
      });
      return true;
    } catch {
      return false;
    }
  }

  public async removeFromCache(emailParticipante: string): Promise<void> {
    try {
      const fileName = this.getFileName(emailParticipante);
      await Filesystem.deleteFile({
        path: fileName,
        directory: Directory.Cache
      });
      console.log('Removed from cache:', fileName);
    } catch (error) {
      console.warn('Error removing from cache:', error);
    }
  }

  public async clearCache(): Promise<void> {
    try {
      const result = await Filesystem.readdir({
        path: '',
        directory: Directory.Cache
      });

      const cacheFiles = result.files.filter(file => file.name.startsWith('cache_'));

      for (const file of cacheFiles) {
        await Filesystem.deleteFile({
          path: file.name,
          directory: Directory.Cache
        });
      }

      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  public async getCacheSize(): Promise<number> {
    try {
      const result = await Filesystem.readdir({
        path: '',
        directory: Directory.Cache
      });

      let totalSize = 0;
      const cacheFiles = result.files.filter(file => file.name.startsWith('cache_'));

      for (const file of cacheFiles) {
        const stat = await Filesystem.stat({
          path: file.name,
          directory: Directory.Cache
        });
        totalSize += stat.size || 0;
      }

      return totalSize;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }
}
