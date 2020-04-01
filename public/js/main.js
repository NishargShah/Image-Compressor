import "@babel/polyfill";

document.querySelector('#uploadForm').addEventListener('change', e => {
    console.log(e);
    const target = e.target;
    e.path[3].classList.add('file_upload--started');
});
