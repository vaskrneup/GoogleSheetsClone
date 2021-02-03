import {Modal} from "./modal.js";


class Graph {
    /**
     * Base class for creating graph.
     *
     * @param {Array} [xValues]             Array of values to plot in X axis.
     * @param {Array} [yValues]             Array of values to plot in Y axis.
     * @param {string} [xAxisLabel]           Label to be displayed in X axis.
     * @param {string} [yAxisLabel]           Label to be displayed in Y axis.
     * @param {number} [width]                Width of the Graph.
     * @param {number} [height]               Height of the Graph.
     * @param {number} [padding]              Padding of the Graph, The width and height remains the same.
     */
    constructor(xValues, yValues, xAxisLabel, yAxisLabel, width, height, padding = 50) {
        this.xValues = xValues;
        this.yValues = yValues;

        this.xAxisLabel = xAxisLabel || '';
        this.yAxisLabel = yAxisLabel || '';

        this.width = width;
        this.height = height;

        this.padding = padding;
        this.numberOfValuesInXAxis = 12;
        this.numberOfValuesInYAxis = 9;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.closePath();
        this.ctx.moveTo(0, 0);
        this.ctx.restore();
    }

    /**
     * Sets value of xAxis values and yAxis values.
     *
     * @param {Array} x             Array of values top plot in X axis.
     * @param {Array} y             Array of values top plot in Y axis.
     * */
    setValues = (x, y) => {
        this.xValues = x;
        this.yValues = y;
    }

    /**
     * Labels to be displayed in x and y axis.
     *
     * @param {string} xLabel               Label to display in X axis.
     * @param {string} yLabel               Label to display in Y axis.
     * */
    setLabels = (xLabel, yLabel) => {
        this.xAxisLabel = xLabel;
        this.yAxisLabel = yLabel;
    }

    /**
     * Writes labels to the X and Y axis, will be used internally.
     * */
    writeLabels = () => {
        this.ctx.restore();
        // For X Axis !!
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.xAxisLabel, this.width / 2, this.height - 5);

        // For Y Axis !!
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.translate(0, this.height);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.yAxisLabel, this.height / 2, 10);
        this.ctx.restore();
    }

    /**
     * Writes Value range in X and Y axis, will be used internally.
     * */
    writeAxisValues = () => {
        const yStep = (this.height - this.padding * 2) / this.numberOfValuesInYAxis;
        const xStep = (this.width - this.padding * 2) / this.numberOfValuesInXAxis;

        const xValue = Math.max(...this.xValues) / this.numberOfValuesInXAxis;
        const yValue = Math.max(...this.yValues) / this.numberOfValuesInYAxis;

        let yCount = this.padding;
        let xCount = this.padding;

        this.ctx.textAlign = 'center';
        this.ctx.fillText('0', this.padding - 5, this.height - this.padding + 5);

        for (let y = this.numberOfValuesInYAxis; y > 0; y--) {
            this.ctx.fillText((y * yValue).toFixed(1).toString(), 27, yCount);
            yCount += yStep;
        }

        for (let x = 1; x <= this.numberOfValuesInXAxis; x++) {
            this.ctx.fillText((x * xValue).toFixed(1).toString(), xCount + this.padding, this.height - 40);
            xCount += xStep;
        }

        this.ctx.restore();
    }

    /**
     * Writes line in X and Y axis, will be used internally.
     * */
    drawAxisLines = () => {
        // Y Axis !!
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, this.padding);
        this.ctx.lineTo(this.padding, this.height - this.padding);

        // X Axis !!
        this.ctx.lineTo(this.width - this.padding, this.height - this.padding);
        this.ctx.stroke();
        this.ctx.closePath();
    }

    /**
     * Run all the above functions for creating basic requirements of graph.
     * Works as super().render() for particular function for inheriting classes.
     * */
    _render = () => {
        this.writeLabels();
        this.writeAxisValues();
        this.drawAxisLines();

        this.modal.addModelBody(this.canvas);
        this.modal.addStyles({
            width: this.width + 'px',
            height: this.height + 'px',
        });
        this.modal.compileStyles();
        this.modal.show();
    }

    /**
     * Renders all the required objects to display graph.
     */
    render = () => {
        this._render();
    }
}


