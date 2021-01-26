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
        while (size) {
            
        }
    }

    render = () => {
        this.createGrid();
    }
}


class DotGraph extends Graph {
    constructor(xValues, yValues, xAxisLabel, yAxisLabel, dotSize = 2, width = 500, height = 400) {
        super(xValues, yValues, xAxisLabel, yAxisLabel, width, height);
        this.dotSize = dotSize;
    }
}
