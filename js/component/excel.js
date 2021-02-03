import {Cell, createCellFromJson} from "./cell.js";
import {DotGraph, LineGraph} from "./graph.js";
import {parseMathSyntax} from "../utils/parser.js";
import {Modal} from "./modal.js";

export class Excel {
    RUN_UNDER_DEVELOPMENT_FEATURES = false;

    NUMBER_OF_NEW_ROWS_TO_APPEND = 10;
    LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    ALLOWED_FORMULA = ['=SUM(', '=AVERAGE(', '=COUNT(', '=MIN(', '=MAX(', '=FILTER_ONLY_STRING(', '=FILTER_ONLY_NUM('];
    AVAILABLE_FONTS = [
        {
            value: 'sans-serif',
            displayName: 'Sans Serif'
        },
        {
            value: 'serif',
            displayName: 'Serif'
        },
        {
            value: 'cursive',
            displayName: 'Cursive'
        },
        {
            value: 'fantasy',
            displayName: 'Fantasy'
        },
        {
            value: 'monospace',
            displayName: 'Monospace'
        },
    ]
    GRAPH_CREATION_FORM = `
        <div class="graph-form-wrapper">
            <h2>Plot Graph from cell data</h2>
            
            <br>
            
            <div>
                <h3>Row or column for X-Axis</h3>
                <label><input class="theme-input-field" type="text" required  id="x-axis-from" placeholder="X axis start cell"></label>
                <label><input class="theme-input-field" type="text" required id="x-axis-to" placeholder="X axis end cell"></label>
                <label><input class="theme-input-field" type="text" id="x-axis-label" placeholder="X axis label"></label>
            </div>
            
            <br>
            
            <div>
                <h3>Row or column for Y-Axis</h3>
                <label><input class="theme-input-field" type="text" required  id="y-axis-from" placeholder="Y axis start cell"></label>
                <label><input class="theme-input-field" type="text" required  id="y-axis-to" placeholder="Y axis end cell"></label>
                <label><input class="theme-input-field" type="text" id="y-axis-label" placeholder="Y axis label"></label>
            </div>
            
            <br>
            
            <div>
                <span class="theme-info">Press 'ESC' key to close the graph.</span>
            </div>
            
            <br>
            
            <div>
                <select id="graph-type-selector">
                    <option value="DOT">Dot Graph</option>
                    <option value="LINE">Line Graph</option>
                </select>
                <input type="button" value="Plot Graph" class="theme-button" id="submit-graph-form">
            </div>
        </div>
    `;

