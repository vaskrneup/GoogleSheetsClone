import {BaseComponent} from "./baseComponent.js";


export class Cell extends BaseComponent {
    constructor(xAxis, yAxis, styles) {
        super(styles);
        this.cell = document.createElement('input');

        this.xAxis = xAxis;
        this.yAxis = yAxis;

        this.value = '';

        this.positionChangeEvent = new CustomEvent('cellChangedPosition', {
            detail: {
                xAxis: this.xAxis,
                yAxis: this.yAxis
            }
        });

        this.addEventListeners();
    }

    classifyAsTextOrNot = (e) => {
        const currentValueAsNumber = Number(e.target.value);

        if (currentValueAsNumber) {
            this.cell.classList.add('numeric-text');
            this.value = currentValueAsNumber;
        } else {
            this.value = e.target.value;
            this.cell.classList.remove('numeric-text');
        }
    }

    addEventListeners = () => {
        this.cell.addEventListener('change', this.classifyAsTextOrNot);
        this.cell.addEventListener('focus', () => document.dispatchEvent(this.positionChangeEvent));
    }

    render = () => {
        this.cell.id = this.xAxis + this.yAxis;
        this.cell.classList.add('cell');
        Object.keys(this.styles).forEach(style => {
            this.cell.style[style] = this.styles[style];
        });
    }
}