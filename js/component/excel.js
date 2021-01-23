import {Cell} from "./cell.js";

export class Excel {
    LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    constructor(numberOfRows, numberOfColumns, tableContainerId) {
        this.numberOfRows = numberOfRows;
        this.numberOfColumns = numberOfColumns;

        this.tableContainer = document.getElementById(tableContainerId);
        this.renderTable();

        this.tbody = this.tableContainer.querySelector('tbody');

        this.grid = [];

        this.lastActiveXAxis = 0;
        this.lastActiveYAxis = 0;

        this.activeXAxis = 0;
        this.activeYAxis = 0;

        this.isEditing = false;

        this.addEventListeners();
    }

    handleKeyPress = (e) => {
        switch (e.code) {
            case 'ArrowUp': {
                this.activeYAxis = this.activeYAxis !== 0 ? this.activeYAxis - 1 : this.activeYAxis;
                this.handleCellPositionChange();
                break;
            }
            case 'ArrowDown': {
                this.activeYAxis = this.activeYAxis + 1 !== this.numberOfRows ? this.activeYAxis + 1 : this.activeYAxis;
                this.handleCellPositionChange();
                break;
            }

            case 'ArrowRight': {
                this.activeXAxis = this.activeXAxis + 1 !== this.numberOfColumns ? this.activeXAxis + 1 : this.activeXAxis;
                this.handleCellPositionChange();
                break;
            }
            case 'ArrowLeft': {
                this.activeXAxis = this.activeXAxis !== 0 ? this.activeXAxis - 1 : this.activeXAxis;
                this.handleCellPositionChange();
                break;
            }
            case 'Enter': {
                this.isEditing = !this.isEditing;
                break;
            }
            case 'Tab': {
                break;
            }
            default: {
                
            }
        }
    }

    changeActiveCellPosition = (x, y) => {
        this.activeXAxis = x;
        this.activeYAxis = y;
    }

    focusActiveCellNavbar = () => {
        const activeCol = document.getElementById('col-' + this.activeXAxis);
        const activeRow = document.getElementById('row-' + this.activeYAxis);

        activeCol.classList.add('active-excel-navbar');
        activeRow.classList.add('active-excel-navbar');

        if (this.lastActiveXAxis !== this.activeXAxis) document.getElementById('col-' + this.lastActiveXAxis).classList.remove('active-excel-navbar');
        if (this.lastActiveYAxis !== this.activeYAxis) document.getElementById('row-' + this.lastActiveYAxis).classList.remove('active-excel-navbar');
    }

    changeActiveCellStyles = () => {
        this.grid[this.activeYAxis][this.activeXAxis].cell.classList.add('active-cell');

        if ((this.lastActiveXAxis !== this.activeXAxis) || (this.lastActiveYAxis !== this.activeYAxis)) {
            this.grid[this.lastActiveYAxis][this.lastActiveXAxis].cell.classList.remove('active-cell');
        }
    }

    blurActiveCell = () => {
        this.grid[this.activeYAxis][this.activeXAxis].cell.blur();
    }

    focusActiveCell = () => {
        this.grid[this.activeYAxis][this.activeXAxis].cell.focus();
    }

    focusOrBlurActiveCell = () => {
        this.isEditing ? this.blurActiveCell() : this.focusActiveCell();
    }

    handleCellPositionChange = () => {
        this.focusActiveCellNavbar();
        this.changeActiveCellStyles();

        this.lastActiveXAxis = this.activeXAxis;
        this.lastActiveYAxis = this.activeYAxis;
    }

    addEventListeners = () => {
        document.addEventListener('keydown', this.handleKeyPress);
        document.addEventListener('cellChangedPosition', (e) => {
            this.changeActiveCellPosition(e.detail.xAxis, e.detail.yAxis);
            this.handleCellPositionChange();
        });
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
                row.push(new Cell(col_count, row_count));
            }

            this.grid.push(row);
        }
    }
    // END CREATE DOM OBJECTS !!

    // RENDERING DOM OBJECTS !!
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
        this.createRowsAndColumns();
        this.renderCells();

        // this.focusActiveCell();
        this.handleCellPositionChange();
    }
    // END RENDERING DOM OBJECTS !!
}