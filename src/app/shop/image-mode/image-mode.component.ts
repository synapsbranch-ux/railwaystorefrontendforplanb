import { Component, OnInit } from '@angular/core';
declare let faceLandmarksDetection: any;
@Component({
  selector: 'app-image-mode',
  templateUrl: './image-mode.component.html',
  styleUrls: ['./image-mode.component.scss']
})
export class ImageModeComponent implements OnInit {
  imageUrl: string | ArrayBuffer | null = null;


  canvasElement!: HTMLCanvasElement;
  imageElement!: HTMLImageElement;
  selectedMask!: HTMLImageElement;
  isVideo: boolean = false;
  model: any = null; // Replace 'any' with the appropriate type for your model
  cameraFrame: any = null; // Replace 'any' with the appropriate type for your cameraFrame
  detectFace: boolean = false;
  clearMask: boolean = false;
  maskOnImage: boolean = false;
  masks: any[] = []; // Replace 'any' with the appropriate type for your masks
  maskKeyPointIndexs: number[] = [10, 234, 152, 454]; // overhead, left Cheek, chin, right cheek
seletedimage:any
  constructor() { }

  ngOnInit(): void {
    console.log('Image Mode Container');

    this.canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    this.imageElement = document.getElementById('faces') as HTMLImageElement;
    this.selectedMask = document.querySelector(".selected-mask img") as HTMLImageElement;
    this.seletedimage=localStorage.getItem('product2d');
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.readFile(file);
      setTimeout(()=>{
        this.startFacemask()
      },2000)
    }
    // this.imageUrl = 'assets/images/uttar.png';
    // setTimeout(()=>{
    //   this.startFacemask()
    // },2000)
  }

