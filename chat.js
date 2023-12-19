(function () {
var ctx_conv_id = null;
var ctx_post_inc = 0;
var ctx_post_seq_nr = 0;
var ctx_reply_seq_nr = 0;
//var ctx_reply_chunk_nr = null;
var ctx_poll_req = null;
var ctx_nox = false;
var day = function () {
  var body = document.querySelector("body");
  var dntoggle = document.querySelector("#dntoggle");
  body.classList.remove("nox");
  dntoggle.textContent = "[d]";
  ctx_nox = false;
  document.cookie = "nox=0";
};
var nox = function () {
  var body = document.querySelector("body");
  var dntoggle = document.querySelector("#dntoggle");
  body.classList.add("nox");
  dntoggle.textContent = "[n]";
  ctx_nox = true;
  document.cookie = "nox=1";
};
var render_latex = function (elem) {
  renderMathInElement(
      elem,
      { delimiters:
        [{left: "$$", right: "$$", display: true},
         {left: "$", right: "$", display: false},
         {left: "\\(", right: "\\)", display: false},
         {left: "\\[", right: "\\]", display: true}]
      }
  );
};
var post_in_ = function (nr, content) {
  var chat = document.querySelector("#chat");
  var tmp = document.querySelector("#in_template");
  var tmp2 = tmp.cloneNode(true);
  tmp2.removeAttribute("id");
  tmp2.querySelector(".in_nr").textContent = "" + nr;
  tmp2.querySelector(".in_value").textContent = content;
  render_latex(tmp2);
  chat.appendChild(tmp2);
};
var post_out = function (nr, prefix, content) {
  var chat = document.querySelector("#chat");
  var tmp = document.querySelector("#outtemplate");
  var tmp2 = tmp.cloneNode(true);
  tmp2.removeAttribute("id");
  tmp2.querySelector(".outnr").textContent = "" + nr;
  tmp2.querySelector(".outprefix").textContent = prefix;
  tmp2.querySelector(".outvalue").textContent = content;
  //tmp2.querySelector(".outsuffix").textContent = suffix;
  render_latex(tmp2);
  chat.appendChild(tmp2);
};
(function () {
  var cookies = document.cookie.split("; ");
  // FIXME
  if (cookies[0] == "nox=1") {
    nox();
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
var on_submit = function (e) {
  e.preventDefault();
  console.log("Ask and ye shall receive.");
  if (!ctx_post_seq_nr) {
    fresh_hi();
  }
  var ask = document.querySelector("#ask");
  // FIXME: test empy.
  if (ask.querySelector("textarea").value.length <= 0) {
    return;
  }
  var params = {};
  var form = new FormData(ask);
  form.forEach(function (val, key) {
    params[key] = val;
  });
  // FIXME: ctx step.
  params["seq_nr"] = ctx_post_seq_nr;
  ctx_post_seq_nr += 1;
  post_in_(params.seq_nr, params.q || "");
  ask.querySelector("textarea").value = "";
  var req = new XMLHttpRequest();
  req.overrideMimeType("application/json");
  req.open("POST", "{{host}}/wapi/post", true);
  req.setRequestHeader("Content-Type", "application/json");
  req.onreadystatechange = function () {
    if (req.readyState == 4 && req.status == 201) {
      var rep = JSON.parse(req.response);
      console.log("post: err=" + rep.err);
      // TODO TODO
      if (rep.err) {
        post_out(params.seq_nr, "[debug: Exception: SyntaxError]", "");
        console.log("post:   mark start=" + rep.mrk_s + " end=" + rep.mrk_e);
        //var last = document.querySelectorAll(".in_value")[params.seq_nr - 1];
      } else {
        post_out(params.seq_nr, "[debug: OK]", "");
      }
    }
  };
  req.send(JSON.stringify(params));
  /*
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
  if (ctx_nox) {
    day();
  } else {
    nox();
  }
  var dntoggle = document.querySelector("#dntoggle");
  if (document.activeElement == dntoggle) {
    dntoggle.blur();
  }
};
document.querySelector("#dntoggle")
  .addEventListener("click", on_dntoggle);
if (!ctx_post_seq_nr) {
  fresh_hi();
}
render_latex(document.querySelector("#chat"));
})();
