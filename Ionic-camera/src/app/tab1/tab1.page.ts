import { Component } from '@angular/core';
import { Camera, CameraOptions, PictureSourceType} from '@ionic-native/camera/ngx';
import { NavController, ActionSheetController} from '@ionic/angular';
//import { NgProgressModule } from '@ngx-progressbar/core';
import { TesseractWorker} from 'tesseract.js';
import {OcrProviderService} from '../ocr-provider.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page {

  constructor(public navCtrl: NavController, private actionSheetCtrl: ActionSheetController,
    private camera:Camera /*, public progress: NgProgressModule*/) {}
    imagePath = '';
    imageText = '';
    
  async startCamera() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    
    this.camera.getPicture(options).then((imageData) => {
      console.log(options);
     let base64Image = 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
      console.log(err);
    });
  }

  async selectSource(){
    let actionSheet = await this.actionSheetCtrl.create({
      buttons:[
        {
          text: 'Galeria',
          handler: () => {
            this.getPicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Camera',
          handler: () => {
            this.getPicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  getPicture(sourceType: PictureSourceType) {
    this.camera.getPicture({
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    }).then(imageData => {
      this.imagePath = `data:image/jpeg;base64,${imageData}`;
    });
  }

  recognizeImage() { 
    const worker = new TesseractWorker();
    console.log("Juntos e Shallow now");
    worker.recognize(this.imagePath)
    .progress(message => {
      console.log("Progress...\n");
      console.log(JSON.stringify(message));
    })
    .catch(
      err => {
        console.log("Catch...\n");
        console.error(JSON.stringify(err))
      }
    )
    .then( result => {
      console.log("THEN...\n");
      console.log("Result: "+JSON.stringify(result));
      this.imageText = result.text;
    }).finally(resultOrError => {
      console.log("ResultOrError...\n");
      console.log("resultOrError: "+JSON.stringify(resultOrError));
    })
  }
}
