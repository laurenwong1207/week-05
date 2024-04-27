
// window.onload = function() {
//     fetchData();
// };
// Constants for different states and configurations
let EllipseState = 0; // Example state (unused in this code but may be needed)
let SquareState = 1; // Example state (unused in this code but may be needed)
let sizeW = 10; // Width of the shapes
let sizeH = 10; // Height of the shapes
let dataShow = []; // Array to hold the flowData objects

const colors = ["#1dff1a", "#ff7400"]; // Colors for particles

class flowData {
    constructor(curPos, targetPos, v, limitX, id,cat,textY) {
        this.currentPosition = curPos;
        this.targetPosition = targetPos;
        this.v = v;
        this.limitDownPosX = limitX;
        this.c = colors[id % colors.length]; // Ensure color selection wraps around
        this.id = id;
        this.cat=cat;
        this.textY=textY;
    }

    update() {
        if (this.currentPosition.x < this.limitDownPosX) {
            this.currentPosition.add(this.v);
        } else {
            this.v.y = (this.targetPosition.y - this.currentPosition.y) * 0.01;
            this.currentPosition.add(this.v);
        }
    }

    die() {
        return this.currentPosition.x > width - width * 1 / 15;
    }

    draw() {
        fill(this.c);
        noStroke();
        ellipse(this.currentPosition.x, this.currentPosition.y, sizeW, sizeH);
        fill(0);
        textSize(20);
        text(this.cat,width-100,this.textY);
    }
}


async function fetchData() {
    categoryWeights=[];
    dataShow=[];
    fetch('/data')
        .then(response => response.json())
        .then(data => {populateTable(data);prepareData(data);createParticles();})
        .catch(error => console.error('Error fetching data:', error));
    return 
}
let categoryWeights=[];
function prepareData(data) {
    // Convert data values to numbers and group by Type
    let groupedData = data.reduce((acc, cur) => {
        // Convert 'data' from string to number if necessary
        let value = parseInt(cur.data, 10);
        if (!acc[cur.Type]) {
            acc[cur.Type] = value;
        } else {
            acc[cur.Type] += value;
        }
        return acc;
    }, {});

    // Calculate the total to find weights
    let total = Object.values(groupedData).reduce((acc, cur) => acc + cur, 0);

    // Calculate weights based on the grouped data
    categoryWeights = Object.entries(groupedData).map(([category, value]) => ({
        category: category,
        weight: value / total
    }));

    console.log(categoryWeights);
    return categoryWeights;
}

function createParticles() {
    // Log categoryWeights to ensure it's what you expect
    console.log("Category Weights:", categoryWeights);
    if (categoryWeights.length === 0) return; // Check if categoryWeights is empty


    categoryWeights.forEach((cat, index) => {
        let particlesCount = floor(cat.weight * 100);
        console.log(cat.weight,particlesCount);
        for (let i = 0; i < particlesCount; i++) {
            let limitX = width * 0.8 / 2;
            let curPos = createVector(random(0, limitX), random(height / 12));
            let textY=height * index / categoryWeights.length+height/12;
            let targetPos = createVector(width, height * index / categoryWeights.length + random(height / 12));
            let v = createVector(random(2, 3), 0);
            let id = floor(random(0, colors.length));
            dataShow.push(new flowData(curPos, targetPos, v, limitX, id,cat.category,textY));
        }
    });
}

function setup() {
    let canvasContainer = document.querySelector('.canvas-container');
    let cw = canvasContainer.offsetWidth; // 获取容器的宽度
    let ch = canvasContainer.offsetHeight || 400; // 如果没有设置高度，默认为 400
    let canvas = createCanvas(cw, cw*0.5); // 创建画布
    canvas.parent(canvasContainer); // 将画布绑定到容器
    fetchData();
    createParticles();
    
}
function windowResized() {
    let canvasContainer = document.querySelector('.canvas-container');
    let cw = canvasContainer.offsetWidth; // 获取容器的宽度
    let ch = canvasContainer.offsetHeight || 400; // 如果没有设置高度，默认为 400
    resizeCanvas(cw,cw*0.5); // 调整大小以适应容器宽度，高度固定为 400px
}

function draw() {
    background(255);
    for (let i = dataShow.length - 1; i >= 0; i--) {
        let particle = dataShow[i];
        particle.update();
        particle.draw();
        if (particle.die()) {
            dataShow.splice(i, 1);
        }
    }
    if(frameCount%30==0){
        createParticles(categoryWeights);
    }
}

document.getElementById('addForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const type = document.getElementById('newType').value;
    const data = document.getElementById('newData').value;
    const formData = { Type: type, Data: data };
    console.log(JSON.stringify(formData),type,data);

    fetch('/add-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.ok) {
            alert('Row added successfully');
            fetchData(); // Reload the data to see the new row
            event.target.reset(); // Reset form fields after successful submission
        } else {
            throw new Error('Failed to add row');
        }
    })
    .catch(error => {
        alert('Error adding row: ' + error.message);
    });
});


function populateTable(data) {
    const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Clear existing rows
    data.forEach(item => {
        let row = tableBody.insertRow();
        let cellId = row.insertCell(0);
        cellId.textContent = item._id; // Display the MongoDB ObjectId as a string

        let cellType = row.insertCell(1);
        cellType.textContent = item.Type;

        let cellData = row.insertCell(2);
        cellData.textContent = item.data;

        let actionsCell = row.insertCell(3);
        actionsCell.innerHTML = `<button onclick="deleteRow('${item._id}')">Delete</button>`;
    });
}


function deleteRow(id) {
    fetch(`/data/${id}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete');
            }
            return response.text();
        })
        .then(msg => {
            alert(msg);
            fetchData(); // Refresh data to reflect deletion
        })
        .catch(error => {
            console.error('Error deleting data:', error);
            alert('Failed to delete data: ' + error.message);
        });
}

function uploadFile() {
    const formData = new FormData();
    const fileInput = document.getElementById('fileInput');
    formData.append('excelFile', fileInput.files[0]);

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (response.ok) {
            alert('File uploaded successfully.');
            loadCollections();  // Reload collections to include the new one
        } else {
            response.text().then(text => alert('Failed to upload file: ' + text));
        }
    })
    .catch(error => alert('Error uploading file: ' + error));
}

