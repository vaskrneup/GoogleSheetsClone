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

        this.addEventListeners();
    }

    focusActiveCellNavbar = () => {
        const activeRow = document.getElementById('col-' + this.activeXAxis);
        console.log(activeRow)
    }

    focusActiveCell = () => {
        this.grid[this.activeYAxis][this.activeXAxis].cell.focus();

        // TODO: MUST BE IN BETTER PLACE !!
        this.focusActiveCellNavbar();
    }

    changeActiveCell = (x, y) => {
        this.activeXAxis = x;
        this.activeYAxis = y;
    }

    handleKeyPress = (e) => {
        switch (e.code) {
            case 'ArrowUp': {
                this.activeYAxis = this.activeYAxis !== 0 ? this.activeYAxis - 1 : this.activeYAxis;
                this.focusActiveCell();
                break;
            }
            case 'ArrowDown': {
                this.activeYAxis = this.activeYAxis + 1 !== this.numberOfRows ? this.activeYAxis + 1 : this.activeYAxis;
                this.focusActiveCell();
                break;
            }

            case 'ArrowRight': {
                this.activeXAxis = this.activeXAxis + 1 !== this.numberOfColumns ? this.activeXAxis + 1 : this.activeXAxis;
                this.focusActiveCell();
                break;
            }
            case 'ArrowLeft': {
                this.activeXAxis = this.activeXAxis !== 0 ? this.activeXAxis - 1 : this.activeXAxis;
                this.focusActiveCell();
                break;
            }
            case 'Enter': {

                break;
            }
            case 'Tab': {

                break;
            }
            default: {

            }
        }
    }

    handleCellChangedPosition = (e) => {
        this.changeActiveCell(e.detail.xAxis, e.detail.yAxis)
    }

    addEventListeners = () => {
        document.addEventListener('keydown', this.handleKeyPress);
        document.addEventListener('cellChangedPosition', this.handleCellChangedPosition);
    }

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
            tr.innerHTML = `<td class="disabled center-text">${i + 1}</td>`;

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

        this.focusActiveCell();
    }
}