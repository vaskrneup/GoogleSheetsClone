import {BaseComponent} from "./baseComponent.js";


export class Cell extends BaseComponent {
    constructor(xAxis, yAxis, styles) {
        super(styles);

        this.xAxis = xAxis;
        this.yAxis = yAxis;

        this.value = '';
    }
    
    render = () => {
        return `<input id="${this.xAxis + this.yAxis}" class="cell" value="${this.value}" style="${this.styles}">`
    }
}