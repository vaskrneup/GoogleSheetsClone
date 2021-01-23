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
    }
}