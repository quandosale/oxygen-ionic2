import { Injectable } from '@angular/core';
import { Platform }   from 'ionic-angular';

import ImgCache       from 'imgcache.js';

/**
 * This service is charged of provide the methods to cache the images
 */
@Injectable()
export class ImgcacheService {

  public imgQueue: string[] = [];

  constructor(platform: Platform) {
    ImgCache.options.debug = true;
  }

  /**
   * Init imgCache library
   * @return {Promise}
   */
  public initImgCache(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (ImgCache.ready) {
        console.log('imagecache ready');
        resolve();
      } else {
        console.log('imagecache ready else');
        ImgCache.init(() => resolve(), () => reject());
      }
    });
  }

  /**
   * Cache images
   * @param src {string} - img source
   */
  public cacheImg(src: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ImgCache.isCached(src, (path: string, success: boolean) => {
        // if not, it will be cached
        console.log(src);
        if (success) {
          ImgCache.getCachedFileURL(src,
            (originalUrl, cacheUrl) => {
              console.log(originalUrl, cacheUrl, 'getcachedFileUrl');
              resolve(cacheUrl);
            },
            (e) => {
              reject(e)
            });
        } else {
          // cache img
          ImgCache.cacheFile(src);
          // return original img URL
          console.log(src, 'cacheFile');
          resolve(src);
        }
      });
    });
  }
}
