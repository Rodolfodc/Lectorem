import { Component } from '@angular/core';
import { Camera, CameraOptions, PictureSourceType} from '@ionic-native/camera/ngx';
import { NavController, ActionSheetController} from '@ionic/angular';
//import { NgProgressModule } from '@ngx-progressbar/core';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx'
import { TesseractWorker } from 'tesseract.js';
//import * as gm from 'gm';
//import * as jimp from 'jimp';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page {

  constructor(
        public navCtrl: NavController, 
        private actionSheetCtrl: ActionSheetController,
        private camera:Camera, /*, public progress: NgProgressModule*/
        private tts: TextToSpeech
  ) {}
    imagePath = '';
    imageText = '';
    locale = 'pt-BR';
    
  startCamera() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.NATIVE_URI,
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
      destinationType: this.camera.DestinationType.NATIVE_URI,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: false
    }).then(imageData => {
      
      // this.img_u8 = new jsfeat.matrix_t(640, 480, jsfeat.U8C1_t);
      // console.log("\ncriou matriz");
      // jsfeat.imgproc.grayscale(imageData, 640, 480, this.img_u8);
      // console.log("\nGrayImage: "+ JSON.stringify(this.img_u8));
      //let x = jimp.//jimp.grayscale(imageData);
      //gm(imageData).resize(353, 257);
      //console.log("grayScale: "+x);
      this.imagePath = `data:image/jpeg;base64,${imageData}`;
      //console.log("\n>>>>>>>ImagePath: "+ this.imagePath);
      this.recognizeImage();
    });
  }

  recognizeImage(img: string = this.imagePath) {
    if(img === "" ||  img == null)
      return;
    const worker = new TesseractWorker();

    worker.detect(img)
    .progress((info) => {
      console.log(info);
      if(info.orientation_degrees != 0){
        this.imageText = "O objeto com o texto a ser reconhecido aparenta estar torto, por favor, tente uma"
        this.speak();
      }
      this.imageText = "Detectando angulação da imagem";
      this.speak();
    })
    .then((data) => {
      console.log(data);
    });

    worker.recognize(
      img, 
      'por'
    )
    .progress(message => {
      console.log("Progress...\n");
      console.log(JSON.stringify(message));
      if(message.status === "recognizing text"){
        this.imageText = "Progresso: "+ (Math.round(message.progress * 100)) + "%";
        if(Math.round(message.progress * 100) % 5 == 0){
          this.speak();
        }
      }
      else
        this.imageText = "Inicializando Inteligencia";
        this.speak();
    })
    .catch(
      err => {
        console.log("Catch...\n");
        console.error(err)
      }
    )
    .then( result => {
      console.log("THEN...\n");
      this.imageText = result.text;
      this.speak();
      worker.terminate();
      console.log(result);
    }).finally(resultOrError => {
      console.log("ResultOrError...\n");
      console.log(resultOrError);
    })
  }

  speak(){
    this.tts.speak({
      text: this.imageText,
      locale: this.locale
    })
    .then(() => console.log('Success'))
    .catch((reason: any) => console.log(reason));
  }

  stopSpeak(){
    this.tts.speak({
      text: ""
    });
  }
}
