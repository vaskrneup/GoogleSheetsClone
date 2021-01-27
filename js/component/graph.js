import {Modal} from "./modal.js";


class Graph {
    constructor(xValues, yValues, xAxisLabel, yAxisLabel, width, height) {
        this.xValues = xValues;
        this.yValues = yValues;

        this.xAxisLabel = xAxisLabel;
        this.yAxisLabel = yAxisLabel;

        this.width = width;
        this.height = height;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.transform(1, 0, 0, -1, 0, this.height);
    }

    createGrid(size) {

    }

    _render = () => {
        this.createGrid();
    }

    render = () => {
        this._render();
    }
}


export class DotGraph extends Graph {
    constructor(xValues, yValues, xAxisLabel, yAxisLabel, dotSize = 2, width = 500, height = 400) {
        super(xValues, yValues, xAxisLabel, yAxisLabel, width, height);

        this.dotSize = dotSize;
        this.modal = new Modal();
    }

    drawDots = () => {
        const xAxisGap = (this.width - 10) / Math.max(...this.xValues);
        const yAxisGap = (this.height - 10) / Math.max(...this.yValues);

        for (let i = 0; i < this.xValues.length; i++) {
            this.ctx.beginPath();
            this.ctx.arc(this.xValues[i] * (xAxisGap), this.yValues[i] * yAxisGap, this.dotSize, 0, 2 * Math.PI);
            this.ctx.stroke();
            this.ctx.fill();
            this.ctx.closePath();
        }
    }

    render = () => {
        this._render();

        this.drawDots();

        this.modal.addModelBody(this.canvas);
        this.modal.addStyles({
            backgroundColor: 'white',
            border: '1px solid black',
            boxShadow: '3px 3px 10px black',
            width: this.width + 'px',
            height: this.height + 'px',
        });
        this.modal.compileStyles();
        this.modal.show();
    }
}
