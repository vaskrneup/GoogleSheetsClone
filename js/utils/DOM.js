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