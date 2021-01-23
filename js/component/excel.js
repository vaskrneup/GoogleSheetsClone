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

        this.activeXAxis = 0;
        this.activeYAxis = 0;

        this.addEventListeners();
    }

    focusActiveCell = () => {
        this.grid[this.activeXAxis][this.activeYAxis].cell.focus();
    }

    changeActiveCell = (x, y) => {
        this.activeXAxis = x;
        this.activeYAxis = y;
    }

    handleKeyPress = (e) => {
        switch (e.code) {
            case 'ArrowUp': {
                this.activeXAxis = this.activeXAxis !== 0 ? this.activeXAxis - 1 : this.activeXAxis;
                this.focusActiveCell();
                break;
            }
            case 'ArrowDown': {
                this.activeXAxis = this.activeXAxis + 1 !== this.numberOfRows ? this.activeXAxis + 1 : this.activeXAxis;
                this.focusActiveCell();
                break;
            }
            case 'ArrowRight': {
                this.activeYAxis = this.activeYAxis + 1 !== this.numberOfColumns ? this.activeYAxis + 1 : this.activeYAxis;
                this.focusActiveCell();
                break;
            }
            case 'ArrowLeft': {
                this.activeYAxis = this.activeYAxis !== 0 ? this.activeYAxis - 1 : this.activeYAxis;
                this.focusActiveCell();
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
            tHead += `<th>${this.LETTERS[i]}</th>`;
        }

        return tHead;
    }

    createRowsAndColumns = () => {
        for (let row_count = 0; row_count < this.numberOfRows; row_count++) {
            const row = [];

            for (let col_count = 0; col_count < this.numberOfColumns; col_count++) {
                row.push(new Cell(row_count, col_count));
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