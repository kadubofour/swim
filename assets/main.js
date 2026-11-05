(function(){
  var S = window.SITE, page = document.body.dataset.page || "";
  document.documentElement.classList.add("js");
  var wave = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M2 12c3-4 6-4 9 0s6 4 9 0 6-4 10 0"/><path d="M2 20c3-4 6-4 9 0s6 4 9 0 6-4 10 0"/></svg>';
  var money = function(v){return S.currency+" "+v.toLocaleString()};
  var esc = function(t){return String(t).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
  var links = [["index.html","Home","home"],["about.html","About","about"],["programs.html","Programs","programs"],["faq.html","FAQ & Contact","faq"]];
  var nav = links.map(function(l){return '<a href="'+l[0]+'"'+(l[2]===page?' aria-current="page"':'')+'>'+l[1]+'</a>'}).join("");
  document.getElementById("site-header").innerHTML =
    '<a class="skip" href="#main">Skip to content</a><header class="site"><div class="wrap"><a class="brand" href="index.html">'+wave+esc(S.name)+'</a>'+
    '<button class="menu" aria-label="Toggle menu" aria-expanded="false">Menu</button>'+
    '<nav aria-label="Main">'+nav+'<a class="btn" href="register.html">Register</a></nav></div></header>';
  var hd = document.querySelector("header.site"), m = document.querySelector(".menu"), n = document.querySelector("header nav");
  var onScroll = function(){hd.classList.toggle("solid", window.scrollY>40)}; onScroll(); addEventListener("scroll", onScroll, {passive:true});
  m.onclick = function(){var o=n.classList.toggle("open");m.setAttribute("aria-expanded",o);m.textContent=o?"Close":"Menu"};
  n.addEventListener("click",function(e){if(e.target.tagName==="A"){n.classList.remove("open");m.textContent="Menu"}});
  document.getElementById("site-footer").innerHTML =
    '<footer class="site"><div class="wrap"><div class="cols"><div><a class="brand" href="index.html">'+wave+esc(S.name)+'</a><p>'+esc(S.tagline)+'</p></div>'+
    '<div><h4>Explore</h4>'+links.map(function(l){return '<a href="'+l[0]+'">'+l[1]+'</a><br>'}).join("")+'<a href="register.html">Register</a></div>'+
    '<div><h4>Contact</h4>'+esc(S.location)+'<br><a href="tel:'+S.phone.replace(/\s/g,"")+'">'+esc(S.phone)+'</a><br><a href="mailto:'+esc(S.email)+'">'+esc(S.email)+'</a></div></div>'+
    '<div class="copy">© '+new Date().getFullYear()+' '+esc(S.name)+'. All rights reserved.</div></div></footer>';
  document.querySelectorAll("[data-site]").forEach(function(el){el.textContent=S[el.dataset.site]});
  document.querySelectorAll("[data-bg]").forEach(function(el){el.style.backgroundImage="url("+el.dataset.bg+")"});

  var list = document.getElementById("program-list");
  if(list) list.innerHTML = S.programs.map(function(p){
    return '<a class="pc rv" href="register.html?program='+p.id+'"><img src="'+p.img+'" alt="" loading="lazy">'+
      '<div class="tags"><span class="tag">'+esc(p.ages)+'</span><span class="tag">'+esc(p.level)+'</span></div>'+
      '<div class="body"><h3>'+esc(p.name)+'</h3><p>'+esc(p.desc)+'</p><div class="meta">'+esc(p.schedule)+' · up to '+p.spots+' swimmers</div>'+
      '<div class="row"><span class="price">'+money(p.price)+'</span><span class="go">Register</span></div></div></a>'}).join("");
  var tb = document.getElementById("schedule-body");
  if(tb) tb.innerHTML = S.programs.map(function(p){
    return '<tr><td><strong>'+esc(p.name)+'</strong></td><td>'+esc(p.ages)+'</td><td>'+esc(p.level)+'</td><td>'+esc(p.schedule)+'</td><td class="p">'+money(p.price)+'</td></tr>'}).join("");

  if("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.12});
    document.querySelectorAll(".rv").forEach(function(el){io.observe(el)});
  } else document.querySelectorAll(".rv").forEach(function(el){el.classList.add("in")});

  var sel = document.getElementById("program");
  if(sel){
    sel.innerHTML = '<option value="">Choose a program…</option>'+S.programs.map(function(p){
      return '<option value="'+p.id+'">'+esc(p.name)+' ('+esc(p.ages)+') - '+money(p.price)+' - '+esc(p.schedule)+'</option>'}).join("");
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
      if(S.payment.enabled){ /* Paystack hook: open checkout here, then save + send on success */ }
      var url = S.registration.mode==="email"
        ? "mailto:"+S.email+"?subject="+encodeURIComponent("Swim registration: "+d.swimmer)+"&body="+encodeURIComponent(msg)
        : "https://wa.me/"+S.whatsapp+"?text="+encodeURIComponent(msg);
      var st = document.getElementById("status"), btn = f.querySelector("button[type=submit]");
      var notify = function(){
        document.getElementById("done").hidden = false;
        document.getElementById("done-link").href = url;
        location.href = url;
      };
      if(!S.registration.save){ notify(); return; }
      btn.disabled = true; st.hidden = false; st.textContent = "Saving your registration…";
      fetch(S.registration.save, {method:"POST", body:new FormData(f)})
        .then(function(r){return r.json().then(function(j){return {ok:r.ok&&j.ok, j:j}})})
        .then(function(res){
          if(!res.ok) throw new Error(res.j.error||"Could not save");
          st.textContent = "Registration saved. Now send us the message that opens so we can confirm your spot.";
          notify();
        })
        .catch(function(err){
          btn.disabled = false;
          st.textContent = "We couldn't save your registration automatically ("+err.message+"). Please send it to us directly with the link below.";
          notify();
        });
    });
  }
})();
