(function () {
var on_keydown = function (e) {
  if ((e.which || e.keyCode || 0) === 13 && !e.shiftKey) {
    e.preventDefault();
    e.target.form.dispatchEvent(new Event("submit", {cancelable: true}));
  }
  /*document.querySelector("#ask")
    .addEventListener("keydown", on_keydown);*/
};
document.querySelector("#ask")
  .addEventListener("keydown", on_keydown);
var on_submit = function (e) {
  e.preventDefault();
  console.log("Ask and ye shall receive.");
  /*document.querySelector("#ask")
    .addEventListener("submit", on_submit);*/
};
document.querySelector("#ask")
  .addEventListener("submit", on_submit);
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
var hi_req = new XMLHttpRequest();
hi_req.addEventListener("load", function (e) {
});
hi_req.open("POST", "{{host}}/api/hi");
hi_req.send();
*/
var tmp = document.querySelector("#outtemplate");
//console.log(tmp.id);
var tmp2 = tmp.cloneNode(true);
tmp2.removeAttribute("id");
tmp2.querySelector(".nr").textContent = "3";
var chat = document.querySelector("#chat");
chat.appendChild(tmp2);
})();
