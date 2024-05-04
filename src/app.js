var editor = undefined;

window.addEventListener("DOMContentLoaded", function() {
    editor = document.getElementById("editor");

    loadBlocks();
});

function loadBlocks() {
    fetch("res/blocks.json")
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                console.log(item);

                const wrapper = document.createElement("div");
                wrapper.className = "block-wrapper";

                const btnAdd = document.createElement("button");
                btnAdd.type = "button";
                btnAdd.setAttribute("onclick", "addBlock()");
                const iconAdd = document.createElement("i");
                iconAdd.className = "fa-solid fa-plus";
                btnAdd.appendChild(iconAdd);

                const block = document.createElement("div");
                block.className = "block";
                block.textContent = item['name'];

                wrapper.appendChild(block);
                wrapper.appendChild(btnAdd);

                document.getElementById("tab-"+item['group']).appendChild(wrapper);
            });
        })
        .catch(e => console.error(e))
}

function addBlock() {
    var block = document.createElement("div");
    block.className = "block";
    block.textContent = "hello world";
    
    editor.appendChild(block);
}