    /**
     * Class For creating Spreadsheet.
     *
     * @param {number} numberOfRows                 Number of rows in spreadsheet.
     * @param {number} numberOfColumns              Number of columns in spreadsheet.
     * @param {string} tableContainerId             spreadsheet container ID.
     * @param {string} backgroundColorPickerId      Cell background color picker ID.
     * @param {string} textColorPickerId            Cell text color picker ID.
     * @param {string} fontSizeInputId              Font size input field ID.
     * @param {string} boldBtnId                    Make text bold button ID.
     * @param {string} italicBtnId                  Make text italic button ID.
     * @param {string} crossedFontBtnId             Make text crossed button ID.
     * @param {string} currentCellDisplayId         Active cell name display ID.
     * @param {string} formulaInputId               Active cell formula showing ID.
     * @param {string} fontSelectorId               Font selector ID.
     * @param {string} graphPlotBtnId               Graph plotting button ID.
     * @param {Array}  grid                         Grid of cells, if provided default grid wont be created.
     */
    constructor(
        numberOfRows, numberOfColumns, tableContainerId,
        backgroundColorPickerId, textColorPickerId, fontSizeInputId,
        boldBtnId, italicBtnId, crossedFontBtnId,
        currentCellDisplayId, formulaInputId, fontSelectorId, graphPlotBtnId, grid
    ) {
        this.numberOfRows = numberOfRows;
        this.numberOfColumns = numberOfColumns;

        this.tableContainerId = tableContainerId;
        this.backgroundColorPickerId = backgroundColorPickerId;
        this.textColorPickerId = textColorPickerId;
        this.fontSizeInputId = fontSizeInputId;
        this.boldBtnId = boldBtnId;
        this.italicBtnId = italicBtnId;
        this.crossedFontBtnId = crossedFontBtnId;
        this.currentCellDisplayId = currentCellDisplayId;
        this.formulaInputId = formulaInputId;
        this.fontSelectorId = fontSelectorId;
        this.graphPlotBtnId = graphPlotBtnId;

        this.backgroundColorPicker = document.getElementById(backgroundColorPickerId);
        this.textColorPicker = document.getElementById(textColorPickerId);
        this.fontSizeInput = document.getElementById(fontSizeInputId);

        this.boldBtn = document.getElementById(boldBtnId);
        this.italicBtn = document.getElementById(italicBtnId);
        this.crossedFontBtn = document.getElementById(crossedFontBtnId);

        this.currentCellDisplay = document.getElementById(currentCellDisplayId);
        this.formulaInput = document.getElementById(formulaInputId);
        this.fontSelector = document.getElementById(fontSelectorId);

        this.graphPlotBtn = document.getElementById(graphPlotBtnId);

        this.tableContainer = document.getElementById(tableContainerId);
        this.tbody = null;

        this.grid = grid || [];

        this.graphManagers = {
            lineGraph: new LineGraph(null, null, 'Number', 'Values'),
            dotGraph: new DotGraph(null, null, 'Number', 'Values'),
        };

        this.lastActiveXAxis = 0;
        this.lastActiveYAxis = 0;

        this.activeXAxis = 0;
        this.activeYAxis = 0;

        this.isEditing = false;
        this.modal = new Modal({});

        this.modalFieldsListenerAdded = false;
        this.isWorkingInExternalInput = false; // To disable key controls when editing non cell fields !!

        this.lastColumnCount = 64;
    }

    /**
     * Serialize Excel object in JSON OR CSV format, is eligible to create new Excel object with identical property using 'createExcelFromJson'.
     * Excel object can be recreated only using JSON serialized data.
     * */
    serialize = (type = 'json') => {
        switch (type) {
            case 'json': {
                return {
                    name: document.getElementById('current-doc-name-input').value,

                    numberOfRows: this.numberOfRows,
                    numberOfColumns: this.numberOfColumns,
                    tableContainerId: this.tableContainerId,
                    backgroundColorPickerId: this.backgroundColorPickerId,
                    textColorPickerId: this.textColorPickerId,
                    fontSizeInputId: this.fontSizeInputId,
                    boldBtnId: this.boldBtnId,
                    italicBtnId: this.italicBtnId,
                    crossedFontBtnId: this.crossedFontBtnId,
                    currentCellDisplayId: this.currentCellDisplayId,
                    formulaInputId: this.formulaInputId,
                    fontSelectorId: this.fontSelectorId,
                    graphPlotBtnId: this.graphPlotBtnId,

                    grids: this.grid.map(row => row.map(cell => cell.serialize()))
                };
            }
            case 'csv': {
                return this.grid.map((row) => {
                    return row.map(cell => {
                        return cell.value;
                    }).join(',');
                }).join('\n');
            }
        }
    }


