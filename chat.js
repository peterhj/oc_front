(function () {
var ctx_nox = false;
var ctx_conv_id = null;
var ctx_post_inc = 0;
var ctx_post_seq_nr = 0;
var ctx_reply_seq_nr = 0;
//var ctx_reply_chunk_nr = null;
var ctx_poll_req = null;
var ctx_ex_texts = [];
var ctx_post_texts = [null];
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
var post_sys = function (nr, content) {
  var chat = document.querySelector("#chat");
  var tmp = document.querySelector("#systemplate");
  var tmp2 = tmp.cloneNode(true);
  tmp2.removeAttribute("id");
  tmp2.querySelector(".sysvalue").textContent = content;
  render_latex(tmp2);
  chat.appendChild(tmp2);
  window.scrollTo(0, document.body.scrollHeight);
  if (nr < ctx_post_texts.length) {
    ctx_post_texts[nr] = content;
  } else {
    // FIXME: resize null or "".
    ctx_post_texts.push(content);
  }
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
  window.scrollTo(0, document.body.scrollHeight);
  if (nr < ctx_post_texts.length) {
    ctx_post_texts[nr] = content;
  } else {
    // FIXME: resize null or "".
    ctx_post_texts.push(content);
  }
};
var post_out = function (nr, prefix, contents) {
  var chat = document.querySelector("#chat");
  var tmp = document.querySelector("#outtemplate");
  var tmp2 = tmp.cloneNode(true);
  tmp2.removeAttribute("id");
  tmp2.querySelector(".outnr").textContent = "" + nr;
  tmp2.querySelector(".outprefix").textContent = prefix;
  //tmp2.querySelector(".outvalue").textContent = content;
  for (var idx = 0; idx < contents.length; idx++) {
    var content = contents[idx];
    if (idx > 0) {
      tmp2.querySelector(".outvalue").appendChild(document.createElement("br"));
    }
    tmp2.querySelector(".outvalue").appendChild(document.createTextNode(content));
  }
  //tmp2.querySelector(".outsuffix").textContent = suffix;
  render_latex(tmp2);
  chat.appendChild(tmp2);
  window.scrollTo(0, document.body.scrollHeight);
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
var req_hi = function () {
  var req = new XMLHttpRequest();
  req.open("POST", "{{host}}/wapi/hi", true);
  req.onreadystatechange = function () {
    if (req.readyState == 4 && req.status == 201) {
      //console.log("hi " + req.status);
      var rep = JSON.parse(req.response);
      //console.log("hi: seq_nr=" + rep.seq_nr);
      // FIXME: initialize ctx.
      ctx_post_seq_nr = rep.seq_nr;
    }
  };
  req.send();
};
/*var req_poll = function () {
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
var fresh = function () {
  req_hi();
  ctx_post_texts = [null];
  // FIXME: clear #chat.
};
var req_post = function (params) {
  var req = new XMLHttpRequest();
  req.overrideMimeType("application/json");
  req.open("POST", "{{host}}/wapi/post", true);
  req.setRequestHeader("Content-Type", "application/json");
  req.onreadystatechange = function () {
    if (req.readyState == 4 && req.status != 201) {
      post_sys(params.seq_nr, "[Server unresponsive, please retry your request.]");
    } else if (req.readyState == 4 && req.status == 201) {
      var rep = JSON.parse(req.response);
      //console.log("post: err=" + rep.err);
      // TODO TODO
      if (rep.err) {
        post_out(params.seq_nr, "[Exception: DecodeError: please see highlighted text (above)]", []);
        //console.log("post:   mark start=" + rep.mrk_s + " end=" + rep.mrk_e);
        var last = document.querySelectorAll(".in_value")[params.seq_nr];
        var text = ctx_post_texts[params.seq_nr].concat(" ");
        var prefix = text.slice(0, rep.mrk_s);
        var mrk_e = rep.mrk_e;
        if (rep.mrk_s == mrk_e) {
          mrk_e += 1;
        }
        var pat = text.slice(rep.mrk_s, mrk_e);
        var suffix = text.slice(mrk_e);
        last.innerHTML = prefix.concat("<span class=\"in_mrk\">", pat, "</span>", suffix);
        render_latex(last);
      } else {
        post_out(params.seq_nr, "[OK]", rep.val);
      }
    }
  };
  req.send(JSON.stringify(params));
};
var on_submit = function (e) {
  e.preventDefault();
  //console.log("Ask and ye shall receive.");
  if (!ctx_post_seq_nr) {
    req_hi();
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
  req_post(params);
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
  req_hi();
}
var on_example = function (idx) {
  return function (e) {
    e.preventDefault();
    if (!ctx_post_seq_nr) {
      req_hi();
    }
    var params = {};
    params["q"] = ctx_ex_texts[idx];
    // FIXME: ctx step.
    params["seq_nr"] = ctx_post_seq_nr;
    ctx_post_seq_nr += 1;
    post_in_(params.seq_nr, params.q || "");
    req_post(params);
  };
};
(function () {
  var examples = document.querySelector("#examples");
  var ex_vals = examples.querySelectorAll(".ex_value");
  for (var idx = 0; idx < ex_vals.length; idx++) {
    var s = ex_vals[idx].textContent.trim();
    console.log("DEBUG: ex[" + idx + "]=" + s);
    ctx_ex_texts.push(s);
  }
  var a_s = examples.querySelectorAll("a");
  for (var idx = 0; idx < a_s.length; idx++) {
    console.log("DEBUG: a[" + idx + "]");
    a_s[idx].addEventListener("click", on_example(idx));
  }
  render_latex(examples);
})();
})();
