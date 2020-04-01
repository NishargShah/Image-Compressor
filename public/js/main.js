import "@babel/polyfill";

document.querySelector('#uploadForm').addEventListener('change', e => {
    console.log(e);
    const target = e.target;
    e.path[2].classList.add('file_upload--started');
    const files = target.files;
    console.log(files);
});

document.querySelector('.close_arrow').addEventListener('click', e => {
    // console.log(e);
    // const target = e.target;
    e.path[2].classList.remove('file_upload--started');
});
