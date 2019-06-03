import { Injectable } from '@angular/core';
import Tesseract from 'tesseract.js';
import { Platform } from '@ionic/angular';
import { resolve } from 'url';

export type ProgressFn = (progress: number) => void;

@Injectable({
  providedIn: 'root'
})
export class OcrProviderService {

  private readonly tesseract;

  constructor() {
    console.log('Hello OcrProvider');
    this.tesseract = Tesseract.create({
      workerPath: '/assets/lib/tesseract.js-worker_1.0.10.j',
      langPath: '/assets/lib/por.traineddata.gz',
      corePath: '/assets/lib/tesseract.js-core_0.1.0.jss',
    });
  }

  // public recognizeText(image){
  //   const tesseractConfig = {
  //     // If you want to set the language explicitly:
  //     lang: 'eng', 
  //     // You can play around with half-documented options:
  //     tessedit_char_whitelist: ' 0123456789',
  //   };
    
  //   this.tesseract.recognize(image, tesseractConfig)
  //     .progress((v) => {
  //       // v.status is a textual string of what Tesseract is doing
  //       // v.progress is a 0 - 1 decimal representation of the progress.
  //       // The progress resets for each new v.status,
  //       // but the major event is v.status == "recognizing text".
    
  //       console.log(v.status, v.progress);
  //     })
  //     .catch((err) => {
  //       console.error('OcrProvider: Failed to analyze text.', err);
  //     })
  //     .then((result) => resolve(result.text, ));
  // }

  public text(image: any, progressCallback: ProgressFn): Promise<string> {
    // Wrap the Tesseract process inside a native Promise,
    // as the PromiseLike returned by Tesseract caused problems.
    return new Promise<string>((resolve, reject) => {
      const tesseractConfig = {
        lang: 'por',
      }

      this.tesseract.recognize(image, tesseractConfig)
        .progress((status) => {
          if (progressCallback != null) {
            const progress = status.status == 'recognizing text'
              ? status.progress
              : 0

            progressCallback(progress)
          }
        })
        .catch((err) => {
          console.error('OcrProvider.text: Failed to analyze text.', err)

          reject(err)
        })
        .then((result) => resolve(result.text));
    });
  }
}