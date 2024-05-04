var editor = undefined;

window.addEventListener("DOMContentLoaded", function() {
    editor = document.getElementById("editor");
});

function addBlock() {
    var block = document.createElement("div");
    block.className = "block";
    block.textContent = "hello world";
    
    editor.appendChild(block);
}