export class DotGraph extends Graph {
    /**
     * class for creating dot graph.
     *
     * @param {Array} [xValues]             Array of values to plot in X axis.
     * @param {Array} [yValues]             Array of values to plot in Y axis.
     * @param {string} [xAxisLabel]         Label to be displayed in X axis.
     * @param {string} [yAxisLabel]         Label to be displayed in Y axis.
     * @param {number} [dotSize]              Size of dots in graph.
     * @param {number} [width]                Width of the Graph.
     * @param {number} [height]               Height of the Graph.
     * @param {number} [padding]              Padding of the Graph, The width and height remains the same.
     */
    constructor(xValues, yValues, xAxisLabel, yAxisLabel, dotSize = 1, width = 720, height = 480, padding) {
        super(xValues, yValues, xAxisLabel, yAxisLabel, width, height, padding);

        this.dotSize = dotSize;
        this.modal = new Modal({padding: '0'});
    }

    /**
     * Draws dot in graph using xValues and yValues.
     */
    drawDots = () => {
        this.ctx.save();
        this.ctx.transform(1, 0, 0, -1, 0, this.height);

        const xAxisGap = (this.width - this.padding * 2 - this.dotSize) / Math.max(...this.xValues);
        const yAxisGap = (this.height - this.padding * 2 - this.dotSize) / Math.max(...this.yValues);
        const shift = this.padding + this.dotSize;

        for (let i = 0; i < this.xValues.length; i++) {
            this.ctx.beginPath();
            this.ctx.arc(
                (this.xValues[i] * (xAxisGap)) + shift, (this.yValues[i] * yAxisGap) + shift,
                this.dotSize, 0, 2 * Math.PI
            );
            this.ctx.stroke();
            this.ctx.fill();
            this.ctx.closePath();
        }

        this.ctx.restore();
    }
    /**
     * Renders all the required objects to display graph.
     */
    render = () => {
        this.drawDots();

        this._render();
    }
}


export class LineGraph extends Graph {
    /**
     * class for creating dot graph.
     *
     * @param {Array} [xValues]             Array of values to plot in X axis.
     * @param {Array} [yValues]             Array of values to plot in Y axis.
     * @param {string} [xAxisLabel]         Label to be displayed in X axis.
     * @param {string} [yAxisLabel]         Label to be displayed in Y axis.
     * @param {number} lineSize             width of line in graph.
     * @param {number} width                Width of the Graph.
     * @param {number} height               Height of the Graph.
     * @param {number} [padding]            Padding of the Graph, The width and height remains the same.
     */
    constructor(xValues, yValues, xAxisLabel, yAxisLabel, lineSize = 1, width = 720, height = 480, padding) {
        super(xValues, yValues, xAxisLabel, yAxisLabel, width, height, padding);

        this.lineSize = lineSize;
        this.modal = new Modal({padding: '0'});
    }

    /**
     * Draws lines in graph using xValues and yValues.
     */
    drawLines = () => {
        this.ctx.save();
        this.ctx.transform(1, 0, 0, -1, 0, this.height);

        const xAxisGap = (this.width - this.padding * 2 - this.lineSize) / Math.max(...this.xValues);
        const yAxisGap = (this.height - this.padding * 2 - this.lineSize) / Math.max(...this.yValues);
        const shift = this.padding + this.lineSize;

        this.ctx.beginPath();
        for (let i = 0; i < this.xValues.length; i++) {
            this.ctx.lineTo(
                (this.xValues[i] * (xAxisGap)) + shift, (this.yValues[i] * yAxisGap) + shift,
            );
        }
        this.ctx.stroke();
        this.ctx.closePath();


        this.ctx.restore();
    }

    /**
     * Renders all the required objects to display graph.
     */
    render = () => {
        this.drawLines();

        this._render();
    }
}
