import "@babel/polyfill";
import axios from 'axios';

const chooseMimetype = mimetype => {
    if (mimetype === 'jpeg') {
        return 'jpg';
    } else if (mimetype === 'png') {
        return 'png';
    } else if (mimetype === 'gif') {
        return 'gif';
    }
    return false;
};

document.querySelector('#uploadForm').addEventListener('change', async e => {
    console.log(e);
    const target = e.target;
    const files = target.files;
    const mimetype = files[0].type.split('/')[1];
    console.log(files);

    if (files.length >= 6) {
        alert('Maximum limit is 5');
    } else {
        document.querySelector('.image_wrapper img').setAttribute('src', `/img/${chooseMimetype(mimetype)}.png`);

        if (files.length === 1) {
            document.querySelector('.fileName').innerText = files[0].name;
            document.querySelector('.totalSize').innerText = ' ' + (files[0].size / 1024 / 1024).toFixed(2) + ' MB';
        } else {
            let sumArr = [];
            for (let [key, value] of Object.entries(files)) {
                sumArr.push(value.size);
            }
            const sum = sumArr.reduce(function(acc, val) { return acc + val; }, 0);
            document.querySelector('.totalSize').innerText = ' ' + (sum / 1024 / 1024).toFixed(2) + ' MB';
            document.querySelector('.fileName').innerText = files.length + ' files';
        }
        document.querySelector('.box_wrapper').classList.add('file_upload--started');

        const form = new FormData();
        form.append('file', files[0]);

        try {
            const res = await axios({
                method: 'POST',
                url: '/api/upload',
                data: form,
                onUploadProgress: progress => {
                    const { total, loaded } = progress;
                    const totalSizeInMB = total / 1000000;
                    const loadedSizeInMB = loaded / 1000000;
                    const uploadPercentage = (loadedSizeInMB / totalSizeInMB) * 100;
                    console.log('%', uploadPercentage);
                    document.querySelector('.side-0 .growing-bar, .side-1 .growing-bar')
                        .setAttribute('style', `transform: translateY(${100 - uploadPercentage}%);`);
                    const above = uploadPercentage / 100 * 2 + 5;
                    document.querySelector('.floor')
                        .setAttribute('style', `transform: rotateX(-90deg) translateY(0em) translateZ(-${above}em) rotate(180deg);`);
                    // console.log("total size in MB ==> ", totalSizeInMB);
                    // console.log("uploaded size in MB ==> ", loadedSizeInMB);
                }
            });
            console.log(res);
        } catch (err) {
            console.log(err.response.data.message);
        }
    }
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
    document.querySelector('input[type="file"]').files = e.dataTransfer.files;
    console.log(e);
});

// CLOSE ICON
document.querySelector('.close_arrow').addEventListener('click', () => {
    document.querySelector('.box_wrapper').classList.remove('file_upload--started');
});
