
(() => {
  "use strict";

  function iniciarSlideshow() {
    document.querySelectorAll(".gallery").forEach((galeria) => {
      const fotos = Array.from(
        galeria.querySelectorAll(".photo, .photo-frame, figure, img")
      );

      // Evita contar imagens dentro de uma mesma foto duas vezes.
      const unicas = fotos.filter((foto, i, lista) =>
        !lista.some((outra, j) =>
          j !== i && outra.contains(foto)
        )
      );

      if (unicas.length < 2) return;

      let atual = 0;

      unicas.forEach((foto, i) => {
        foto.style.transition = "opacity 0.5s ease";
        foto.style.opacity = i === 0 ? "1" : "0";
        foto.style.display = i === 0 ? "" : "none";
      });

      setInterval(() => {
        const anterior = unicas[atual];
        const proximoIndice = (atual + 1) % unicas.length;
        const proxima = unicas[proximoIndice];

        anterior.style.opacity = "0";

        setTimeout(() => {
          anterior.style.display = "none";
          proxima.style.display = "";
          proxima.style.opacity = "0";

          requestAnimationFrame(() => {
            proxima.style.opacity = "1";
          });

          atual = proximoIndice;
        }, 500);
      }, 3000);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarSlideshow);
  } else {
    iniciarSlideshow();
  }
})();
