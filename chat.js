(function () {
document.querySelector("#ask")
  .addEventListener("keydown", function (e) {
    if ((e.which || e.keyCode || 0) === 13 && !e.shiftKey) {
      e.preventDefault();
      e.target.form.dispatchEvent(new Event("submit", {cancelable: true}));
    }
  });
renderMathInElement(
    document.querySelector("#chat"),
    { delimiters:
      [{left: "$$", right: "$$", display: true},
       {left: "$", right: "$", display: false},
       {left: "\\(", right: "\\)", display: false},
       {left: "\\[", right: "\\]", display: true}]
    }
);
/*
var req = new XMLHttpRequest();
//req.addEventListener("load", _);
req.open("GET", "");
req.send();
*/
var tmp = document.querySelector("#outtemplate");
//console.log(tmp.id);
var tmp2 = tmp.cloneNode(true);
tmp2.removeAttribute("id");
tmp2.querySelector(".nr").textContent = "3";
var chat = document.querySelector("#chat");
chat.appendChild(tmp2);
})();
