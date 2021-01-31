import {Cell, createCellFromJson} from "./cell.js";
import {DotGraph, LineGraph} from "./graph.js";
import {parseMathSyntax} from "../utils/parser.js";
import {Modal} from "./modal.js";

export class Excel {
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
                <label><input class="theme-input-field" type="text" id="x-axis-from" placeholder="X axis start cell"></label>
                <label><input class="theme-input-field" type="text" id="x-axis-to" placeholder="X axis end cell"></label>
                <label><input class="theme-input-field" type="text" id="x-axis-label" placeholder="X axis label"></label>
            </div>
            
            <br>
            
            <div>
                <h3>Row or column for Y-Axis</h3>
                <label><input class="theme-input-field" type="text" id="y-axis-from" placeholder="Y axis start cell"></label>
                <label><input class="theme-input-field" type="text" id="y-axis-to" placeholder="Y axis end cell"></label>
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

        this.graphManager = {
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
    }

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
    focusCurrentCell = () => this.activeCell.cell.focus();

    blurLastCell = () => this.lastCell.cell.blur();

    showActiveCell = () => {
        this.lastCell.cell.classList.remove('active-cell');
        this.activeCell.cell.classList.add('active-cell');
    }

    updateActiveCellDisplay = () => {
        this.currentCellDisplay.innerText = this.LETTERS[this.activeXAxis] + (this.activeYAxis + 1);
    }

    updateFormulaBar = () => {
        this.formulaInput.value = this.activeCell.formula || this.activeCell.value;
    }

    updateNumberOfRows = () => {
        if (this.activeYAxis >= this.numberOfRows - 1) this.addNewRows(10);
    }

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
            }
        }
    }
    // END CELL RELATED !!

    // HANDLE EVENTS !!
    handleCellClick = (e) => {
        this.isEditing = false; // for saying editing has stopped in last cell !!
        this.changeCell(e.detail.xAxis, e.detail.yAxis);
        this.showActiveCell();
        this.isEditing = true; // for saying editing has started in current cell !!
    }

    handleCellBackgroundColorChange = (e) => {
        this.activeCell.addStyles({
            backgroundColor: e.target.value
        });
        this.activeCell.compileStyles();
    }

    handleCellTextColorChange = (e) => {
        this.activeCell.addStyles({
            color: e.target.value
        });
        this.activeCell.compileStyles();
    }

    handleFontSizeChange = (e) => {
        this.activeCell.addStyles({
            fontSize: e.target.value + 'px'
        });
        this.activeCell.compileStyles();
    }

    handleItalicChange = () => {
        this.activeCell.addStyles({
            fontStyle: this.activeCell.styles.fontStyle === 'italic' ? 'normal' : 'italic',
        });
        this.activeCell.compileStyles();
    }

    handleBoldChange = () => {
        this.activeCell.addStyles({
            fontWeight: this.activeCell.styles.fontWeight === 'bold' ? 'normal' : 'bold',
        });
        this.activeCell.compileStyles();
    }

    handleStrikeThroughChange = () => {
        this.activeCell.addStyles({
            textDecoration: this.activeCell.styles.textDecoration === 'line-through' ? 'none' : 'line-through',
        });
        this.activeCell.compileStyles();
    }

    handleFontFamilyChange = (e) => {
        this.activeCell.addStyles({
            fontFamily: e.target.value
        });
        this.activeCell.compileStyles();
    }

    // FOR FORMULA USAGE !!
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

    handleFormulaUsage = (e) => {
        this.ALLOWED_FORMULA.forEach(formulaFor => {
            if (e.target.value.includes(formulaFor)) {
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
    }

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
            this.graphManager.dotGraph.setValues(graphXValues, graphYValues);
            this.graphManager.dotGraph.setLabels(xAxisLabel, yAxisLabel);
            this.graphManager.dotGraph.render();
        } else if (graphType === 'LINE') {
            this.graphManager.lineGraph.setValues(graphXValues, graphYValues);
            this.graphManager.lineGraph.setLabels(xAxisLabel, yAxisLabel);
            this.graphManager.lineGraph.render();
        }
        this.modal.hide();
    }

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
            this.lastCell = tempLastCell;
        });
    }

    handleFallbackToCellFromInput = (e) => {
        if (e.code === 'Enter') {
            this.isWorkingInExternalInput = false;
            e.target.blur();
        }
    }

    handleColumnHeaderClick = (e) => {
        e.preventDefault();

    }

    addEventListenersForFallbackToCellFromInput = (fields) => {
        fields.forEach(field => {
            field.addEventListener('keydown', this.handleFallbackToCellFromInput);
        });
    }

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
        document.querySelectorAll('.col').forEach(col => {
            col.addEventListener('contextmenu', this.handleColumnHeaderClick);
        });

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
    getTableHead = () => {
        let tHead = '';

        for (let i = 0; i < this.numberOfColumns; i++) {
            tHead += `<th class="disabled col" id="col-${i}">${this.LETTERS[i]}</th>`;
        }

        return tHead;
    }

    getNewRows = (numberOfRows) => {
        const grid = [];

        for (let rowCount = 0; rowCount < numberOfRows; rowCount++) {
            const row = [];

            for (let colCount = 0; colCount < this.numberOfColumns; colCount++) {
                const cell = new Cell(this.grid.length + colCount, this.grid.length + rowCount);
                cell.cell.addEventListener('change', this.handleFormulaUsage);
                cell.cell.addEventListener('change', this.handleUpdateDependentCell);
                row.push(cell);
            }

            grid.push(row);
        }

        return grid;
    }

    createRowsAndColumns = () => {
        this.grid = [...this.grid, ...this.getNewRows(this.numberOfRows)];
    }
    // END CREATE DOM OBJECTS !!

    // RENDERING DOM OBJECTS !!
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

    renderAvailableFonts = () => {
        let fontOptionsHTML = '';
        this.AVAILABLE_FONTS.forEach(font => {
            fontOptionsHTML += `<option value="${font.value}" style="font-family: ${font.value}">${font.displayName}</option>`;
        });

        this.fontSelector.innerHTML = fontOptionsHTML;
    }

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


    addNewRows = (numberOfRows) => {
        const newRows = this.getNewRows(numberOfRows);
        this.grid = [...this.grid, ...newRows];
        this.numberOfRows += numberOfRows;
        this.renderCells(newRows);
    }

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