    /**
     * Handles key presses in the document.
     *
     * @param {any} e          Keydown event.
     */
    handleKeyPress = (e) => {
        if (this.isWorkingInExternalInput) return;

        const handleCommonCommandsOnKeyPress = (x, y) => {
            if (!this.isEditing) {
                this.changeCell(x, y);
                this.showActiveCell();
                this.blurLastCell();
            }
        }

        switch (e.code) {
            case 'ArrowUp': {
                handleCommonCommandsOnKeyPress(this.activeXAxis, this.activeYAxis - 1);
                break;
            }
            case 'ArrowDown': {
                handleCommonCommandsOnKeyPress(this.activeXAxis, this.activeYAxis + 1);
                break;
            }

            case 'ArrowRight': {
                handleCommonCommandsOnKeyPress(this.activeXAxis + 1, this.activeYAxis);
                break;
            }
            case 'ArrowLeft': {
                handleCommonCommandsOnKeyPress(this.activeXAxis - 1, this.activeYAxis);
                break;
            }

            case 'Enter': {
                e.preventDefault();
                if (!this.isEditing) {
                    this.focusCurrentCell();
                } else {
                    this.isEditing = false;

                    if (e.shiftKey) this.changeCell(this.activeXAxis, this.activeYAxis - 1);
                    else this.changeCell(this.activeXAxis, this.activeYAxis + 1);

                    this.showActiveCell();
                    this.blurLastCell();
                }
                break;
            }
            case 'Tab': {
                e.preventDefault();

                this.isEditing = false;

                if (e.shiftKey) this.changeCell(this.activeXAxis - 1, this.activeYAxis);
                else this.changeCell(this.activeXAxis + 1, this.activeYAxis);

                this.showActiveCell();
                this.blurLastCell();

                break;
            }

            default: {
                if (!this.isEditing) {
                    this.focusCurrentCell();
                    this.isEditing = true;
                }
            }
        }
    }

    // CELL NAVBAR RELATED !!
    /**
     * Highlights currently active navbar in both x and y axis.
     */
    showActiveNavbar = () => {
        document.getElementById('col-' + this.activeXAxis).classList.add('active-excel-navbar');
        document.getElementById('row-' + this.activeYAxis).classList.add('active-excel-navbar');

        if (this.lastActiveXAxis !== this.activeXAxis) {
            document.getElementById('col-' + this.lastActiveXAxis).classList.remove('active-excel-navbar');
        }
        if (this.lastActiveYAxis !== this.activeYAxis) {
            document.getElementById('row-' + this.lastActiveYAxis).classList.remove('active-excel-navbar');
        }
    }
    // END CELL NAVBAR RELATED !!

    // CELL RELATED !!
    /**
     * Focuses the current cell.
     */
    focusCurrentCell = () => this.activeCell.cell.focus();

    /**
     * Blurs the last cell.
     */
    blurLastCell = () => this.lastCell.cell.blur();

    /**
     * Highlights active cell and removes highlight from last cell.
     */
    showActiveCell = () => {
        this.lastCell.cell.classList.remove('active-cell');
        this.activeCell.cell.classList.add('active-cell');
    }

    /**
     * Updates name of current cell in cell display.
     */
    updateActiveCellDisplay = () => {
        this.currentCellDisplay.innerText = this.LETTERS[this.activeXAxis] + (this.activeYAxis + 1);
    }

    /**
     * Updates formula bar with current cell formula or value if no formula is used.
     */
    updateFormulaBar = () => {
        this.formulaInput.value = this.activeCell.formula || this.activeCell.value;
    }

    /**
     * Updates numbers of rows if last row is reached.
     */
    updateNumberOfRows = () => {
        if (this.activeYAxis >= this.numberOfRows - 1) this.addNewRows(this.NUMBER_OF_NEW_ROWS_TO_APPEND);
    }

    /**
     * Updates number of columns if last column is reached.
     */
    updateNumberOfColumns = () => {
        if (this.activeXAxis >= this.numberOfColumns - 1) this.addNewColumns();
    }

    /**
     * Changes currently active cell.
     *
     * @param {number} newX         Active cell x axis.
     * @param {number} newY         Active cell y axis.
     */
    changeCell = (newX, newY) => {
        if (!this.isEditing) {
            if (!((newX < 0) || (newX >= this.numberOfColumns) || (newY < 0) || (newY >= this.numberOfRows))) {
                this.lastCell = this.grid[this.activeYAxis][this.activeXAxis];
                this.lastActiveXAxis = this.activeXAxis;
                this.lastActiveYAxis = this.activeYAxis;

                this.activeCell = this.grid[newY][newX];
                this.activeXAxis = newX;
                this.activeYAxis = newY;

                this.activeCell.cell.scrollIntoView({block: "center", inline: "center"});

                this.showActiveNavbar();
                this.updateActiveCellDisplay();
                this.updateFormulaBar();
                this.updateNumberOfRows();
                this.updateNumberOfColumns();
            }
        }
    }
    // END CELL RELATED !!

