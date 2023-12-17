(function () {
var ctx_conv_id = null;
var ctx_post_inc = 0;
var ctx_post_seq_nr = 0;
var ctx_reply_seq_nr = 0;
//var ctx_reply_chunk_nr = null;
var ctx_poll_req = null;
var ctx_nox = false;
(function () {
  var cookies = document.cookie.split("; ");
  // FIXME
  if (cookies[0] == "nox=1") {
    var body = document.querySelector("body");
    var dntoggle = document.querySelector("#dntoggle");
    body.classList.add("nox");
    dntoggle.textContent = "[n]";
    ctx_nox = true;
    document.cookie = "nox=1";
  }
})();
var on_keydown = function (e) {
  if ((e.which || e.keyCode || 0) === 13 && !e.shiftKey) {
    e.preventDefault();
    e.target.form.dispatchEvent(new Event("submit", {cancelable: true}));
  }
};
document.querySelector("#ask")
  .addEventListener("keydown", on_keydown);
var fresh_hi = function () {
  var req = new XMLHttpRequest();
  req.open("POST", "{{host}}/wapi/hi", true);
  req.onreadystatechange = function () {
    if (req.readyState == 4 && req.status == 201) {
      console.log("hi " + req.status);
      var rep = JSON.parse(req.response);
      console.log("hi: seq_nr=" + rep.seq_nr);
      // FIXME: initialize ctx.
      ctx_post_seq_nr = rep.seq_nr;
    }
  };
  req.send();
};
/*var fresh_poll = function () {
  var req = new XMLHttpRequest();
  req.open("POST", "{{host}}/wapi/poll", true);
  req.onreadystatechange = function () {
    if (req.readyState == 4 && req.status == 201) {
      var rep = JSON.parse(req.response);
      // TODO TODO
    }
  };
  // FIXME: params?
  req.send();
};*/
/*var fresh_post = function () {
  var req = new XMLHttpRequest();
  req.open("POST", "{{host}}/wapi/post", true);
  req.onreadystatechange = function () {
    if (req.readyState == 4 && req.status == 201) {
      var rep = JSON.parse(req.response);
      // TODO TODO
    }
  };
  // FIXME: params?
  req.send();
};*/
var on_submit = function (e) {
  e.preventDefault();
  console.log("Ask and ye shall receive.");
  if (!ctx_post_seq_nr) {
    fresh_hi();
  }
  var params = new URLSearchParams(new FormData(document.querySelector("#ask")));
  var req = new XMLHttpRequest();
  req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  req.overrideMimeType("application/json");
  req.open("POST", "{{host}}/wapi/post", true);
  req.onreadystatechange = function () {
    if (req.readyState == 4 && req.status == 201) {
      var rep = JSON.parse(req.response);
      console.log("post: res=" + rep.res);
      // TODO TODO
    }
  };
  req.send(params);
  /*
  var post_req = new XMLHttpRequest();
  post_req.addEventListener("load", function (e) {
  });
  post_req.open("POST", "{{host}}/wapi/post");
  post_req.send();
  // TODO TODO: long polling for reply.
  ctx_poll_req = new XMLHttpRequest();
  while (true) {
    ctx_poll_req.readystatechange = function () {
    };
    ctx_poll_req.open("POST", "{{host}}/wapi/poll");
    ctx_poll_req.send();
  }
  */
};
document.querySelector("#ask")
  .addEventListener("submit", on_submit);
var on_dntoggle = function (e) {
  e.preventDefault();
  var body = document.querySelector("body");
  var dntoggle = document.querySelector("#dntoggle");
  if (ctx_nox) {
    body.classList.remove("nox");
    dntoggle.textContent = "[d]";
    ctx_nox = false;
    document.cookie = "nox=0";
  } else {
    body.classList.add("nox");
    dntoggle.textContent = "[n]";
    ctx_nox = true;
    document.cookie = "nox=1";
  }
  if (document.activeElement == dntoggle) {
    dntoggle.blur();
  }
};
document.querySelector("#dntoggle")
  .addEventListener("click", on_dntoggle);
(function () {
  var tmp = document.querySelector("#outtemplate");
  //console.log(tmp.id);
  var tmp2 = tmp.cloneNode(true);
  tmp2.removeAttribute("id");
  tmp2.querySelector(".outnr").textContent = "2";
  tmp2.querySelector(".outvalue").textContent = "Hello world!";
  var chat = document.querySelector("#chat");
  chat.appendChild(tmp2);
})();
if (!ctx_post_seq_nr) {
  fresh_hi();
}
renderMathInElement(
    document.querySelector("#chat"),
    { delimiters:
      [{left: "$$", right: "$$", display: true},
       {left: "$", right: "$", display: false},
       {left: "\\(", right: "\\)", display: false},
       {left: "\\[", right: "\\]", display: true}]
    }
);
})();
