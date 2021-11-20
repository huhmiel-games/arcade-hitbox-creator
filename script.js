document.addEventListener('DOMContentLoaded', () => {
    const imgInput = document.getElementById('imageInput');

    const genBtn = document.getElementById('generateButton');

    const cancelBtn = document.getElementById('cancelButton');

    const zoomInput = document.getElementById('zoom');

    const canvasWrapper = document.getElementById('canvas-wrapper');

    const zoomLabel = document.getElementById('zoom-value');

    const rectangleSelector = document.getElementById('rectangle');
    const circleSelector = document.getElementById('circle');

    const width = window.innerWidth || document.documentElement.clientWidth ||
        document.body.clientWidth;

    const height = window.innerHeight || document.documentElement.clientHeight ||
        document.body.clientHeight;

    let zoom = 5;


    const data = {};

    const divElements = [];

    let currentFileName = '';

    // handle zoom
    zoomInput.addEventListener('change', () => {
        zoom = +zoomInput.value;
        zoomLabel.innerHTML = zoomInput.value;
    });

    // handle the hitboxType, rectangle by default
    let hitboxType = document.querySelector('input[name="hitboxType"]:checked').value;

    rectangleSelector.addEventListener('click', () => {
        hitboxType = document.querySelector('input[name="hitboxType"]:checked').value;
    });

    circleSelector.addEventListener('click', () => {
        hitboxType = document.querySelector('input[name="hitboxType"]:checked').value;
    });

    // handle cancel
    cancelBtn.addEventListener('click', () => {
        if(divElements.length) {
            const length = divElements.length;

            canvasWrapper.removeChild(canvasWrapper.lastChild);

            divElements.pop();

            data[currentFileName].hitboxes.pop();
        }
    });

    // Load an image
    imgInput.addEventListener('change', (e) => {
        if(e.target.files) {
            const imageFile = e.target.files[0]; //here we get the image file

            currentFileName = imageFile.name.split('.')[0];

            const reader = new FileReader();

            reader.readAsDataURL(imageFile);

            reader.onloadend = (e) => {
                let myImage = new Image(); // Creates image object

                data[currentFileName] = {}
                data[currentFileName].hitboxes = [];

                myImage.src = e.target.result; // Assigns converted image to image object

                myImage.onload = (ev) => {
                    const myCanvas = document.getElementById("myCanvas"); // Creates a canvas object

                    const myContext = myCanvas.getContext("2d"); // Creates a contect object


                    if(myImage.height * zoom > height || myImage.width * zoom > width) {

                        alert(("zoom too high, decrease it".toUpperCase()));
                        zoomInput.disabled = false;
                        imgInput.value = [];
                        return;
                    }

                    myCanvas.width = myImage.width * zoom; // Assigns image's width to canvas

                    myCanvas.height = myImage.height * zoom; // Assigns image's height to canvas

                    myContext.imageSmoothingEnabled = false;

                    myContext.drawImage(myImage, 0, 0, myImage.width * zoom, myImage.height * zoom); // Draws the image on canvas

                    const imgData = myCanvas.toDataURL("image/jpeg", 0.75); // Assigns image base64 string in jpeg format to a variable

                    initDraw(document.getElementById('canvas-wrapper'));
                }
            }

            zoomInput.disabled = true;
        }
    });

    // export to JSON on a new tab
    genBtn.addEventListener('click', (e) => {
        const result = JSON.stringify(data);

        const blob = new Blob([result], {type: 'text/html'});

        window.open(URL.createObjectURL(blob));
    });


    /**
     * Draw a hitbox
     */
    function initDraw() {
        var mouse = {
            x: 0,
            y: 0,
            startX: 0,
            startY: 0
        };

        function setMousePosition(e) {
            var ev = e || window.event; //Moz || IE

            if(ev.pageX) { //Moz
                mouse.x = ev.pageX + window.pageXOffset;
                mouse.y = ev.pageY + window.pageYOffset;
            }
            else if(ev.clientX) { //IE
                mouse.x = ev.clientX + document.body.scrollLeft;
                mouse.y = ev.clientY + document.body.scrollTop;
            }
        };

        var element = null;

        canvasWrapper.onmousemove = (e) => {
            setMousePosition(e);

            if(element !== null && hitboxType === 'rectangle') {
                element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
                element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
                element.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
                element.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
            }

            if(element !== null && hitboxType === 'circle') {
                element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
                element.style.height = Math.abs(mouse.x - mouse.startX) + 'px';
                element.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
                element.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
            }
        }

        canvasWrapper.onclick = (e) => {

            if(element !== null) {
                element = null;

                canvasWrapper.style.cursor = "default";

                let hitbox = {
                    frame: currentFileName,
                    type: hitboxType,
                    x: Math.round(mouse.startX / zoom),
                    y: Math.round(mouse.startY / zoom),
                    width: Math.round(Math.abs(mouse.startX - mouse.x) / zoom),
                    height: hitboxType === 'rectangle' ? Math.round(Math.abs(mouse.startY - mouse.y) / zoom) : Math.round(Math.abs(mouse.startX - mouse.x) / zoom)
                }

                data[`${currentFileName}`].hitboxes.push(hitbox);
            }
            else {
                console.log("begun.");
                mouse.startX = mouse.x;
                mouse.startY = mouse.y;

                element = document.createElement('div');
                element.className = hitboxType === 'rectangle' ? 'rectangle' : 'circle';
                element.style.left = mouse.x + 'px';
                element.style.top = mouse.y + 'px';

                divElements.push(element);

                canvasWrapper.appendChild(element)
                canvasWrapper.style.cursor = "crosshair";
            }
        }
    }
});