    // HANDLE EVENTS !!
    /**
     * Handles required steps when cell is focused.
     *
     * @param e
     */
    handleCellClick = (e) => {
        this.isEditing = false; // for saying editing has stopped in last cell !!
        this.changeCell(e.detail.xAxis, e.detail.yAxis);
        this.showActiveCell();
        this.isEditing = true; // for saying editing has started in current cell !!
    }

    /**
     * Handles cell background color change.
     *
     * @param e
     */
    handleCellBackgroundColorChange = (e) => {
        this.activeCell.addStyles({
            backgroundColor: e.target.value
        });
        this.activeCell.compileStyles();
    }

    /**
     * Handles cell text color change.
     *
     * @param e
     */
    handleCellTextColorChange = (e) => {
        this.activeCell.addStyles({
            color: e.target.value
        });
        this.activeCell.compileStyles();
    }

    /**
     * Handles cell font size change.
     *
     * @param e
     */
    handleFontSizeChange = (e) => {
        this.activeCell.addStyles({
            fontSize: e.target.value + 'px'
        });
        this.activeCell.compileStyles();
    }

    /**
     * Handles cell text italic style change.
     */
    handleItalicChange = () => {
        this.activeCell.addStyles({
            fontStyle: this.activeCell.styles.fontStyle === 'italic' ? 'normal' : 'italic',
        });
        this.activeCell.compileStyles();
    }

    /**
     * Handles cell text bold style change.
     */
    handleBoldChange = () => {
        this.activeCell.addStyles({
            fontWeight: this.activeCell.styles.fontWeight === 'bold' ? 'normal' : 'bold',
        });
        this.activeCell.compileStyles();
    }

    /**
     * Handles cell text strike through style change.
     */
    handleStrikeThroughChange = () => {
        this.activeCell.addStyles({
            textDecoration: this.activeCell.styles.textDecoration === 'line-through' ? 'none' : 'line-through',
        });
        this.activeCell.compileStyles();
    }

    /**
     * Handles cell text font change.
     * @param e
     */
    handleFontFamilyChange = (e) => {
        this.activeCell.addStyles({
            fontFamily: e.target.value
        });
        this.activeCell.compileStyles();
    }

    // FOR FORMULA USAGE !!
    /**
     * parses cell value from the given range of cells.
     *
     * @param rawRange          Raw range of the cell including formula.
     * @param onlyNumbers       If true, appends data only if the data is number else all values are appended.
     * @param formulaFor        What formula is used in `rawRange`.
     * @param callback          Callback if the cell value can be appended.
     * @returns {[]}            List of successfully parsed data.
     */
    getCellValuesFromRange = (rawRange, onlyNumbers = true, formulaFor = '=SUM(', callback) => {
        const parsedCoordinates = parseMathSyntax(rawRange, formulaFor);
        const data = [];

        const processIfDataPassesTest = (cell) => {
            if (onlyNumbers) {
                if (typeof cell.value === 'number') {
                    data.push(cell.value);
                    if (callback) callback(cell);
                }
            } else {
                data.push(cell.value);
                if (callback) callback(cell);
            }
        }

        if (parsedCoordinates?.length > 0) {
            if (parsedCoordinates[0].isTwoDigitSum === true) { // for comma separated values !!
                for (let i = 0; i < parsedCoordinates.length; i++) {
                    processIfDataPassesTest(this.grid[parsedCoordinates[i].y][parsedCoordinates[i].x]);
                }
            } else if (parsedCoordinates[0].isTwoDigitSum === false) { // For range of values !!

                if (parsedCoordinates[0].x === parsedCoordinates[1].x) { // For vertical calculations !!
                    for (let i = parsedCoordinates[0].y; i <= parsedCoordinates[1].y; i++) {
                        processIfDataPassesTest(this.grid[i][parsedCoordinates[0].x]);
                    }
                } else if (parsedCoordinates[0].y === parsedCoordinates[1].y) { // For horizontal calculations !!
                    for (let i = parsedCoordinates[0].x; i <= parsedCoordinates[1].x; i++) {
                        processIfDataPassesTest(this.grid[parsedCoordinates[0].y][i]);
                    }
                }

            }
        }

        return data;
    }

