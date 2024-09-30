import { ChangeDetectionStrategy, Component, HostListener, Input } from '@angular/core';
import { Spice } from '../spice';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-spice-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './spice-button.component.html',
  styleUrl: './spice-button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: SpiceButtonComponent,
    },
  ],
})
export class SpiceButtonComponent implements ControlValueAccessor {
    @Input() spice!: Spice;
    

    onChange: OnChangeFn<string> = () => {this.spice.name};
    onTouch: onTouchFn = () => {};
    onToggle(){
      this.pressed = !this.pressed;
      console.log(this.spice.name);
      this.onChange(this.spice.name);
    }
    pressed = false;
    disabled = false;
    //ControlValueAccessor
    writeValue(value: boolean): void {
        if (value === null) return;
        this.pressed = !!value;
    }
    registerOnChange(fn: OnChangeFn<string>): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: onTouchFn): void {
        this.onTouch = fn;
    }
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
    @HostListener("focusout")
      onFocusOut(){
        this.onTouch;
      }
}
type OnChangeFn<t> = (value: t) => void;
type onTouchFn = () => void;
