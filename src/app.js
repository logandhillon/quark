window.addEventListener("DOMContentLoaded", function () {
    loadBlocks();

    document.body.addEventListener('click', function (e) {
        if (!e.target.classList.contains('tooltip')) {
            Array.from(document.getElementsByClassName("active-tooltip")).forEach(element => {
                element.classList.add("invisible");
                element.classList.remove("active-tooltip");
            });
        }
    });
});

function toggleTooltip(id) {
    const e = document.getElementById("tooltip-" + id);
    e.classList.toggle("invisible");

    Array.from(document.getElementsByClassName("active-tooltip")).forEach(element => {
        element.classList.add("invisible");
        element.classList.remove("active-tooltip");
    });

    setTimeout(function () {
        e.classList.add("active-tooltip");
    }, 50);
}

function loadBlocks() {
    fetch("res/blocks.json")
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                if (item['group'] == "events") return;
                const wrapper = document.createElement("div");
                wrapper.className = "block-wrapper";

                const btnAdd = document.createElement("button");
                btnAdd.type = "button";
                btnAdd.setAttribute("onclick", `addBlock("${item['id']}")`);
                const iconAdd = document.createElement("i");
                iconAdd.className = "fa-solid fa-plus";
                btnAdd.appendChild(iconAdd);

                const block = document.createElement("div");
                block.id = item['id'];
                block.className = `block block-${item['group']} ${item['id']}`;
                const parts = item['name'].split("{}");
                let i = 0;
                parts.forEach(part => {
                    if (i > 0) {
                        const inp = document.createElement("input");
                        inp.placeholder = item['args'][`${i - 1}`];
                        block.appendChild(inp);
                    }
                    block.appendChild(document.createTextNode(part));
                    i++;
                });

                const btnInfo = document.createElement("button");
                btnInfo.type = "button";
                btnInfo.setAttribute("onclick", `toggleTooltip("${item['id']}")`);
                const iconInfo = document.createElement("i");
                iconInfo.className = "fa-solid fa-info";
                btnInfo.appendChild(iconInfo);

                const tooltip = document.createElement("div");
                tooltip.innerText = item['tooltip'];
                tooltip.className = "tooltip invisible";
                tooltip.id = 'tooltip-' + item['id'];

                wrapper.appendChild(block);
                wrapper.appendChild(btnInfo);
                wrapper.appendChild(tooltip);
                wrapper.appendChild(btnAdd);

                document.getElementById("tab-" + item['group']).appendChild(wrapper);
            });
        })
        .catch(e => console.error(e))
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let prevId = null;

function addBlock(id) {
    const uuid = generateUUID();
    const wrapper = document.createElement("div");
    wrapper.className = "block-wrapper";
    wrapper.id = uuid;

    const btnAdd = document.createElement("button");
    btnAdd.type = "button";
    btnAdd.setAttribute("onclick", `removeBlock("${uuid}")`);
    const iconAdd = document.createElement("i");
    iconAdd.className = "fa-solid fa-minus";
    btnAdd.appendChild(iconAdd);

    const block = document.getElementById(id).cloneNode(true);

    if (prevId != null) {
        const prevBlock = document.getElementById(prevId);
        const prevArgs = Array.from(prevBlock.querySelectorAll("input"));
        const args = Array.from(block.querySelectorAll("input"));

        prevArgs.forEach(prevArg => {
            args.forEach(arg => {
                if (prevArg.placeholder == arg.placeholder) {
                    arg.value = prevArg.value;
                }
            });
        });
    }

    wrapper.appendChild(block);
    wrapper.appendChild(btnAdd);

    editor.appendChild(wrapper);

    prevId = uuid;
}

function removeBlock(id) {
    document.getElementById(id).remove();
}

function execute() {
    document.getElementById("btn-play-spin").classList.toggle("hide", false);
    document.getElementById("btn-play-icon").classList.toggle("hide", true);
    const status = document.getElementById("status");

    status.innerText = "Preparing script..."

    const script = {};
    let i = 0;
    Array.from(document.getElementById("editor").children).forEach(element => {
        script[`${i}`] = packBlockToJson(element.id);
        i++;
    });

    status.innerText = "Executing...";

    fetch("http://localhost:8080/process", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        mode: 'no-cors',
        body: JSON.stringify(script)
    })
        .then(response => response.json())
        .then(data => {
            status.innerText = "Done!"
            setTimeout(function () {
                status.innerText = "";
            }, 1000)

            document.getElementById("btn-play-spin").classList.toggle("hide", true);
            document.getElementById("btn-play-icon").classList.toggle("hide", false);
        })
        .catch(e => {
            console.error(e);
            status.innerText = "Something went wrong."

            setTimeout(function () {
                status.innerText = "";
            }, 1000)

            document.getElementById("btn-play-spin").classList.toggle("hide", true);
            document.getElementById("btn-play-icon").classList.toggle("hide", false);
        });
}

function packBlockToJson(id) {
    console.log("Attempting to pack " + id)
    const block = document.getElementById(id).querySelector(".block");
    const argElements = block.querySelectorAll("input");

    const args = {};

    let i = 0;
    Array.from(argElements).forEach(element => {
        args[`${i}`] = {
            value: element.value
        }
    });

    return {
        id: block.id,
        args: args
    }
}