import { Degrees, Radians } from "../ComplexMath/Angle.class.ts";
import Polar from "../ComplexMath/Polar.class.ts";
import Inspecteable from "../Inspectable.class.ts";

export class Cartesian extends Inspecteable{
  constructor(public x: number, public y: number){
    super();
  }
  toPolar(){
    return new Polar(Math.sqrt(this.x**2 + this.y**2), new Radians(Math.atan(this.y/this.x)));
  }
  toString(){
    return `(${this.x}, ${this.y})`;
  }
  static from(radius: number, angle: Radians | Degrees){
    const angleRad = Radians.from(angle)
    return new Cartesian(radius * Math.cos(angleRad.value), radius * Math.sin(angleRad.value));
  }
}