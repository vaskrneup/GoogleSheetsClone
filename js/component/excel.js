export class Excel {
    LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    constructor(numberOfRows, numberOfColumns) {
        this.numberOfRows = numberOfRows;
        this.numberOfColumns = numberOfColumns;
    }

    renderTableHead = () => {
        let tHead = '';

        for (let i = 0; i < this.numberOfColumns; i++) {
            tHead += `<th>${this.LETTERS[i]}</th>`;
        }

        return tHead;
    }

    renderTableRow = (rowNumber) => {
        let tBody = '<tr>';
        tBody += `<td class="table-row-count">${rowNumber}</td>`

        for (let i = 1; i < this.numberOfColumns + 1; i++) {
            tBody += `<td><input type="text"></td>`
        }

        tBody += '</tr>'
        return tBody;
    }

    renderTable = () => {
        let tRow = '';

        for (let i = 1; i < this.numberOfRows + 1; i++) {
            tRow += this.renderTableRow(i);
        }

        return tRow;
    }

    render = () => {
        return `
            <table>
                <thead class="table-head">
                    <tr>
                        <th class="disabled"></th>
                        ${this.renderTableHead()}
                    </tr>
                </thead>
                <tbody>
                    ${this.renderTable()}
                </tbody>
            </table>
        `
    }
}