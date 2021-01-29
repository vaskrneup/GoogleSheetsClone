import {Cell, createCellFromJson} from "./cell.js";
import {DotGraph} from "./graph.js";
import {parseMathSyntax} from "../utils/parser.js";
import {Modal} from "./modal.js";

export class Excel {
    LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    ALLOWED_FORMULA = ['=SUM(', '=AVERAGE(', '=COUNT(', '=MIN(', '=MAX('];
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

    constructor(numberOfRows, numberOfColumns, tableContainerId,
                backgroundColorPickerId, textColorPickerId, fontSizeInputId,
                boldBtnId, italicBtnId, crossedFontBtnId,
                currentCellDisplayId, formulaInputId, fontSelectorId, graphPlotBtnId, grid) {
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

        this.graphManager = new DotGraph(null, null, 'Number', 'Values');

        this.lastActiveXAxis = 0;
        this.lastActiveYAxis = 0;

        this.activeXAxis = 0;
        this.activeYAxis = 0;

        this.isEditing = false;
        this.modal = new Modal({});
    }

    serialize = () => {
        return {
            name: document.getElementById('current-doc-name-input').value, // TODO: make param !!

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

    handleKeyPress = (e) => {
        switch (e.code) {
            case 'ArrowUp': {
                if (!this.isEditing) {
                    this.changeCell(
                        this.activeXAxis,
                        this.activeYAxis - 1
                    );
                    this.showActiveCell();
                    this.blurLastCell();
                }
                break;
            }
            case 'ArrowDown': {
                if (!this.isEditing) {
                    this.changeCell(
                        this.activeXAxis,
                        this.activeYAxis + 1
                    );
                    this.showActiveCell();
                    this.blurLastCell();
                }
                break;
            }

            case 'ArrowRight': {
                if (!this.isEditing) {
                    this.changeCell(
                        this.activeXAxis + 1,
                        this.activeYAxis
                    );
                    this.showActiveCell();
                    this.blurLastCell();
                }
                break;
            }
            case 'ArrowLeft': {
                if (!this.isEditing) {
                    this.changeCell(
                        this.activeXAxis - 1,
                        this.activeYAxis
                    );
                    this.showActiveCell();
                    this.blurLastCell();
                }
                // e.preventDefault()
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

    changeCell = (newX, newY) => {
        if (!this.isEditing) {
            if (!((newX < 0) || (newX >= this.numberOfColumns) || (newY < 0) || (newY >= this.numberOfRows))) {
                this.lastCell = this.grid[this.activeYAxis][this.activeXAxis];
                this.lastActiveXAxis = this.activeXAxis;
                this.lastActiveYAxis = this.activeYAxis;

                this.activeCell = this.grid[newY][newX];
                this.activeXAxis = newX;
                this.activeYAxis = newY;

                this.activeCell.cell.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});

                this.showActiveNavbar();
                this.updateActiveCellDisplay();
                this.updateFormulaBar();
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

    handleFormulaUsage = (e) => {
        this.ALLOWED_FORMULA.forEach(formulaFor => {
            if (e.target.value.includes(formulaFor)) {
                const parsedData = parseMathSyntax(e.target.value, formulaFor);
                let output = 0;
                let isValidFormula = true;

                if (parsedData !== null) {
                    // for comma separated formulas !!
                    if (parsedData[0].isTwoDigitSum) {
                        for (let i = 0; i < parsedData.length; i++) {
                            const cellValue = this.grid[parsedData[i].y][parsedData[i].x].value;
                            this.grid[parsedData[i].y][parsedData[i].x].addDependentCell(
                                [this.activeCell.yAxis, this.activeCell.xAxis]
                            );

                            switch (formulaFor) {
                                case "=SUM(": {
                                    output += cellValue;
                                    break;
                                }
                                case "=AVERAGE(": {
                                    output += cellValue;
                                    if (i === parsedData.length - 1) output = output / parsedData.length;
                                    break;
                                }
                                case "=COUNT(": {
                                    if (typeof cellValue === 'number') output++;
                                    break;
                                }
                                case "=MAX(": {
                                    if (cellValue > output) output = cellValue;
                                    break;
                                }
                                case "=MIN(": {
                                    if (output === 0) output = cellValue;
                                    if (cellValue < output) output = cellValue;
                                    break;
                                }
                            }
                        }
                    } else { // for sequence of rows or columns !!
                        if (parsedData[0].x === parsedData[1].x) { // For vertical calculations !!
                            for (let i = parsedData[0].y; i <= parsedData[1].y; i++) {
                                const cellValue = this.grid[i][parsedData[0].x].value;
                                this.grid[i][parsedData[0].x].addDependentCell(
                                    [this.activeCell.yAxis, this.activeCell.xAxis]
                                );

                                switch (formulaFor) {
                                    case "=SUM(": {
                                        output += cellValue;
                                        break;
                                    }
                                    case "=AVERAGE(": {
                                        output += cellValue;
                                        if (parsedData[1].y === i) output = output / (parsedData[1].y - parsedData[0].y + 1);
                                        break;
                                    }
                                    case "=COUNT(": {
                                        if (typeof cellValue === "number") output++;
                                        break;
                                    }
                                    case "=MAX(": {
                                        if (cellValue > output) output = cellValue;
                                        break;
                                    }
                                    case "=MIN(": {
                                        if (i === parsedData[0].y) output = cellValue;
                                        if (cellValue < output) output = cellValue;
                                        break;
                                    }
                                }
                            }
                        } else if (parsedData[0].y === parsedData[1].y) { // For horizontal calculations !!
                            for (let i = parsedData[0].x; i <= parsedData[1].x; i++) {
                                const cellValue = this.grid[parsedData[0].y][i].value;
                                this.grid[parsedData[0].y][i].addDependentCell(
                                    [this.activeCell.yAxis, this.activeCell.xAxis]
                                );

                                switch (formulaFor) {
                                    case "=SUM(": {
                                        output += cellValue;
                                        break;
                                    }
                                    case "=AVERAGE(": {
                                        output += cellValue;
                                        if (parsedData[1].x === i) output = output / (parsedData[1].x - parsedData[0].x + 1);
                                        break;
                                    }
                                    case "=COUNT(": {
                                        if (typeof cellValue === "number") {
                                            output++;
                                        }
                                        break;
                                    }
                                    case "=MAX(": {
                                        if (cellValue > output) output = cellValue;
                                        break;
                                    }
                                    case "=MIN(": {
                                        if (i === parsedData[0].x) output = cellValue;
                                        if (cellValue < output) output = cellValue;
                                        break;
                                    }
                                }
                            }
                        } else {
                            isValidFormula = false;
                        }
                    }
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

    handleFontFamilyChange = (e) => {
        this.activeCell.addStyles({
            fontFamily: e.target.value
        });
        this.activeCell.compileStyles();
    }

    handleGraphBtnClick = () => {
        const formHTML = `
        <div>
            <h2>Plot Graph from cell data</h2>
            
            <br>
            
            <div>
                <h3>Row or column for X-Axis</h3>
                <label><input type="text" id="x-axis-from" placeholder="X axis start cell"></label>
                <label><input type="text" id="x-axis-to" placeholder="X axis end cell"></label>
            </div>
            
            <br>
            
            <div>
                <h3>Row or column for Y-Axis</h3>
                <label><input type="text" id="y-axis-from" placeholder="Y axis start cell"></label>
                <label><input type="text" id="y-axis-to" placeholder="Y axis end cell"></label>
            </div>
            
            <br>
            
            <div>
                <input type="button" value="Plot Graph" id="submit-graph-form">
            </div>
        </div>
        `;

        this.modal.addModelBody(formHTML, true);
        this.modal.show();

        document.getElementById('submit-graph-form').addEventListener('click', this.handleGraphDetailForm);
        // this.graphManager.render();
    }

    handleGraphDetailForm = () => {
        // TODO: better algo !!
        const xAxisValues = parseMathSyntax('=SUM(' + document.getElementById('x-axis-from').value + ':' + document.getElementById('x-axis-to').value + ')', '=SUM(');
        const yAxisValues = parseMathSyntax('=SUM(' + document.getElementById('y-axis-from').value + ':' + document.getElementById('y-axis-to').value + ')', '=SUM(');

        const graphXValues = [];
        const graphYValues = [];

        if (xAxisValues[0].x === xAxisValues[1].x) { // For vertical calculations !!
            for (let i = xAxisValues[0].y; i <= xAxisValues[1].y; i++) {
                const cellValue = this.grid[i][xAxisValues[0].x].value;
                graphXValues.push(cellValue)
            }
        } else if (xAxisValues[0].y === xAxisValues[1].y) { // For horizontal calculations !!
            for (let i = xAxisValues[0].x; i <= xAxisValues[1].x; i++) {
                const cellValue = this.grid[xAxisValues[0].y][i].value;
                graphXValues.push(cellValue)
            }
        }

        if (yAxisValues[0].x === yAxisValues[1].x) { // For vertical calculations !!
            for (let i = yAxisValues[0].y; i <= yAxisValues[1].y; i++) {
                const cellValue = this.grid[i][yAxisValues[0].x].value;
                graphYValues.push(cellValue)
            }
        } else if (yAxisValues[0].y === yAxisValues[1].y) { // For horizontal calculations !!
            for (let i = yAxisValues[0].x; i <= yAxisValues[1].x; i++) {
                const cellValue = this.grid[yAxisValues[0].y][i].value;
                graphYValues.push(cellValue)
            }
        }

        this.graphManager.setValues(graphXValues, graphYValues);
        this.graphManager.render();
        this.modal.hide();
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
    }

    // =================================================================================================================
    // CREATING DOM OBJECTS !!
    getTableHead = () => {
        let tHead = '';

        for (let i = 0; i < this.numberOfColumns; i++) {
            tHead += `<th class="disabled" id="col-${i}">${this.LETTERS[i]}</th>`;
        }

        return tHead;
    }

    createRowsAndColumns = () => {
        for (let row_count = 0; row_count < this.numberOfRows; row_count++) {
            const row = [];

            for (let col_count = 0; col_count < this.numberOfColumns; col_count++) {
                const cell = new Cell(col_count, row_count);
                cell.cell.addEventListener('change', this.handleFormulaUsage);
                row.push(cell);
            }

            this.grid.push(row);
        }
    }
    // END CREATE DOM OBJECTS !!

    // RENDERING DOM OBJECTS !!
    resetGrid = (grid) => {
        this.tbody.innerHTML = '';
        this.grid = grid;
        this.renderCells();

        this.grid.forEach(row => {
            row.forEach(cell => {
                cell.cell.setValue(cell.value);
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
        `
    }

    renderCells = () => {
        this.grid.forEach((row, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="disabled center-text table-row" id="row-${i}">${i + 1}</td>`;

            row.forEach(cell => {
                this.tbody.appendChild(tr);
                const td = document.createElement('td');

                tr.appendChild(td);

                cell.render();
                td.appendChild(cell.cell);
            })
        })
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


export const createExcelFromJson = (data) => {
    return new Excel(
        data.numberOfRows, data.numberOfColumns,
        data.tableContainerId,
        data.backgroundColorPickerId, data.textColorPickerId, data.fontSizeInputId,
        data.boldBtnId, data.italicBtnId, data.crossedFontBtnId, data.currentCellDisplayId,
        data.formulaInputId, data.fontSelectorId, getGridFromJson(data)
    );
}