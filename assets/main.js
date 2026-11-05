(function(){
  var S = window.SITE, page = document.body.dataset.page || "";
  var links = [["index.html","Home","home"],["about.html","About","about"],["programs.html","Programs","programs"],["faq.html","FAQ & Contact","faq"]];
  var nav = links.map(function(l){return '<a href="'+l[0]+'"'+(l[2]===page?' aria-current="page"':'')+'>'+l[1]+'</a>'}).join("");
  document.getElementById("site-header").innerHTML =
    '<header class="site"><div class="wrap"><a class="brand" href="index.html">'+S.name+'</a>'+
    '<button class="menu" aria-label="Menu" aria-expanded="false">Menu</button>'+
    '<nav>'+nav+'<a class="btn" href="register.html" style="color:#fff;margin-left:16px;padding:8px 18px">Register</a></nav></div></header>';
  var m = document.querySelector(".menu"), n = document.querySelector("header nav");
  m.onclick = function(){var o=n.classList.toggle("open");m.setAttribute("aria-expanded",o)};
  document.getElementById("site-footer").innerHTML =
    '<footer class="site"><div class="wrap"><strong>'+S.name+'</strong><br>'+S.location+'<br>'+
    '<a href="tel:'+S.phone.replace(/\s/g,"")+'">'+S.phone+'</a> · <a href="mailto:'+S.email+'">'+S.email+'</a>'+
    '<p style="margin-top:12px;font-size:.9rem">© '+new Date().getFullYear()+' '+S.name+'</p></div></footer>';
  document.querySelectorAll("[data-site]").forEach(function(el){el.textContent=S[el.dataset.site]});
  var money = function(v){return S.currency+" "+v.toLocaleString()};
  var list = document.getElementById("program-list");
  if(list) list.innerHTML = S.programs.map(function(p){
    return '<article class="card"><span class="tag">'+p.ages+'</span><span class="tag">'+p.level+'</span><h3>'+p.name+'</h3><p>'+p.desc+
      '</p><p><strong>When:</strong> '+p.schedule+'<br><strong>Class size:</strong> up to '+p.spots+'</p>'+
      '<p class="price">'+money(p.price)+'</p><a class="btn" href="register.html?program='+p.id+'">Register</a></article>'}).join("");
  var sel = document.getElementById("program");
  if(sel){
    sel.innerHTML = '<option value="">Choose a program…</option>'+S.programs.map(function(p){
      return '<option value="'+p.id+'">'+p.name+' ('+p.ages+') - '+money(p.price)+' - '+p.schedule+'</option>'}).join("");
    var q = new URLSearchParams(location.search).get("program"); if(q) sel.value = q;
    var f = document.getElementById("reg-form");
    f.addEventListener("submit", function(e){
      e.preventDefault();
      var d = Object.fromEntries(new FormData(f)), p = S.programs.find(function(x){return x.id===d.program});
      var msg = ["New swim registration","Program: "+p.name+" ("+p.schedule+") - "+money(p.price),
        "Swimmer: "+d.swimmer+", age "+d.age,"Swimming level: "+d.level,
        "Parent/guardian: "+d.parent,"Phone: "+d.phone,"Email: "+d.email,
        "Emergency contact: "+d.emergency,"Medical notes: "+(d.medical||"None"),
        "Waiver accepted: yes"].join("\n");
      if(S.payment.enabled){ /* Paystack hook: open checkout here, then send msg on success */ }
      var url = S.registration.mode==="email"
        ? "mailto:"+S.email+"?subject="+encodeURIComponent("Swim registration: "+d.swimmer)+"&body="+encodeURIComponent(msg)
        : "https://wa.me/"+S.whatsapp+"?text="+encodeURIComponent(msg);
      document.getElementById("done").hidden = false;
      document.getElementById("done-link").href = url;
      location.href = url;
    });
  }
})();
