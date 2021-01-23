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

    compileStyles = () => {
        Object.keys(this.styles).forEach(style => {
            this.cell.style[style] = this.styles[style];
        });
    }

    setDefaultStyles = () => {
        this.addStyles({
            minHeight: '20px',
            fontSize: '16px'
        })
    }

    classifyAsTextOrNot = (e) => {
        const currentValueAsNumber = Number(e.target.value);

        if (currentValueAsNumber) {
            this.addStyles({textAlign: 'right'})
            this.value = currentValueAsNumber;
        } else {
            this.value = e.target.value;
            this.removeStyles(['textAlign'])
        }

        this.compileStyles();
    }

    addEventListeners = () => {
        this.cell.addEventListener('change', this.classifyAsTextOrNot);
        this.cell.addEventListener('focus', () => document.dispatchEvent(this.positionChangeEvent));
    }

    render = () => {
        this.setDefaultStyles();

        this.cell.id = this.xAxis + this.yAxis;
        this.cell.classList.add('cell');
        this.compileStyles();
    }
}