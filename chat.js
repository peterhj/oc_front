(function () {
var ctx_conv_id = null;
var ctx_post_inc = 0;
var ctx_post_seq_nr = 0;
var ctx_reply_seq_nr = 0;
//var ctx_reply_chunk_nr = null;
var on_keydown = function (e) {
  if ((e.which || e.keyCode || 0) === 13 && !e.shiftKey) {
    e.preventDefault();
    e.target.form.dispatchEvent(new Event("submit", {cancelable: true}));
  }
};
document.querySelector("#ask")
  .addEventListener("keydown", on_keydown);
var poll_req = null;
var on_submit = function (e) {
  e.preventDefault();
  console.log("Ask and ye shall receive.");
  if (!ctx_post_seq_nr) {
    var hi_req = new XMLHttpRequest();
    hi_req.addEventListener("load", function (e) {
      console.log("hi");
    });
    hi_req.open("POST", "{{host}}/wapi/hi");
    hi_req.send();
  }
  /*
  var post_req = new XMLHttpRequest();
  post_req.addEventListener("load", function (e) {
  });
  post_req.open("POST", "{{host}}/wapi/post");
  post_req.send();
  // TODO TODO: long polling for reply.
  poll_req = new XMLHttpRequest();
  while (true) {
    poll_req.readystatechange = function () {
    };
    poll_req.open("POST", "{{host}}/wapi/poll");
    poll_req.send();
  }
  */
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
var tmp = document.querySelector("#outtemplate");
//console.log(tmp.id);
var tmp2 = tmp.cloneNode(true);
tmp2.removeAttribute("id");
tmp2.querySelector(".nr").textContent = "3";
var chat = document.querySelector("#chat");
chat.appendChild(tmp2);
if (!ctx_post_seq_nr) {
  var hi_req = new XMLHttpRequest();
  hi_req.open("POST", "{{host}}/wapi/hi", true);
  /*hi_req.addEventListener("load", function (e) {
    console.log("hi");
  });*/
  hi_req.onreadystatechange = function () {
    if (hi_req.readyState == 4) {
      console.log("hi " + hi_req.status);
      (function (rep) {
        console.log("hi: seq_nr=" + rep.seq_nr);
      })(JSON.parse(hi_req.response));
    }
  };
  hi_req.send();
}
})();