startFacemask()
{
  this.startFaceMask()
  .then(() => {
    this.maskOnImage = true;
    this.detectFaces();
  });
}

  private readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.imageUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }


  async startFaceMask(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      document.querySelector(".loading")?.classList.remove('d-none');
      if (this.model == null) {
        this.model = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);
        console.log("model loaded");
        this.cameraFrame = await this.detectFaces();
        document.querySelector(".loading")?.classList.add('d-none');
        resolve();
      } else if (!this.isVideo) {
        this.cameraFrame = await this.detectFaces();
        document.querySelector(".loading")?.classList.add('d-none');
        resolve();
      }
    });
  }

  async detectFaces(): Promise<void> {
    let inputElement = this.imageElement;
    let flipHorizontal = this.isVideo;
    console.log('model ', this.model.estimateFaces)
    console.log('inputElement ', inputElement)
    let predictions = await this.model.estimateFaces
      ({
        input: inputElement,
        returnTensors: false,
        flipHorizontal: flipHorizontal,
        predictIrises: false
      });
    console.log('predictions ',predictions)
    let confident_predictions = predictions.filter(p => p.faceInViewConfidence > 0.5);
    this.drawMask(confident_predictions);
    if (this.clearMask) {
      this.clearCanvas();
      this.clearMask = false;
    }
    if (this.detectFace) {
      this.cameraFrame = requestAnimationFrame(this.detectFaces);
    }
  }

  drawMask(predictions: any[]): void {
    if (this.masks.length !== predictions.length) {
      this.clearCanvas();
    }
    let overheadIndex = 0;
    let chinIndex = 2;
    let leftCheekIndex = this.isVideo ? 3 : 1;
    let rightCheekIndex = this.isVideo ? 1 : 3;

    if (predictions.length > 0) {
      for (let x = 0; x < predictions.length; x++) {
        const keypoints = predictions[x].scaledMesh;  // 468 key points of face;

        let dots: any[];
        let maskElement: HTMLImageElement;

        if (this.masks.length > x) {
          dots = this.masks[x].keypoints;
          maskElement = this.masks[x].maskElement;
        } else {
          dots = [];
          maskElement = document.createElement("img");
          maskElement.src = this.selectedMask.src;
          maskElement.id = `mask_${x}`;
          maskElement.classList.add('mask');
          this.masks.push({
            keypoints: dots,
            maskElement: maskElement
          });
          this.canvasElement.appendChild(maskElement);
        }

        for (let i = 0; i < this.maskKeyPointIndexs.length; i++) {
          const coordinate = this.getCoordinate(keypoints[this.maskKeyPointIndexs[i]][0], keypoints[this.maskKeyPointIndexs[i]][1]);
          let dot: any;

          if (dots.length > i) {
            dot = dots[i];
          } else {
            let dotElement = document.createElement("div");
            dotElement.classList.add('dot');
            dot = { top: 0, left: 0, element: dotElement };
            dots.push(dot);
            this.canvasElement.appendChild(dotElement);
          }

          dot.left = coordinate[0];
          dot.top = coordinate[1];
          dot.element.style.top = `${dot.top}px`;
          dot.element.style.left = `${dot.left}px`;
          dot.element.style.position = 'absolute';
        }

        let maskType = this.selectedMask.getAttribute("data-mask-type");
        let maskCoordinate, maskHeight, maskWidth, maskSizeAdjustmentWidth, maskSizeAdjustmentHeight, maskSizeAdjustmentTop, maskSizeAdjustmentLeft;
        let maskTop, maskLeft;

        switch (maskType) {
          case 'eye':
            maskCoordinate = { top: dots[overheadIndex].top, left: dots[leftCheekIndex].left };
            maskHeight = (dots[chinIndex].top - dots[overheadIndex].top);
            break;
          case 'full':
            maskCoordinate = { top: dots[overheadIndex].top, left: dots[leftCheekIndex].left };
            maskHeight = (dots[chinIndex].top - dots[overheadIndex].top);
            break;
          case 'half':
          default:
            maskCoordinate = dots[leftCheekIndex];
            maskHeight = (dots[chinIndex].top - dots[leftCheekIndex].top);
            break;
        }

        maskWidth = (dots[rightCheekIndex].left - dots[leftCheekIndex].left);
        maskSizeAdjustmentWidth = parseFloat(this.selectedMask.getAttribute("data-scale-width") || '0');
        maskSizeAdjustmentHeight = parseFloat(this.selectedMask.getAttribute("data-scale-height") || '0');
        maskSizeAdjustmentTop = parseFloat(this.selectedMask.getAttribute("data-top-adj") || '0');

        maskSizeAdjustmentLeft = this.isVideo ? parseFloat(this.selectedMask.getAttribute("data-left-adj") || '0') : 0;

        maskTop = maskCoordinate.top - ((maskHeight * (maskSizeAdjustmentHeight - 1)) / 2) - (maskHeight * maskSizeAdjustmentTop);
        maskLeft = maskCoordinate.left - ((maskWidth * (maskSizeAdjustmentWidth - 1)) / 2) - (maskWidth * maskSizeAdjustmentLeft);

        maskElement.style.top = `${maskTop}px`;
        maskElement.style.left = `${maskLeft}px`;
        maskElement.style.width = `${maskWidth * maskSizeAdjustmentWidth}px`;
        maskElement.style.height = `${maskHeight * maskSizeAdjustmentHeight}px`;
        maskElement.style.position = 'absolute';
      }
    }
  }

  getCoordinate(x: number, y: number): number[] {
    return [x, y];
  }

  clearCanvas(): void {
    while (this.canvasElement.firstChild) {
      this.canvasElement.removeChild(this.canvasElement.lastChild as Node);
    }
    this.masks = [];
  }

  switchSource(): void {
    this.canvasElement.style.transform = "";
    const containerElement = document.getElementById("image-container") as HTMLElement;
    document.getElementById("button-control")?.classList.remove("d-none");
    this.canvasElement.style.width = `${this.imageElement.clientWidth}px`;
    this.canvasElement.style.height = `${this.imageElement.clientHeight}px`;
    containerElement.appendChild(this.canvasElement);
    containerElement.appendChild(document.querySelector(".loading") as Node);
    containerElement.appendChild(document.getElementById("mask-slider") as Node);
    this.clearCanvas();
  }

}
