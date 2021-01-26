export const downloadData = (filetype, filename, data) => {
    switch (filetype) {
        case ('json') : {
            filetype = 'data:text/json;charset=utf-8,'
        }
    }

    const a = document.createElement('a');
    const downloadContent = filetype + encodeURIComponent(data);

    a.style.display = 'none';
    a.setAttribute("download", filename);
    a.setAttribute('href', downloadContent);

    document.body.appendChild(a);
    a.click();
    a.remove();
}

export const readFile = (file, onFileLoad) => {
    // REF: https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications !!
    const fileReader = new FileReader();

    fileReader.onload = function (e) {
        onFileLoad(e.target.result);
    };

    fileReader.readAsText(file);
}
