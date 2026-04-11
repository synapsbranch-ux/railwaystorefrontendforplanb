import {
  Component, OnInit, OnDestroy, ViewChild, TemplateRef, Input, PLATFORM_ID, Inject, Renderer2, ElementRef,
  HostListener,
  AfterViewInit
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import '@google/model-viewer';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
declare let faceLandmarksDetection: any;
declare let AFRAME: any;
declare let facemesh: any
@Component({
  selector: 'app-product-view3D',
  templateUrl: './product-view3D.component.html',
  styleUrls: ['./product-view3D.component.scss']
})
export class view3DModalComponent implements OnInit, OnDestroy, AfterViewInit {

  redIcon = 'assets/images/red-close.png';
  greenIcon = 'assets/images/green-check.png';
  yellowIcon = 'assets/images/yellow-check.png';

  @Input() is3DProduct: boolean;
  @Input() image3d
  @ViewChild("view3D", { static: false }) view3D: TemplateRef<any>;
  public closeResult: string;
  public modalOpen: boolean = false;
  mode = 'video';
  videomodestatus: boolean = false;
  imagemodestatus: boolean = false;
  modelSrc: string | ArrayBuffer | null = null;
  modelHTML: any
  modelImageHTML: any
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
  seletedimage: any
  arSystem: any;
  cameraDetact: any;
  faceDetact: any;
  facedetectbool: boolean = true;
  lookStraght: any;
  facePostion: any;
  returnUrl: any
  isGlassReady = false;
  iframeBaseLink = 'https://tryon.ralbatech.com/?p_name='
  iframeLink: any

  //Declear for face movement and oval face position
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | undefined;
  fmesh: any;
  MAX_SPEED = 600;
  drawMaskAR: boolean = true;
  mindarElement = document.querySelector('#mindar_section') as HTMLDivElement;;
  messageBox = document.querySelector('.message_box') as HTMLDivElement;;
  mindaroverlay = document.querySelector('.mindar-ui-loading') as HTMLDivElement;
  acanvas
  prevNosePosition = null;
  totalDistance = 0; // To track total distance moved
  prevFrameTime = Date.now();
  video: HTMLVideoElement
  animationFrameVideoId
  animationFrameCanvasId
  animationFrameFaceId
  isCustomARSystemRegistered: boolean = false; // Flag to track registration
  showFaceCapture = true;
  curFaces = [];
  glassImageUrl = 'assets/images/overlay.png'; // Replace with your image path
  glassImage: HTMLImageElement = new Image();
  isFaceDetect: boolean = false;
  loaderShow: boolean = true
  showHelp: boolean = false;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef<HTMLDivElement>;
  @ViewChild('contentImageContainer', { static: false }) contentImageContainer: ElementRef<HTMLDivElement>;

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('faceCanvas') faceCanvas!: ElementRef<HTMLCanvasElement>;
  @HostListener('contextmenu', ['$event'])
  onRightClick(event: Event): void {
    event.preventDefault(); // Prevent default behavior (e.g., context menu)
    event.stopPropagation(); // Stop event propagation to parent elements
  }

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private modalService: NgbModal, private sanitizer: DomSanitizer, private renderer: Renderer2, private router: Router) {
  }

  async ngOnInit() {
    this.returnUrl = this.router.url;
    this.cameraDetact = this.redIcon;
    this.faceDetact = this.redIcon;
    this.lookStraght = this.redIcon;
    this.facePostion = this.redIcon;
    this.glassImage.src = this.glassImageUrl;
    const localImage = localStorage.getItem('storedSelfie');
    if (localImage && this.mode === 'image') {
      this.showHelp = true;
    }
    console.log(this.showHelp);
    this.registerCustomARSystem();
    const myImageElement = document.getElementById('faces') as HTMLImageElement;
    if (myImageElement) {
      myImageElement.style.display = 'none';
    }
    this.initializeFaceGlassImage();
  }

  ngAfterViewInit() {
    const localImage = localStorage.getItem('storedSelfie');
    if (localImage && this.mode === 'image') {
      this.showHelp = true;
      this.onSelfieCaptured(localImage);
    }
  }


  registerCustomARSystem() {
    if (!AFRAME.systems['custom-ar']) {
      AFRAME.registerSystem('custom-ar', {
        init: function () {
          // Initialize your AR system here
          this.arSystem = this.sceneEl.systems['mindar-face-system'];
        }
      });
    }
  }

  unregisterCustomARSystem() {
    if (AFRAME.systems['custom-ar']) {
      // Cleanup or reset related to AR system can be handled here if needed
      // Currently, A-Frame doesn't provide direct unregisterSystem method

      delete AFRAME.systems['custom-ar']; // Remove the system from AFRAME
    }
  }
  toggleHelp() {
    this.showHelp = !this.showHelp;
  }

  startTryOn() {
    this.showHelp = false;
    this.retakeSelfie();
  }

  async initializeFaceGlassImage() {
    this.isGlassReady = false;
    const isMobile = window.innerWidth <= 768;  // You can adjust this breakpoint
    const leftAdj = isMobile ? '-.17' : '-.48';  // mobile or desktop/tablet

    const imageHtml = `
<style>
  .loading {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 24px;
    z-index: 5;
  }

  .spinner-border {
    width: 15rem;
    height: 15rem;
    position: absolute;
  }

  #image-container {
    position: relative;
  }

  #faces {
    width: 279px;
    height: auto;
    display: block;
    text-align: center;
    margin: 0 auto;
  }

  #canvas {
    width: 279px;
    height: auto;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99;
  }

  #mask-slider {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    z-index: 4;
  }

  #mask-list ul {
    list-style: none;
    padding: 0;
    margin: 0 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #mask-list li {
    position: relative;
    width: 100px;
    height: 100px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .full-mask {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 100%;
    max-height: 100%;
    pointer-events: none;
  }

  #arrowLeft,
  #arrowRight {
    width: 30px;
    height: 30px;
    cursor: pointer;
  }
</style>

<div id="image-container">
  <img id="faces" src="" class="fixed-face-size" alt="Face Image" style="display: none;">
  <div id="canvas"></div>

  <div class="loading d-none">
    Loading Model
    <div class="spinner-border" role="status">
      <span class="sr-only"></span>
    </div>
  </div>

  <div id="mask-slider" style="display: none;">
    <img id="arrowLeft" src="assets/images/arrow-left.png">
    <div id="mask-list">
      <ul>
        <li class="selected-mask">
          <img id="glassesImage" src="${this.seletedimage}" class="full-mask draggable-mask"
               data-mask-type="eye"
               data-scale-width="1.1"
               data-scale-height=".3"
               data-top-adj=".18"
               data-left-adj="${leftAdj}">
        </li>
      </ul>
    </div>
    <img id="arrowRight" src="assets/images/arrow-right.png">
  </div>
</div>

<div class="md-overlay"></div>
`;

    this.modelImageHTML = this.sanitizer.bypassSecurityTrustHtml(imageHtml);
  }


  async initializeFaceGlassVideo() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const unsafeHtml = ` 
      <style>
      /* Adjustments to make the resizable div */
      .example-container {
          border: 1px solid #ccc;
          resize: horizontal; /* Allow horizontal resizing */
          overflow: hidden; /* Enable scrolling if content overflows */
          min-width: 200px; /* Minimum width */
        }
    
        .example-container a-scene {
          width: 100% ; /* Make sure the scene fills the container */
          height: 500px ; /* Set scene height to fill the viewport */
        }
      </style>

      <a-scene mindar-face embedded color-space="sRGB" renderer="colorManagement: true, physicallyCorrectLights" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
      <a-assets>
        <a-asset-item id="headModel" src="assets/images/headOccluder.glb"></a-asset-item>
        <a-asset-item id="glassesModel" src="${this.modelSrc}"></a-asset-item>
      </a-assets>
      <a-camera fov="80" position="0 1.6 0"></a-camera>
  <!-- head occluder -->
      <a-entity  mindar-face-target="anchorIndex: 168">
    <a-gltf-model mindar-face-occluder position="0 -0.3 0.15"rotation="0 0 0" scale="0.065 0.065 0.065" src="#headModel"></a-gltf-model>
      </a-entity>
      <a-entity mindar-face-target="anchorIndex: 168">
    <a-gltf-model mindar-controls="none" rotation="0 0 0" position="0 -.08 0" scale=".78 .78 .78" src="#glassesModel" class="glasses1-entity" ></a-gltf-model>
      </a-entity>
    </a-scene>
    `
      this.modelHTML = this.sanitizer.bypassSecurityTrustHtml(unsafeHtml);
      this.cameraDetact = this.greenIcon;
      console.log('Camera Found')
      setTimeout(() => {
        document.querySelector('a-scene').addEventListener("targetFound", event => {
          this.faceDetact = this.greenIcon;
          if (this.seletedimage == '') {
            this.facedetectbool = true;
          }
          else {
            this.facedetectbool = false;
          }
        });
        document.querySelector('a-scene').addEventListener("targetLost", event => {
          this.faceDetact = this.redIcon;
        });

      }, 0);

    } catch (error) {
      // Handle errors
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        const unsafeHtml = ``
        this.modelHTML = this.sanitizer.bypassSecurityTrustHtml(unsafeHtml);
        this.facedetectbool = false;
        console.error('Camera not found:', error.message);
        this.cameraDetact = this.redIcon;
        // Display an error message to the user or take appropriate action
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        console.error('Camera permission denied:', error.message);
        this.cameraDetact = this.yellowIcon;
        this.facedetectbool = false;
        // Prompt the user to allow camera access or take appropriate action
      } else {
        console.error('Error accessing the camera:', error.message);
        // Display a generic error message or take appropriate action
      }
    }
  }

  initDraggableGlasses() {
    const glasses = document.getElementById('mask_0') as HTMLElement | null;
    if (!glasses) return;

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    glasses.style.cursor = 'grab';

    // ---- Mouse Events ----
    glasses.addEventListener('mousedown', (e: MouseEvent) => {
      isDragging = true;
      const rect = glasses.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      glasses.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (!isDragging) return;
      const parentRect = glasses.parentElement!.getBoundingClientRect();
      const newLeft = e.clientX - parentRect.left - offsetX;
      const newTop = e.clientY - parentRect.top - offsetY;
      glasses.style.left = `${newLeft}px`;
      glasses.style.top = `${newTop}px`;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        glasses.style.cursor = 'grab';
        isDragging = false;
      }
    });

    // ---- Touch Events ----
    glasses.addEventListener('touchstart', (e: TouchEvent) => {
      isDragging = true;
      const rect = glasses.getBoundingClientRect();
      offsetX = e.touches[0].clientX - rect.left;
      offsetY = e.touches[0].clientY - rect.top;
      e.preventDefault();
    });

    window.addEventListener('touchmove', (e: TouchEvent) => {
      if (!isDragging) return;
      const parentRect = glasses.parentElement!.getBoundingClientRect();
      const touch = e.touches[0];
      const newLeft = touch.clientX - parentRect.left - offsetX;
      const newTop = touch.clientY - parentRect.top - offsetY;
      glasses.style.left = `${newLeft}px`;
      glasses.style.top = `${newTop}px`;
    });

    window.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
      }
    });
  }


  onFileSelected(event: any): void {
    // Select the image element by its ID
    const imgElement = document.getElementById('mask_0') as HTMLImageElement;
    if (imgElement) {
      // Hide the image by setting its display property to 'none'
      imgElement.style.display = 'none';
    } else {
      // console.error('Image element not found');
    }

    const file: File = event.target.files[0];
    if (file) {
      this.readFile(file);
      setTimeout(() => {
        this.startFacemask()
      }, 1000)

      setTimeout(() => {
        if (imgElement) {
          imgElement.style.display = 'block';

        }
      }, 1500);
    }
    // this.imageUrl = 'assets/images/uttar.png';
    // setTimeout(()=>{
    //   this.startFacemask()
    // },2000)
  }

  startFacemask() {
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

      const myImageElement = document.getElementById('faces') as HTMLImageElement | null;
      if (myImageElement && this.imageUrl) {
        myImageElement.style.display = 'block';
        myImageElement.src = String(this.imageUrl); // ✅ Only access src if element is found
      } else {
        console.warn('Image element #faces not found when reading file.');
      }

      this.canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
      this.imageElement = document.getElementById('faces') as HTMLImageElement;
      this.selectedMask = document.querySelector(".selected-mask img") as HTMLImageElement;

      const eyeImageElement = document.getElementById('mask_0') as HTMLImageElement;
      if (eyeImageElement) {
        eyeImageElement.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  }

  async main() {
    this.fmesh = await facemesh.load({ maxFaces: 1 });
    // Set up front-facing camera
    await this.setupCamera();
    let videoWidth = this.video.videoWidth;
    let videoHeight = this.video.videoHeight;
    this.video.play()

    // HTML Canvas for the video feed
    this.canvas = document.getElementById('facecanvas') as HTMLCanvasElement;
    this.canvas.width = videoWidth;
    this.canvas.height = videoHeight;
    this.ctx = this.canvas.getContext('2d');
    this.loaderShow = false;
    this.drawVideo();
    this.renderPrediction();
  }


  async setupCamera(): Promise<HTMLVideoElement> {
    this.video = document.getElementById('video') as HTMLVideoElement;
    const stream = await navigator.mediaDevices.getUserMedia({
      'audio': false,
      'video': {
        facingMode: 'user',
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    });
    this.video.srcObject = stream;

    return new Promise<HTMLVideoElement>((resolve) => {
      this.video.onloadedmetadata = () => {
        resolve(this.video);
      };
    });
  }

  drawVideo() {
    this.ctx.drawImage(this.video, 0, 0);
    this.animationFrameVideoId = requestAnimationFrame(this.drawVideo.bind(this));
  }

  async renderPrediction() {
    this.ctx.stroke();
    let facepred = await this.fmesh.estimateFaces(this.canvas);
    if ((facepred.length > 0) && (facepred[0].faceInViewConfidence > 0.9)) { // If we find a face, process it
      this.facePostion = this.greenIcon
      this.drawMaskAR = false;
      setTimeout(() => {
        this.initializeFaceGlassVideo();
        this.isFaceDetect = true;
        this.acanvas = document.querySelector('.a-canvas') as HTMLCanvasElement;

      }, 5000);

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.curFaces = facepred;
    }
    if (this.drawMaskAR) {
      if (this.mindaroverlay) {
        this.mindaroverlay.style.display = 'none';
      }
      this.animationFrameFaceId = requestAnimationFrame(this.renderPrediction.bind(this));
    } else {
      this.trackMovement();
    }
  };

  async trackMovement() {
    const predictions = await this.fmesh.estimateFaces(this.video);

    if (predictions.length > 0) {
      const noseLandmark = predictions[0].annotations.noseTip; // Get nose landmark
      const currentNosePosition = [noseLandmark[0][0], noseLandmark[0][1]]; // Extract x, y coordinates

      if (this.prevNosePosition) {
        let distance = Math.sqrt(
          Math.pow(currentNosePosition[0] - this.prevNosePosition[0], 2) + Math.pow(currentNosePosition[1] - this.prevNosePosition[1], 2)
        )
        this.totalDistance += distance;

        // Calculate time elapsed since the last frame
        const currentTime = Date.now();
        const deltaTime = this.prevFrameTime ? (currentTime - this.prevFrameTime) / 1000 : 0; // Convert to seconds
        this.prevFrameTime = currentTime;
        const speed = distance / deltaTime; // Calculate speed (distance per second)
        if (speed > this.MAX_SPEED) {
          this.lookStraght = this.redIcon;
          if (this.acanvas) {
            this.acanvas.style.display = 'none';
          }
        }
        else {
          this.lookStraght = this.greenIcon;

          if (this.acanvas) {
            this.acanvas.style.display = 'block';
          }
        }
      } else {
        this.prevNosePosition = currentNosePosition;
      }
    }

    this.animationFrameCanvasId = requestAnimationFrame(this.trackMovement.bind(this)); // Continuously track movement
  }


  async startFaceMask(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      document.querySelector(".loading")?.classList.remove('d-none');
      if (this.model == null) {
        this.model = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);
        console.log("model loaded");
        this.cameraFrame = await this.detectFaces();
        document.querySelector(".loading")?.classList.add('d-none');
        this.initDraggableGlasses(); // Initialize draggable glasses after showing the image
        resolve();
      } else if (!this.isVideo) {
        this.cameraFrame = await this.detectFaces();
        document.querySelector(".loading")?.classList.add('d-none');
        this.initDraggableGlasses(); // Initialize draggable glasses after showing the image
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
    console.log('predictions ', predictions)
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
          this.canvasElement.appendChild(maskElement);
          this.isGlassReady = true;
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
          this.isGlassReady = true;
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

        maskSizeAdjustmentLeft = parseFloat(this.selectedMask.getAttribute("data-left-adj") || '0');

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
  modeChage(modename: any) {
    this.mode = modename;
    if (this.mode == 'image') {
      let localImage = localStorage.getItem('storedSelfie');
      if (localImage) {
        this.onSelfieCaptured(localImage)
      }
      else {
        this.showHelp = true;
      }
    }
  }

  dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }



  openModal() {
    console.log('this.image3d ===============', this.image3d);
    this.modelSrc = this.image3d.Threed_Tryon;
    this.seletedimage = this.image3d.Twod_Tryon;
    if (this.modelSrc == '') {
      this.mode = 'image'
      this.facedetectbool = false;
    }
    else {
      // this.main();
      // Split the URL by '/'
      const parts = this.image3d.Threed_Tryon.split('/');
      // Get the last part (filename)
      const filename = parts[parts.length - 1];
      let fulliframeURL = this.iframeBaseLink + filename;
      this.iframeLink = this.sanitizer.bypassSecurityTrustResourceUrl(fulliframeURL);

    }
    if (this.seletedimage == '') {
      this.mode = 'video'
      this.facedetectbool = true;
      // Split the URL by '/'
      const parts = this.image3d.Threed_Tryon.split('/');
      // Get the last part (filename)
      const filename = parts[parts.length - 1];
      let fulliframeURL = this.iframeBaseLink + filename;
      this.iframeLink = this.sanitizer.bypassSecurityTrustResourceUrl(fulliframeURL);
    }
    else {
      this.initializeFaceGlassImage();
      let localImage = localStorage.getItem('storedSelfie');
      if (localImage) {
        this.onSelfieCaptured(localImage)
      }
    }
    this.modalOpen = true;


    if (isPlatformBrowser(this.platformId)) {
      this.modalService.open(this.view3D, {
        size: 'md',
        ariaLabelledBy: 'view3d-modal',
        centered: true,
        windowClass: 'view3D'
      }).result.then((result) => {
        console.log(`Result: ${result}`);
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }
  }


  private getDismissReason(reason: any): string {
    this.router.navigateByUrl('settings-header', { skipLocationChange: true }).then(() => {
      this.router.navigate([this.returnUrl]);
    })
    this.modelHTML = '';
    this.imageUrl = '';
    this.modelImageHTML = '';
    this.mode = 'video';
    cancelAnimationFrame(this.animationFrameCanvasId)
    cancelAnimationFrame(this.animationFrameFaceId)
    cancelAnimationFrame(this.animationFrameVideoId)
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  onSelfieCaptured(selfieDataUrl: string) {
    // Save selfie to localStorage
    localStorage.setItem('storedSelfie', selfieDataUrl);

    // Convert base64 to File and read
    const file = this.dataURLtoFile(selfieDataUrl, `selfie-${Date.now()}.png`);
    this.readFile(file);

    this.imageUrl = selfieDataUrl;
    this.showFaceCapture = false;

    // Wait until Angular updates DOM and image appears
    setTimeout(() => {
      const imgElement = document.getElementById('mask_0') as HTMLImageElement;
      const facesImg = document.getElementById('faces') as HTMLImageElement;

      if (imgElement) imgElement.style.display = 'none';

      if (facesImg) {
        facesImg.onload = () => {
          if (imgElement) imgElement.style.display = 'block';
          this.startFacemask(); // Only start when image is ready
        };

        // Trigger onload if image already cached
        const src = facesImg.src;
        facesImg.src = '';
        facesImg.src = src;
      } else {
        // If not found, fallback
        this.startFacemask();
      }
    }, 50); // slight delay to let DOM render
  }



  retakeSelfie() {
    this.imageUrl = null;
    this.showFaceCapture = true; // Show again to restart camera 
    const myImageElement = document.getElementById('faces') as HTMLImageElement;
    if (myImageElement) {
      myImageElement.style.display = 'none';
    }
    const eyeImageElement = document.getElementById('mask_0') as HTMLImageElement;
    if (eyeImageElement) {
      eyeImageElement.style.display = 'none';
    }
  }

  ngOnDestroy() {
    this.unregisterCustomARSystem();
    // this.router.navigateByUrl('settings-header', { skipLocationChange: true }).then(() => {
    //   this.router.navigate([this.returnUrl]);
    // })
    if (this.modalOpen) {
      this.modalService.dismissAll();
      this.imageUrl = '';
      this.mode = 'video';
      this.modelHTML = '';
      this.modelImageHTML = '';
      cancelAnimationFrame(this.animationFrameCanvasId)
      cancelAnimationFrame(this.animationFrameFaceId)
      cancelAnimationFrame(this.animationFrameVideoId)
    }

  }

}


