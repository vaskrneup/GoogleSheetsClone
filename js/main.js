import {Excel} from "./component/excel.js";

function main() {
    const excel = new Excel(100, 26);
    document.getElementById('main').innerHTML = excel.render();
}

main();
