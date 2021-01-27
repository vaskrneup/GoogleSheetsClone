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

    render = () => {
        this._render();

        for (let i = 0; i < this.xValues.length; i++) {
            this.ctx.fillRect(this.xValues[i] * 10, this.yValues[i] * 10, 3, 3);
            this.ctx.stroke();
        }

        this.modal.addModelBody(this.canvas);
        this.modal.show();
    }
}
