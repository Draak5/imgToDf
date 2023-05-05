
function toHex(r,g,b) {
    const hex = (((r << 16) | (g << 8) | b).toString(16));
    return "§"+("x"+hex).split('').join('§');
}

function getPixelColor(x, y, imageData) {
    const i = (y * imageData.width + x) * 4;
    if (imageData.data[i+3] == 0) return "§l  ";
    return toHex(imageData.data[i], imageData.data[i+1], imageData.data[i+2])+"■ ";
}

function parseImage() {
    const fileOutput = document.getElementById('outputBox');
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    const reader = new FileReader();

    reader.onload = () => {
        const imageData = reader.result;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            let final = ["", "", "", ""];
            
            for (let y = 0; y < img.height; y += 2) {
                for (let x = 0; x < img.width; x += 2) {
                    final[0] += getPixelColor(x, y, imageData)
                    final[1] += getPixelColor(x+1, y, imageData)
                    final[2] += getPixelColor(x, y+1, imageData)
                    final[3] += getPixelColor(x+1, y+1, imageData)
                }
                final.map(i => "${i}\\n")
            }

            console.log(toJSON(final))

            final.map(i => "\"${i}\"");
            
            console.log(final.join("\","))
            fileOutput.innerText = final.join("\",");
        }

        img.src = imageData;

    }

    reader.readAsDataURL(file);

}

function toJSON(x) {
    let items = [];
    x.forEach((_, i) => 
        items.push({
            "item": {
                "id": "txt",
                "data": {
                    "name": i
                }
            },
            "slot": _+1
        }));


    let json = {
        "blocks": [
            {
                "id": "block",
                "block": "func",
                "data": "something",
                "args": {
                "items": [
                    {
                    "item": {
                        "id": "bl_tag",
                        "data": {
                        "option": "False",
                        "tag": "Is Hidden",
                        "action": "dynamic",
                        "block": "func"
                        }
                    },
                    "slot": 26
                    }
                ]
                }
            },
            {
                "id": "block",
                "block": "set_var",
                "args": {
                "items": [
                    {
                        "item": {
                            "id": "var",
                            "data": {
                                "name": "textures",
                                "scope": "local"
                            }
                        },
                        "slot": 0
                    }
                ]
                },
                "action": "CreateList"
            }
        ]
    }
    
    items.forEach(i => json.blocks[1].args.items.push(i));

    console.log(json);

    // compress with gzip
    
    let jsonString = JSON.stringify(json);

    const utf8Encoder = new TextEncoder();
    const data = utf8Encoder.encode(jsonString);

    const compressedData = pako.gzip(data);
    
    const base64Encoder = new TextEncoder();
    const base64Data = base64Encoder.encode(compressedData);
    const compressedString = String.fromCharCode.apply(null, base64Data);
    
    console.log(compressedString);
    

    return;
    zlib.gzip(jsonString, (err, compressedData) => {
        if (err) console.log(err);
        else console.log(compressedData.toString("base64"));
    })
    
}


function copyToClipboard() {
    const dynamicText = document.getElementById("outputBox").textContent;

    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = dynamicText;
    
    document.body.appendChild(tempTextArea);
    tempTextArea.select();

    document.execCommand("copy");
    document.body.removeChild(tempTextArea);
}
