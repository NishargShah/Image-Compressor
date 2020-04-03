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

const HTML = (object, isOne) => {
    const oneHtml = isOne ? `<div class="middle_wrapper--right"></div>` :
    `
        <div class="middle_wrapper--right">
            <a href="/uploads/${object.filename}" download><i class="fas fa-file-download"></i></a>
        </div>
    `;
    return `
        <div class="middle_wrapper">
            <div class="middle_wrapper--left">
                <p class="download_fileName">${object.originalname}</p>
                <div class="download_fileSize">
                    <p class="size">${object.size}</p>
                    <i class="fas fa-arrow-right"></i>
                    <p class="compressSize">${object.compressSize}</p>
                </div>
            </div>
            ${oneHtml}
        </div>
    `;
};

document.querySelector('#uploadForm').addEventListener('change', async e => {
    const target = e.target;
    const files = target.files;
    const mimetype = files[0].type.split('/')[1];
    console.log(files);

    if (files.length >= 6) {
        alert('Maximum limit is 5');
    } else {
        document.querySelector('.box_wrapper').classList.remove('file_upload--canceled');
        document.querySelector('.image_wrapper img').setAttribute('src', `/img/${chooseMimetype(mimetype)}.png`);
        document.querySelector('.uploading').innerText = 'Uploading...';
        document.querySelector('.almostDone').innerText = '';
        document.querySelectorAll('.side-0 .growing-bar, .side-1 .growing-bar, .floor').forEach(cur => {
            cur.removeAttribute('style');
        });
        document.querySelector('.fileName').innerText = files.length === 1 ? files[0].name : files.length + ' files';
        document.querySelector('.box_wrapper').classList.add('file_upload--started');

        // APPEND FORM DATA
        const form = new FormData();
        Array.from(files).forEach((cur) => {
            form.append('file', cur);
        });

        try {
            const CancelToken = axios.CancelToken;
            const source = CancelToken.source();
            const res = await axios({
                method: 'POST',
                url: '/api/upload',
                data: form,
                cancelToken: source.token,
                onUploadProgress: progress => {
                    if (document.querySelector('.box_wrapper').className.includes('file_upload--canceled')) {
                        source.cancel();
                    }
                    const {total, loaded} = progress;
                    const totalSizeInMB = total / 1000000;
                    const loadedSizeInMB = loaded / 1000000;
                    const uploadPercentage = (loadedSizeInMB / totalSizeInMB) * 100;

                    document.querySelectorAll('.side-0 .growing-bar, .side-1 .growing-bar').forEach(cur => {
                        cur.setAttribute('style', `transform: translateY(${100 - uploadPercentage}%);`);
                    });
                    const above = uploadPercentage / 100 * 2 + 5;
                    document.querySelector('.floor')
                        .setAttribute('style', `transform: rotateX(-90deg) translateY(0em) translateZ(-${above}em) rotate(180deg);`);
                    document.querySelector('.uploadSize').innerText = `${loadedSizeInMB.toFixed(2)} MB /`;
                    document.querySelector('.totalSize').innerText = ` ${totalSizeInMB.toFixed(2)} MB`;

                    if (uploadPercentage === 100) {
                        document.querySelectorAll('.side-0 .growing-bar, .side-1 .growing-bar, .floor').forEach(cur => {
                            cur.removeAttribute('style');
                        });
                        document.querySelector('.box_wrapper').classList.add('file_compress--started');
                        document.querySelector('.almostDone').innerText = '99% Almost Done';
                        document.querySelector('.uploading').innerText = 'Compressing...';
                    }
                }
            });
            document.querySelector('.box_wrapper').classList.add('file_compress--finished');

            for (let [key, value] of Object.entries(res.data.data)) {
                const isOne = res.data.data.length === 1;
                document.querySelector('.bottom_wrapper').insertAdjacentHTML('beforebegin', HTML(value, isOne));
            }

            if (files.length === 1) {
                document.querySelector('.bottom_wrapper a').setAttribute('href', `/uploads/${res.data.data[0].filename}`);
            } else {
                document.querySelector('.bottom_wrapper a').setAttribute('href', `/uploads/${res.data.zipName}`);
                document.querySelector('.bottom_wrapper a').innerText = 'Download All';
            }

        } catch (err) {
            if (axios.isCancel(err)) {
                console.log('User canceled request');
            } else {
                console.log(err.response.data.message);
                if (err.response.data.message === 'File too large') {
                    console.log('request has been canceled');
                    document.querySelector('.close_arrow').click();
                }
            }
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
document.querySelectorAll('.close_arrow').forEach(cur => {
    cur.addEventListener('click', () => {
        document.querySelector('input[type="file"]').value = '';
        document.querySelector('.box_wrapper').classList.remove('file_upload--started');
        document.querySelector('.box_wrapper').classList.remove('file_compress--started');
        document.querySelector('.box_wrapper').classList.remove('file_compress--finished');
        document.querySelector('.box_wrapper').classList.add('file_upload--canceled');
        document.querySelectorAll('.side-0 .growing-bar, .side-1 .growing-bar, .floor').forEach(cur => {
            cur.removeAttribute('style');
        });
        if (document.querySelector('.middle_wrapper')) {
            document.querySelector('.middle_wrapper').remove();
        }
    })
});
