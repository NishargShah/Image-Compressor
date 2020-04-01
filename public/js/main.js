import "@babel/polyfill";

document.querySelector('#uploadForm').addEventListener('change', e => {
    console.log(e);
    const target = e.target;
    document.querySelector('.box_wrapper').classList.add('file_upload--started');
    const files = target.files;
    console.log(files);
});

// WHEN FILE COMES ( BOTH NEEDED TO PREVENT )
window.addEventListener('dragover', e => e.preventDefault());

// WHEN FILE COMES ( BOTH NEEDED TO PREVENT )
window.addEventListener('dragenter', e => {
    e.preventDefault();
    document.querySelector('.container-fluid').classList.add('drag_fired');
});

// DROP
window.addEventListener('drop', e => {
    e.preventDefault();
    document.querySelector('.container-fluid').classList.remove('drag_fired');
    document.querySelector('.box_wrapper').classList.add('file_upload--started');
    console.log(e);
});

// CLOSE ICON
document.querySelector('.close_arrow').addEventListener('click', () => {
    document.querySelector('.box_wrapper').classList.remove('file_upload--started');
});
