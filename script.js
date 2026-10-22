(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const nav = $(".nav"),
    toggle = $(".nav-toggle");
  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open);
  };
  toggle.addEventListener("click", () =>
    setMenu(!nav.classList.contains("open")),
  );
  $$(".menu a").forEach((a) =>
    a.addEventListener("click", () => setMenu(false)),
  );

  const links = $$(".menu a");
  const spy = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting)
          links.forEach((l) =>
            l.classList.toggle("active", l.hash === "#" + e.target.id),
          );
      }),
    { rootMargin: "-45% 0px -50% 0px" },
  );
  $$("main section[id]").forEach((s) => spy.observe(s));

  const chips = $$(".filter button"),
    projects = $$(".project");
  chips.forEach((b) =>
    b.addEventListener("click", () => {
      chips.forEach((c) => c.setAttribute("aria-pressed", c === b));
      projects.forEach((p) => {
        p.hidden = b.dataset.f !== "all" && p.dataset.type !== b.dataset.f;
      });
    }),
  );

  $("#year").textContent = new Date().getFullYear();

  const form = $("#contact-form");
  if (form) {
    const note = $(".form-note", form);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nama = form.nama.value.trim();
      const email = form.email.value.trim();
      const pesan = form.pesan.value.trim();
      if (!nama || !email || !pesan) {
        note.textContent = "Lengkapi nama, email, dan pesan dulu ya.";
        note.classList.remove("ok");
        return;
      }
      const subject = encodeURIComponent("Pesan portofolio dari " + nama);
      const body = encodeURIComponent(
        pesan + "\n\nDari: " + nama + " <" + email + ">",
      );
      window.location.href =
        "mailto:darrelsyadid@email.com?subject=" + subject + "&body=" + body;
      note.textContent =
        "Terima kasih, " + nama + "! Aplikasi email kamu akan terbuka.";
      note.classList.add("ok");
      form.reset();
    });
  }

  initCard();

  function initCard() {
    const stage = $("#card-stage");
    if (!stage) return;
    if (!window.THREE) {
      stage.classList.add("no3d");
      return;
    }

    const T = THREE,
      d = stage.dataset;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const CW = 3.6,
      CH = 5,
      N = 6,
      SEG = 0.75,
      S = 40,
      STRAP = 0.4;

    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    stage.prepend(renderer.domElement);
    const dom = renderer.domElement;
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(30, 1, 1, 100);
    cam.position.z = 24;
    const top = Math.tan(T.MathUtils.degToRad(15)) * 24 + 0.6;

    const P = [];
    let y = top;
    for (let i = 0; i <= N + 1; i++) {
      const kick = reduce ? 0 : (0.05 * i) / N;
      P.push({ x: 0, y, ox: -kick, oy: y });
      y -= i < N ? SEG : CH;
    }

    const group = new T.Group(),
      flip = new T.Object3D();
    group.add(flip);
    scene.add(group);
    const fm = new T.MeshBasicMaterial({ transparent: true, alphaTest: 0.02 });
    const bm = new T.MeshBasicMaterial({ transparent: true, alphaTest: 0.02 });
    const geo = new T.PlaneGeometry(CW, CH);
    const front = new T.Mesh(geo, fm),
      back = new T.Mesh(geo, bm);
    front.position.z = 0.01;
    back.position.z = -0.01;
    back.rotation.y = Math.PI;
    const ring = new T.Mesh(
      new T.TorusGeometry(0.2, 0.06, 10, 24),
      new T.MeshBasicMaterial({ color: 0xaab4d8 }),
    );
    ring.position.y = CH / 2 + 0.05;
    flip.add(front, back, ring);

    const rg = new T.BufferGeometry();
    const pos = new Float32Array((S + 1) * 6),
      uv = new Float32Array((S + 1) * 4),
      idx = [];
    for (let i = 0; i < S; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    rg.setIndex(idx);
    rg.setAttribute("position", new T.BufferAttribute(pos, 3));
    rg.setAttribute("uv", new T.BufferAttribute(uv, 2));
    const rm = new T.MeshBasicMaterial({ side: T.DoubleSide });
    const ribbon = new T.Mesh(rg, rm);
    ribbon.frustumCulled = false;
    scene.add(ribbon);

    const rr = (x, a, b, w, h, r) => {
      x.beginPath();
      x.roundRect ? x.roundRect(a, b, w, h, r) : x.rect(a, b, w, h);
    };
    const F = "Figtree, sans-serif",
      D = '"Bricolage Grotesque", Figtree, sans-serif';
    const face = (isBack, img) => {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 720;
      const x = c.getContext("2d");
      rr(x, 0, 0, 512, 720, 36);
      x.clip();
      const g = x.createLinearGradient(0, 0, 512, 720);
      g.addColorStop(0, "#2b63c4");
      g.addColorStop(1, "#071026");
      x.fillStyle = g;
      x.fillRect(0, 0, 512, 720);
      x.fillStyle = "#ffc84a";
      x.fillRect(0, 0, 512, 14);
      x.fillStyle = "#fff";
      x.font = "600 24px " + F;
      x.fillText(d.school, 36, 62, 440);
      if (!isBack) {
        x.save();
        rr(x, 36, 92, 440, 420, 24);
        x.clip();
        if (img) {
          const s = Math.max(440 / img.width, 420 / img.height);
          x.drawImage(
            img,
            36 + (440 - img.width * s) / 2,
            92 + (420 - img.height * s) / 2,
            img.width * s,
            img.height * s,
          );
        } else {
          x.fillStyle = "#173a7a";
          x.fillRect(36, 92, 440, 420);
          x.fillStyle = "#ffc84a";
          x.font = "800 170px " + D;
          x.textAlign = "center";
          x.fillText(
            d.name
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join(""),
            256,
            360,
          );
        }
        x.restore();
        x.textAlign = "left";
        x.fillStyle = "#fff";
        x.font = "800 54px " + D;
        x.fillText(d.name, 36, 580, 440);
        x.fillStyle = "#9aa5cf";
        x.font = "500 26px " + F;
        x.fillText(d.major, 36, 620, 440);
        x.fillStyle = "#ffc84a";
        rr(x, 36, 646, 250, 44, 22);
        x.fill();
        x.fillStyle = "#1a1400";
        x.font = "600 22px " + F;
        x.fillText(d.status, 54, 676, 214);
      } else {
        x.fillStyle = "#fff";
        x.font = "800 44px " + D;
        x.fillText("Kartu Siswa", 36, 150);
        [
          ["Nama", d.name],
          ["Jurusan", d.major],
          ["Email", d.email],
          ["WhatsApp", d.wa],
        ].forEach(([k, v], i) => {
          x.fillStyle = "#9aa5cf";
          x.font = "500 24px " + F;
          x.fillText(k, 36, 230 + i * 96);
          x.fillStyle = "#fff";
          x.font = "600 30px " + F;
          x.fillText(v, 36, 268 + i * 96, 440);
        });
      }
      return c;
    };

    const build = (img) => {
      let f = face(false, img);
      try {
        f.getContext("2d").getImageData(0, 0, 1, 1);
      } catch (e) {
        console.warn(
          "Foto tidak bisa dipakai di file://. Buka lewat Live Server agar foto tampil di kartu.",
        );
        f = face(false, null);
      }
      [
        [fm, f],
        [bm, face(true)],
      ].forEach(([m, c]) => {
        if (m.map) m.map.dispose();
        m.map = new T.CanvasTexture(c);
        m.map.encoding = T.sRGBEncoding;
        m.map.anisotropy = 8;
        m.needsUpdate = true;
      });
      const sc = document.createElement("canvas");
      sc.width = 512;
      sc.height = 64;
      const sx = sc.getContext("2d");
      sx.fillStyle = "#0a0a10";
      sx.fillRect(0, 0, 512, 64);
      sx.fillStyle = "#ffc84a";
      sx.font = "800 28px " + F;
      sx.textBaseline = "middle";
      sx.fillText(
        (d.name + "  •  " + d.school + "  •  ").toUpperCase(),
        14,
        34,
        484,
      );
      if (rm.map) rm.map.dispose();
      rm.map = new T.CanvasTexture(sc);
      rm.map.encoding = T.sRGBEncoding;
      rm.map.wrapS = T.RepeatWrapping;
      rm.needsUpdate = true;
    };

    const photo = new Promise((res) => {
      if (!d.photo) return res(null);
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => res(null);
      im.src = d.photo;
    });
    Promise.all([document.fonts.ready, photo]).then(([, im]) => build(im));

    let drag = null,
      ry = 0,
      ryV = 0,
      flipT = 0,
      prevX = 0;
    const step = () => {
      const dt = 1 / 60;
      for (let i = 1; i < P.length; i++) {
        const p = P[i],
          vx = (p.x - p.ox) * 0.992,
          vy = (p.y - p.oy) * 0.992;
        p.ox = p.x;
        p.oy = p.y;
        p.x += vx;
        p.y += vy - 40 * dt * dt;
      }
      if (drag) {
        const b = P[N + 1];
        b.x += (drag.x - b.x) * 0.4;
        b.y += (drag.y - b.y) * 0.4;
      }
      for (let k = 0; k < 10; k++) {
        P[0].x = 0;
        P[0].y = top;
        for (let i = 0; i < P.length - 1; i++) {
          const a = P[i],
            b = P[i + 1],
            L = i < N ? SEG : CH;
          const dx = b.x - a.x,
            dy = b.y - a.y,
            dist = Math.hypot(dx, dy) || 1e-4,
            df = (dist - L) / dist;
          if (i === 0) {
            b.x -= dx * df;
            b.y -= dy * df;
          } else {
            a.x += (dx * df) / 2;
            a.y += (dy * df) / 2;
            b.x -= (dx * df) / 2;
            b.y -= (dy * df) / 2;
          }
        }
      }
      const cx = (P[N].x + P[N + 1].x) / 2,
        vxCard = (cx - prevX) / dt;
      prevX = cx;
      const target = flipT + Math.max(-0.6, Math.min(0.6, vxCard * 0.08));
      ryV += ((target - ry) * 40 - ryV * 7) * dt;
      ry += ryV * dt;
    };

    const draw = () => {
      const A = P[N],
        B = P[N + 1];
      group.position.set((A.x + B.x) / 2, (A.y + B.y) / 2, 0.02);
      group.rotation.z = Math.atan2(B.x - A.x, -(B.y - A.y));
      flip.rotation.y = ry;
      const shade = 0.78 + 0.22 * Math.abs(Math.cos(ry));
      fm.color.setScalar(shade);
      bm.color.setScalar(shade);

      const pts = new T.CatmullRomCurve3(
        P.slice(0, N + 1).map((p) => new T.Vector3(p.x, p.y, 0)),
      ).getPoints(S);
      let len = 0;
      pts.forEach((p, i) => {
        const a = pts[Math.max(i - 1, 0)],
          b = pts[Math.min(i + 1, S)];
        const tx = b.x - a.x,
          ty = b.y - a.y,
          l = Math.hypot(tx, ty) || 1;
        const nx = ((-ty / l) * STRAP) / 2,
          ny = ((tx / l) * STRAP) / 2;
        if (i) len += p.distanceTo(pts[i - 1]);
        pos.set([p.x + nx, p.y + ny, 0, p.x - nx, p.y - ny, 0], i * 6);
        uv.set([len / 3.2, 0, len / 3.2, 1], i * 4);
      });
      rg.attributes.position.needsUpdate = true;
      rg.attributes.uv.needsUpdate = true;
    };

    const ray = new T.Raycaster(),
      m = new T.Vector2();
    const world = (e) => {
      const r = dom.getBoundingClientRect();
      m.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1,
      );
      ray.setFromCamera(m, cam);
      return ray.ray.at(
        -ray.ray.origin.z / ray.ray.direction.z,
        new T.Vector3(),
      );
    };
    const onCard = (e) => {
      world(e);
      return ray.intersectObjects([front, back]).length > 0;
    };
    const toggleFlip = () => {
      flipT = flipT ? 0 : Math.PI;
    };

    dom.addEventListener("pointerdown", (e) => {
      if (!onCard(e)) return;
      const w = world(e),
        b = P[N + 1];
      drag = { x: b.x, y: b.y, ox: b.x - w.x, oy: b.y - w.y };
      dom.setPointerCapture(e.pointerId);
      dom.style.cursor = "grabbing";
    });
    dom.addEventListener("pointermove", (e) => {
      if (drag) {
        const w = world(e);
        drag.x = w.x + drag.ox;
        drag.y = w.y + drag.oy;
      } else dom.style.cursor = onCard(e) ? "grab" : "default";
    });
    const release = () => {
      drag = null;
      dom.style.cursor = "grab";
    };
    dom.addEventListener("pointerup", release);
    dom.addEventListener("pointercancel", release);
    dom.addEventListener("dblclick", (e) => {
      if (onCard(e)) toggleFlip();
    });
    $(".flip", stage).addEventListener("click", toggleFlip);

    new ResizeObserver(() => {
      const w = stage.clientWidth,
        h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    }).observe(stage);

    let last = performance.now(),
      acc = 0,
      raf = 0,
      visible = true;
    const frame = (t) => {
      if (!visible) return;
      raf = requestAnimationFrame(frame);
      acc += Math.min(t - last, 50);
      last = t;
      while (acc >= 1000 / 60) {
        step();
        acc -= 1000 / 60;
      }
      draw();
      renderer.render(scene, cam);
    };
    new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was) {
        cancelAnimationFrame(raf);
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }).observe(stage);
    raf = requestAnimationFrame(frame);
  }
})();
