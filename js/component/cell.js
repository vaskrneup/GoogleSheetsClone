import {BaseComponent} from "./baseComponent.js";


export class Cell extends BaseComponent {
    /**
     * Represents individual input component of the spreadsheet.
     *
     * @param {Number} xAxis        X Axis representation in spreadsheet grid.
     * @param {Number} yAxis        Y Axis representation in spreadsheet grid.
     * @param {{}} [styles]         Initial styles to be applied to the cell.
     * */
    constructor(xAxis, yAxis, styles) {
        super(styles);
        this.cell = document.createElement('textarea');
        this.cell.rows = 1;

        this.xAxis = xAxis;
        this.yAxis = yAxis;

        this.value = '';
        this.formula = '';
        this.hasUsedFormula = false;

        this.dependentCells = [];

        this.positionChangeEvent = new CustomEvent('cellChangedPosition', {
            detail: {
                xAxis: this.xAxis,
                yAxis: this.yAxis
            }
        });

        this.addEventListeners();
    }

    /**
     * Serialize Cell object in JSON format, is eligible to create new cell object with identical property using 'createCellFromJson'.
     * */
    serialize = () => {
        return {
            xAxis: this.xAxis,
            yAxis: this.yAxis,

            value: this.value,
            formula: this.formula,

            styles: this.styles,

            dependentCells: this.dependentCells
        };
    }

    /**
     * Set value of current cell in object. It won't effect the value of cell itself.
     *
     * @param {string|number} value         Value of cell.
     * */
    setValue = (value) => {
        this.value = value;

        if (!this.hasUsedFormula) this.formula = '';
        this.hasUsedFormula = false;
    }

    /**
     * Set formula of current cell.
     *
     * @param {string} formula          Valid formula or mathematical expression, this will be used to calculate value of cell.
     * */
    setFormula = (formula) => {
        this.formula = formula;
        this.hasUsedFormula = true;
    }

    /**
     * If this cell is used for calculating value of other cell that `cell coordinates` will be added to this cell as dependent cell.
     *
     * @param {{}} cell             Coordinates of the dependent cell.
     * */
    addDependentCell = (cell) => {
        if (!this.dependentCellExists(cell)) {
            this.dependentCells.push(cell)
        }
    };

    /**
     * Check if given dependent cell is already added to this cell or not.
     *
     * @param {{}} cell             Coordinates of the dependent cell.
     * */
    dependentCellExists = (cell) => {
        for (let i = 0; i < this.dependentCells.length; i++) {
            if (JSON.stringify(this.dependentCells[i]) === JSON.stringify(cell)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Replaces current style with new styles and updates to DOM.
     * New styles can be set using `addStyles`.
     * */
    compileStyles = () => {
        Object.keys(this.styles).forEach(style => {
            this.cell.style[style] = this.styles[style];
        });
    }

    /**
     *  Adds default styles to modal, is used internally.
     */
    setDefaultStyles = () => {
        this.addStyles({
            ...{
                fontSize: '16px',
            },
            ...this.styles
        });
    }

    /**
     *  Classifies if current value of cell is String or Not and Apply styles accordingly.
     *
     *  @param {Event|{}} e        Event or object having target.value.
     */
    classifyAsTextOrNot = (e) => {
        const currentValueAsNumber = Number(e.target.value);

        if (currentValueAsNumber) {
            this.addStyles({textAlign: 'right'});
            this.setValue(currentValueAsNumber);
        } else {
            this.setValue(e.target.value);
            this.addStyles({textAlign: 'left'});
        }

        this.compileStyles();
    }

    /**
     *  Event listeners will be added here, is used internally.
     */
    addEventListeners = () => {
        this.cell.addEventListener('lastCellUpdated', this.classifyAsTextOrNot);
        this.cell.addEventListener('change', this.classifyAsTextOrNot);

        this.cell.addEventListener('focus', () => document.dispatchEvent(this.positionChangeEvent));
    }

    /**
     *  By default only the DOM object is created, this will compile styles and performs other necessary steps to display cell properly.
     */
    render = () => {
        this.setDefaultStyles();

        this.cell.id = 'cell-' + (this.xAxis.toString() + '-' + this.yAxis.toString());
        this.cell.classList.add('cell');
        this.compileStyles();
    }
}

/**
 * Creates `Cell` object using the data provided by `Cell.serialize`.
 *
 * @param {{}} data         Cell serialized data.
 * */
export const createCellFromJson = (data) => {
    const cell = new Cell(data.xAxis, data.yAxis, data.styles);
    cell.value = data.value;
    cell.formula = data.formula;
    cell.dependentCells = data.dependentCells;
    return cell;
}