    /**
     * Handles the uses of custom formula.
     *
     * @param e             any object or event that contains target.value.
     */
    handleCustomFormulaUsage = (e) => {
        let formula = e.target.value;
        if (formula.startsWith('=')) formula = formula.replace('=', '');
        else return;

        const cells = [];
        const operators = [];
        let currentValue = '';

        for (let i = 0; i < formula.length; i++) {
            let char = formula[i];

            if ('+-*/%^'.includes(char)) {
                if (char === '^') char = '**';
                operators.push(char);

                cells.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }

        cells.push(currentValue);
        const rawCells = cells.map(cell => cell.replace('(', '').replace(')', ''));

        try {
            const parsedData = this.getCellValuesFromRange('=SUM(' + rawCells.join(',') + ')', true, '=SUM(', (cell) => {
                cell.addDependentCell({y: this.lastCell.yAxis, x: this.lastCell.xAxis});
            });

            if (cells.length === parsedData.length) {
                let compiledExpression = '';

                for (let i = 0; i < cells.length; i++) {
                    compiledExpression += cells[i].replace(rawCells[i], parsedData[i]);

                    if (i < cells.length - 1) {
                        compiledExpression += operators[i];
                    }
                }

                const lastCellUpdatedEvent = new Event('lastCellUpdated');
                this.lastCell.setFormula('=' + formula);
                this.lastCell.cell.value = eval(compiledExpression).toString();
                this.lastCell.cell.dispatchEvent(lastCellUpdatedEvent);
            }
        } catch (e) {

        }
    }

    /**
     * Handles uses of any type of formula.
     *
     * @param e
     */
    handleFormulaUsage = (e) => {
        let isPreDefinedFormula = false;

        this.ALLOWED_FORMULA.forEach(formulaFor => {
            if (e.target.value.includes(formulaFor)) {
                isPreDefinedFormula = true;

                if (formulaFor === '=FILTER_ONLY_NUM(') {
                    this.getCellValuesFromRange(e.target.value, false, formulaFor, (cell) => {
                        if (typeof cell.value !== 'number') {
                            cell.setValue('');
                            cell.cell.value = '';
                        }
                    });
                    this.lastCell.setValue('');
                    this.lastCell.cell.value = '';
                    return;
                } else if (formulaFor === '=FILTER_ONLY_STRING(') {
                    this.getCellValuesFromRange(e.target.value, false, formulaFor, (cell) => {
                        if (typeof cell.value !== 'string') {
                            cell.setValue('');
                            cell.cell.value = '';
                        }
                    });
                    this.lastCell.setValue('');
                    this.lastCell.cell.value = '';
                    return;
                }

                const parsedData = this.getCellValuesFromRange(e.target.value, true, formulaFor, (cell) => {
                    cell.addDependentCell({y: this.lastCell.yAxis, x: this.lastCell.xAxis});
                });

                let output = 0;
                let isValidFormula = true;

                if (parsedData.length > 0) {
                    switch (formulaFor) {
                        case "=SUM(": {
                            output = parsedData.reduce((a, b) => a + b);
                            break;
                        }
                        case "=AVERAGE(": {
                            output = parsedData.reduce((a, b) => a + b) / parsedData.length;
                            break;
                        }
                        case "=COUNT(": {
                            output = parsedData.length;
                            break;
                        }
                        case "=MAX(": {
                            output = Math.max(...parsedData);
                            break;
                        }
                        case "=MIN(": {
                            output = Math.min(...parsedData);
                            break;
                        }
                    }
                } else {
                    isValidFormula = false;
                }

                if (isValidFormula) {
                    const lastCellUpdatedEvent = new Event('lastCellUpdated');
                    this.lastCell.setFormula(e.target.value);
                    this.lastCell.cell.value = output.toString();
                    this.lastCell.cell.dispatchEvent(lastCellUpdatedEvent);
                }
            }
        });

        if (!isPreDefinedFormula) this.handleCustomFormulaUsage(e);
    }

    /**
     * handles show graph button click.
     */
    handleGraphBtnClick = () => {
        this.modal.addModelBody(this.GRAPH_CREATION_FORM, true);
        this.modal.show();

        const xAxisStartField = document.getElementById('x-axis-from');
        const xAxisEndField = document.getElementById('x-axis-to');

        const yAxisStartField = document.getElementById('y-axis-from');
        const yAxisEndField = document.getElementById('y-axis-to');

        this.isWorkingInExternalInput = true;
        xAxisStartField.focus();

        if (!this.modalFieldsListenerAdded) {
            this.addEventListenersToExternalFields([
                xAxisStartField, xAxisEndField, yAxisStartField, yAxisEndField
            ]);
            this.modalFieldsListenerAdded = true;
        }

        document.getElementById('submit-graph-form').addEventListener('click', this.handleGraphDetailForm);
    }

    /**
     * Shows graph plot data entry modal and handles data entry.
     */
    handleGraphDetailForm = () => {
        const xAxisStartField = document.getElementById('x-axis-from');
        const xAxisEndField = document.getElementById('x-axis-to');

        const yAxisStartField = document.getElementById('y-axis-from');
        const yAxisEndField = document.getElementById('y-axis-to');

        const graphXValues = this.getCellValuesFromRange(
            '=SUM(' + xAxisStartField.value + ':' + xAxisEndField.value + ')'
        );
        const graphYValues = this.getCellValuesFromRange(
            '=SUM(' + yAxisStartField.value + ':' + yAxisEndField.value + ')'
        );

        const xAxisLabel = document.getElementById('x-axis-label').value;
        const yAxisLabel = document.getElementById('y-axis-label').value;

        const graphType = document.getElementById('graph-type-selector').value;

        if (graphType === 'DOT') {
            this.graphManagers.dotGraph.setValues(graphXValues, graphYValues);
            this.graphManagers.dotGraph.setLabels(xAxisLabel, yAxisLabel);
            this.graphManagers.dotGraph.render();
        } else if (graphType === 'LINE') {
            this.graphManagers.lineGraph.setValues(graphXValues, graphYValues);
            this.graphManagers.lineGraph.setLabels(xAxisLabel, yAxisLabel);
            this.graphManagers.lineGraph.render();
        }
        this.modal.hide();
    }

    /**
     * updates dependent cell value if last updated cell is used for calculating cell value.
     */
    handleUpdateDependentCell = () => {
        this.lastCell.dependentCells.forEach(cellAxis => {
            const cell = this.grid[cellAxis.y][cellAxis.x];

            const tempLastCell = this.lastCell;
            this.lastCell = cell;

            this.handleFormulaUsage({
                target: {
                    value: cell.formula
                }
            });
            this.handleCustomFormulaUsage({
                target: {
                    value: cell.formula
                }
            });
            this.lastCell = tempLastCell;
        });
    }

    /**
     * Provides focus rights to cell when enter key is pressed from external fields.
     *
     * @param e
     */
    handleFallbackToCellFromInput = (e) => {
        if (e.code === 'Enter') {
            this.isWorkingInExternalInput = false;
            e.target.blur();
        }
    }

    /**
     * Add event listeners for handing control to cell from external fields.
     *
     * @param fields
     */
    addEventListenersForFallbackToCellFromInput = (fields) => {
        fields.forEach(field => {
            field.addEventListener('keydown', this.handleFallbackToCellFromInput);
        });
    }

    /**
     * Stops cell change when editing in external fields.
     *
     * @param fields
     */
    addEventListenersToExternalFields = (fields) => {
        fields.forEach(field => {
            field.addEventListener('focusin', () => {
                this.isEditing = true;
                this.isWorkingInExternalInput = true;
            });
            field.addEventListener('focusout', () => {
                this.isEditing = false;
                this.isWorkingInExternalInput = false;
            });
        });
    }

    /**
     * Adds event listeners, is used internally.
     */
    addEventListeners = () => {
        this.backgroundColorPicker.addEventListener('input', this.handleCellBackgroundColorChange);
        this.textColorPicker.addEventListener('input', this.handleCellTextColorChange);

        this.fontSizeInput.addEventListener('input', this.handleFontSizeChange);
        this.fontSelector.addEventListener('change', this.handleFontFamilyChange);

        this.italicBtn.addEventListener('click', this.handleItalicChange);
        this.boldBtn.addEventListener('click', this.handleBoldChange);
        this.crossedFontBtn.addEventListener('click', this.handleStrikeThroughChange);

        this.graphPlotBtn.addEventListener('click', this.handleGraphBtnClick);

        document.addEventListener('keydown', this.handleKeyPress);
        document.addEventListener('cellChangedPosition', this.handleCellClick);

        this.addEventListenersToExternalFields([
            this.backgroundColorPicker, this.textColorPicker, this.fontSizeInput,
            this.fontSelector,
        ]);
        this.addEventListenersForFallbackToCellFromInput([
            this.backgroundColorPicker, this.textColorPicker, this.fontSizeInput,
            this.fontSelector
        ]);
    }

    // =================================================================================================================
    // CREATING DOM OBJECTS !!
    /**
     * Creates html for table head.
     *
     * @returns {string|undefined}        HTML for table head.
     */
    getTableHead = () => {
        if (this.numberOfColumns > 702) return;

        let tHead = '';
        let j = 0;

        for (let i = 0; i < this.numberOfColumns; i++) {
            let letter = '';
            if (j === 26) {
                j = 0;
                if ((this.lastColumnCount - 64) <= 26) this.lastColumnCount++;
            }

            if (i < 26) letter = this.LETTERS[j];
            else letter = String.fromCharCode(this.lastColumnCount) + this.LETTERS[j];

            tHead += `<th class="disabled col" id="col-${i}">${letter}</th>`;
            j++;
        }
        return tHead;
    }

    /**
     * creates and returns new rows.
     *
     * @param numberOfRows          Number of new rows to make.
     * @returns {[]}                grid of cells.
     */
    getNewRows = (numberOfRows) => {
        const grid = [];

        for (let rowCount = 0; rowCount < numberOfRows; rowCount++) {
            const row = [];

            for (let colCount = 0; colCount < this.numberOfColumns; colCount++) {
                const cell = new Cell(colCount, this.grid.length + rowCount);
                cell.cell.addEventListener('change', (e) => {
                    this.handleFormulaUsage(e);
                    this.handleUpdateDependentCell(e);
                });
                row.push(cell);
            }

            grid.push(row);
        }

        return grid;
    }

    /**
     * Creates initial rows and columns.
     */
    createRowsAndColumns = () => {
        this.grid = [...this.grid, ...this.getNewRows(this.numberOfRows)];
    }
    // END CREATE DOM OBJECTS !!

    // RENDERING DOM OBJECTS !!
    /**
     * Resets grid and re-renders grid using newly provided grid.
     *
     * @param grid        Grid of new rows and columns.
     */
    resetGrid = (grid) => {
        this.tbody.innerHTML = '';
        this.grid = grid;
        this.renderCells();

        this.grid.forEach(row => {
            row.forEach(cell => {
                cell.cell.value = cell.value;
            });
        });
    }

    /**
     * Renders available fonts to font selector.
     */
    renderAvailableFonts = () => {
        let fontOptionsHTML = '';
        this.AVAILABLE_FONTS.forEach(font => {
            fontOptionsHTML += `<option value="${font.value}" style="font-family: ${font.value}">${font.displayName}</option>`;
        });

        this.fontSelector.innerHTML = fontOptionsHTML;
    }

    /**
     * Renders table initial skeleton with head, BODY is not rendered.
     */
    renderTable = () => {
        this.tableContainer.innerHTML = `
            <table>
                <thead class="table-head">
                    <tr>
                        <th class="disabled"></th>
                        ${this.getTableHead()}
                    </tr>
                </thead>
                <tbody>
         
                </tbody>
            </table>
        `;
    }

    /**
     * Renders all available cells if grid is not provided else given grid are rendered.
     *
     * @param grid          Grid to render, if not provided current grid will be rendered.
     */
    renderCells = (grid) => {
        const startCountFrom = grid ? this.grid.length - grid.length : 0;
        grid = grid || this.grid;

        grid.forEach((row, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="disabled center-text table-row" id="row-${i + startCountFrom}">${i + 1 + startCountFrom}</td>`;

            row.forEach(cell => {
                const td = document.createElement('td');

                tr.appendChild(td);

                cell.render();
                td.appendChild(cell.cell);
                this.tbody.appendChild(tr);
            });
        });
    }

    /**
     * Adds new rows to the grid, and renders it.
     *
     * @param numberOfRows          Number of new rows to add.
     */
    addNewRows = (numberOfRows) => {
        const newRows = this.getNewRows(numberOfRows);
        this.grid = [...this.grid, ...newRows];
        this.numberOfRows += numberOfRows;
        this.renderCells(newRows);
    }

    /**
     * Adds 26 new columns to the grid, and renders it.
     */
    addNewColumns = () => {
        // TODO: FIX CELL JUMPING ISSUE !!
        if (!this.RUN_UNDER_DEVELOPMENT_FEATURES) return;
        if ((this.lastColumnCount - 64) >= 26) return;

        this.grid.forEach((row, rowCount) => {
            const newColumns = [];

            for (let i = 0; i < 26; i++) {
                const cell = new Cell(i + this.numberOfColumns + 1, rowCount);
                cell.cell.addEventListener('change', (e) => {
                    this.handleFormulaUsage(e);
                    this.handleUpdateDependentCell(e);
                });
                newColumns.push(cell);
            }

            this.grid[rowCount] = [...row, ...newColumns]
        });

        this.numberOfColumns += 26;

        this.renderTable();
        this.tbody = this.tableContainer.querySelector('tbody');
        this.resetGrid(this.grid);
    }

    /**
     * Adds all the styles compiles it and renders the spreadsheet.
     */
    render = () => {
        this.renderTable();
        this.tbody = this.tableContainer.querySelector('tbody');

        if (this.grid.length === 0) this.createRowsAndColumns();

        this.renderCells();
        this.renderAvailableFonts();

        this.lastCell = this.grid[this.activeYAxis][this.activeXAxis];
        this.activeCell = this.grid[this.activeYAxis][this.activeXAxis];

        this.showActiveCell();
        this.showActiveNavbar();
        this.addEventListeners();
    }
    // END RENDERING DOM OBJECTS !!
}

export const getGridFromJson = (data) => data.grids.map(row => row.map(cell => createCellFromJson(cell)))


// export const createExcelFromJson = (data) => {
//     return new Excel(
//         data.numberOfRows, data.numberOfColumns,
//         data.tableContainerId,
//         data.backgroundColorPickerId, data.textColorPickerId, data.fontSizeInputId,
//         data.boldBtnId, data.italicBtnId, data.crossedFontBtnId, data.currentCellDisplayId,
//         data.formulaInputId, data.fontSelectorId, getGridFromJson(data)
//     );
// }
