import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-video-mode',
  templateUrl: './video-mode.component.html',
  styleUrls: ['./video-mode.component.scss']
})
export class VideoModeComponent implements OnInit, AfterViewInit {
  modelSrc: string | ArrayBuffer | null = null;
  modelHTML: any
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef<HTMLDivElement>;
  constructor(private sanitizer: DomSanitizer, private renderer: Renderer2) {
  }
  ngOnInit(): void {
    console.log('Video Mode Container');
    this.modelSrc = localStorage.getItem('productglb');
    this.initializeAR();
  }


  async initializeAR() {
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
          height: 100vh ; /* Set scene height to fill the viewport */
        }
      </style>

      <a-scene mindar-face embedded color-space="sRGB" renderer="colorManagement: true, physicallyCorrectLights" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
      <a-assets>
        <a-asset-item id="headModel" src="assets/images/headOccluder.glb"></a-asset-item>
        <a-asset-item id="glassesModel" src="${this.modelSrc}"></a-asset-item>
      </a-assets>
      <a-camera fov="80" position="0 1.6 0"></a-camera>
  <!-- head occluder -->
      <a-entity mindar-face-target="anchorIndex: 168">
    <a-gltf-model  position="0 -0.3 0.15"rotation="0 0 0" scale="0.065 0.065 0.065" src="#headModel"></a-gltf-model>
      </a-entity>
      <a-entity mindar-face-target="anchorIndex: 168">
    <a-gltf-model mindar-controls="none" rotation="0 -0 0" position="0 -.1 0" scale=".80 .80 .80" src="#glassesModel" class="glasses1-entity" ></a-gltf-model>
      </a-entity>
    </a-scene>

    `

      this.modelHTML = this.sanitizer.bypassSecurityTrustHtml(unsafeHtml);

      console.log('Camera Found')
    } catch (error) {
      // Handle errors
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        const unsafeHtml = ``
        this.modelHTML = this.sanitizer.bypassSecurityTrustHtml(unsafeHtml);
        console.error('Camera not found:', error.message);
        // Display an error message to the user or take appropriate action
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        console.error('Camera permission denied:', error.message);
        // Prompt the user to allow camera access or take appropriate action
      } else {
        console.error('Error accessing the camera:', error.message);
        // Display a generic error message or take appropriate action
      }
    }
  }


  ngAfterViewInit(): void {
    // setTimeout(() => {
    //   this.addDynamicStyles();
    // }, 100); // Adjust the delay time as needed
  }


  addDynamicStyles(): void {
    if (this.contentContainer && this.contentContainer.nativeElement) {
      console.log('Container found');
      const container = this.contentContainer.nativeElement;
      this.renderer.setStyle(container, 'border', '1px solid #ccc');
      this.renderer.setStyle(container, 'resize', 'horizontal');
      this.renderer.setStyle(container, 'overflow', 'auto');
      this.renderer.setStyle(container, 'min-width', '200px');

      const styles = `
        .example-container .example-scene a-scene {
          width: 100% !important; /* Make sure the scene fills the container */
          height: 100vh !important; /* Set scene height to fill the viewport */
        }
      `;
      const styleElement = this.renderer.createElement('style');
      styleElement.type = 'text/css';
      styleElement.appendChild(this.renderer.createText(styles));
      this.renderer.appendChild(container, styleElement);

      console.log('Dynamic styles added');
    } else {
      console.log('Container not found');
    }
  }

}
