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
                this.changeCell(
                    this.activeXAxis,
                    this.activeYAxis !== 0 ? this.activeYAxis - 1 : this.activeYAxis
                );
                this.showActiveCell();
                this.blurLastCell();
                break;
            }
            case 'ArrowDown': {
                this.changeCell(
                    this.activeXAxis,
                    this.activeYAxis + 1 !== this.numberOfRows ? this.activeYAxis + 1 : this.activeYAxis
                );
                this.showActiveCell();
                this.blurLastCell();
                break;
            }

            case 'ArrowRight': {
                this.changeCell(
                    this.activeXAxis + 1 !== this.numberOfColumns ? this.activeXAxis + 1 : this.activeXAxis,
                    this.activeYAxis
                );
                this.showActiveCell();
                this.blurLastCell();
                break;
            }
            case 'ArrowLeft': {
                this.changeCell(
                    this.activeXAxis !== 0 ? this.activeXAxis - 1 : this.activeXAxis,
                    this.activeYAxis
                );
                this.showActiveCell();
                this.blurLastCell();
                break;
            }

            case 'Enter': {
                if (!this.isEditing) {
                    this.isEditing = true;
                    this.focusCurrentCell();
                } else {
                    this.isEditing = false;
                    this.changeCell(this.activeXAxis, this.activeYAxis + 1);
                    this.showActiveCell();
                    this.blurLastCell();
                }
                break;
            }
            case 'Tab': {

                break;
            }
        }
    }

    focusCurrentCell = () => {
        this.activeCell.focus();
    }

    blurLastCell = () => {
        this.lastCell.blur();
    }

    showActiveCell = () => {
        this.lastCell.classList.remove('active-cell');
        this.activeCell.classList.add('active-cell');
    }

    changeCell = (newX, newY) => {
        this.lastCell = this.grid[this.activeYAxis][this.activeXAxis].cell;
        this.lastActiveXAxis = this.activeXAxis;
        this.lastActiveYAxis = this.activeYAxis;

        this.activeCell = this.grid[newY][newX].cell;
        this.activeXAxis = newX;
        this.activeYAxis = newY;
    }

    // HANDLE EVENTS !!
    handleCellClick = (e) => {
        this.changeCell(e.detail.xAxis, e.detail.yAxis);
        this.showActiveCell();
    }

    addEventListeners = () => {
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

        this.lastCell = this.grid[this.activeYAxis][this.activeXAxis].cell;
        this.activeCell = this.grid[this.activeYAxis][this.activeXAxis].cell;

        // this.focusActiveCell();
        // this.handleCellPositionChange();
    }
    // END RENDERING DOM OBJECTS !!
}