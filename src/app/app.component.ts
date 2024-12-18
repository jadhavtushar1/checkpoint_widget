import { Component, ElementRef, HostListener, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormArray, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChild("inner", { static: false }) inner: ElementRef;
  @ViewChild("route", { static: false }) route: ElementRef;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  checkpointGroup: UntypedFormGroup[] = []
  element
  private isDragging = false;
  private currentDraggingIndex = -1;
  private offsetX = 0;
  private offsetY = 0;
  fix_height: number = 70
  parentHeight = 600;
  parentWidth = 500;
  backgroundurl;
  routeurl;
  payload;
  isPreviewOpen:boolean=false


  constructor(private formdata: UntypedFormBuilder, private cdr: ChangeDetectorRef) { }
  ngOnInit() { 
    this.handleAddMore()
  }

  handleSizeChange(event, i: any) {
    const currentFormGroup = this.checkpointGroup[i];
    const heights = this.route.nativeElement.offsetHeight;
    currentFormGroup.patchValue({
      height: event.target.value,
      heightPerc:(event.target.value / heights) * 100

    })
    this.cdr.detectChanges();
  }

  handleDelete(i: number) {
    this.checkpointGroup.splice(i, 1)

  }
  handleHeight(e: Event) {
    const target = e.target as HTMLInputElement;
    this.parentHeight = Number(target.value);
  }

  handleWidth(e: Event) {
    const target = e.target as HTMLInputElement;
    this.parentWidth = Number(target.value);
  }


  onMouseDown(event: MouseEvent, index: number): void {
    this.isDragging = true;
    this.currentDraggingIndex = index;

    const currentFormGroup = this.checkpointGroup[index];
    const left = currentFormGroup.get('left').value;
    const top = currentFormGroup.get('top').value;

    this.offsetX = event.clientX - left;
    this.offsetY = event.clientY - top;

    document.body.style.userSelect = 'none';
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging && this.currentDraggingIndex !== -1) {
      const newLeft = event.clientX - this.offsetX;
      const newTop = event.clientY - this.offsetY;
      const height = this.route.nativeElement.offsetHeight;
      const width = this.route.nativeElement.offsetWidth;

      const currentFormGroup = this.checkpointGroup[this.currentDraggingIndex];
      currentFormGroup.patchValue({
        left: newLeft,
        top: newTop,
        topPerc: (newTop / height) * 100,
        leftPerc: (newLeft / width) * 100,
      });

      this.cdr.detectChanges();
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isDragging = false;
    this.currentDraggingIndex = -1;
    document.body.style.userSelect = 'auto';
  }
  handleRouteChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const backgroundImageUrl = e.target.result;
        this.routeurl = backgroundImageUrl
        this.route.nativeElement.style.backgroundImage = `url(${this.routeurl})`;
      };
      reader.readAsDataURL(file);
    }
  }

  handleFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const backgroundImageUrl = e.target.result;
        this.backgroundurl = backgroundImageUrl
        this.inner.nativeElement.style.backgroundImage = `url(${this.backgroundurl})`;
      };
      reader.readAsDataURL(file);
    }
  }
  
  handleSubmit() {

    this.isPreviewOpen=!this.isPreviewOpen
    let checkpointdata = [];
    for (let i = 0; i < this.checkpointGroup.length; i++) {
      const { 
        height:native,
        image: checkpointImage, 
        topPerc: checkpointTopPercentage, 
        leftPerc: checkpointLeftPercentage,
        } = this.checkpointGroup[i].value;
        const heights = this.route.nativeElement.offsetHeight;
        let checkpointHeightPercentage=(native/ heights) * 100
      checkpointdata.push({  checkpointImage, checkpointTopPercentage, checkpointLeftPercentage ,checkpointHeightPercentage});
    }
    this.payload = {
      aspectRatio: `${this.parentHeight}/${this.parentWidth}`,
      background_image: this.backgroundurl,
      route: this.routeurl,
      checkpoints: checkpointdata
    }

  }

  handlebackgroundImage(event:any,i){
    const target = event.target as HTMLInputElement;
    
    const file = target.files[0];
    if (file) {

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const backgroundImageUrl = e.target.result;

        this.checkpointGroup[i].patchValue({image:backgroundImageUrl})
        
      };
      reader.readAsDataURL(file);
    }

    this.cdr.detectChanges();
  }
  handleAddMore() {
 
    const form = this.formdata.group({
      image: [''],
      top: [0],
      left: [0],
      height: [70],
      width: [0],
      topPerc: [0],
      leftPerc: [0],
      isDragging: [false],
      heightPerc:[this.fix_height],
      children: this.formdata.array([])
     
    });
    this.checkpointGroup.push(form);
  }
  handleCheckpointElement(i){
  
    const form = this.formdata.group({
      image: [''],
      top: [0],
      left: [0],
      height: [70],
      width: [0],
    });
    
    const childrenArray = this.checkpointGroup[i].get('children') as FormArray;
    childrenArray.push(form)
    
  }

}
