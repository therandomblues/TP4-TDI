document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Lectura del resultado (si estamos en la pantalla siguiente) ---
  const resultadoEl = document.getElementById("resultado-vos");
  if (resultadoEl) {
    const cantidad = Number(sessionStorage.getItem("imagenesConvertidas")) || 0;
    resultadoEl.textContent = cantidad === 1 ? "1 imagen" : `${cantidad} imágenes`;
  }

  // --- 2. Lógica del minijuego (solo se ejecuta si están las tarjetas en pantalla) ---
  const tarjetas = document.querySelectorAll(".convertir_imgs .tarjeta2:not(.tarjeta2_cuqui)");
  if (tarjetas.length === 0) return;

  const TIEMPO_TOTAL_SEGUNDOS = 30;
  const cronometroEl = document.getElementById("cronometro");
  const barraTiempoEl = document.getElementById("barra-tiempo");
  const btnSiguiente = document.getElementById("btnConfirmar");
  const panelEstado = document.getElementById("panel-estado");
  const contenedorImgs = document.querySelector(".convertir_imgs");

  let tiempoRestanteMs = TIEMPO_TOTAL_SEGUNDOS * 1000;
  let ultimoFrame = performance.now();
  let juegoTerminado = false;

  const formatearTiempo = (ms) => {
    const totalSegundos = Math.ceil(ms / 1000);
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;
    return `${minutos}:${String(segundos).padStart(2, "0")}`;
  };

  const actualizarTemporizador = (ahora) => {
    if (juegoTerminado) return;

    const delta = ahora - ultimoFrame;
    ultimoFrame = ahora;
    tiempoRestanteMs -= delta;

    if (tiempoRestanteMs <= 0) {
      tiempoRestanteMs = 0;
      juegoTerminado = true;

      if (cronometroEl) cronometroEl.textContent = "0:00";
      if (barraTiempoEl) barraTiempoEl.style.width = "0%";
      if (panelEstado) panelEstado.classList.add("tiempo-agotado");
      if (contenedorImgs) contenedorImgs.classList.add("tiempo-agotado");
      if (btnSiguiente) btnSiguiente.classList.remove("deshabilitado");

      // Cancela visualmente cualquier imagen que se estuviera manteniendo apretada justo al terminar
      tarjetas.forEach((t) => t.classList.remove("manteniendo"));
      return;
    }

    if (cronometroEl) {
      cronometroEl.textContent = formatearTiempo(tiempoRestanteMs);
    }

    if (barraTiempoEl) {
      const porcentaje = (tiempoRestanteMs / (TIEMPO_TOTAL_SEGUNDOS * 1000)) * 100;
      barraTiempoEl.style.width = `${porcentaje}%`;
    }

    requestAnimationFrame(actualizarTemporizador);
  };

  requestAnimationFrame(actualizarTemporizador);

  // --- Lógica de las tarjetas ---
  const textoContador = document.getElementById("contador-convertidas");
  const totalImagenes = tarjetas.length;
  let convertidas = 0;
  sessionStorage.setItem("imagenesConvertidas", 0);

  tarjetas.forEach((tarjeta) => {
    const imgOriginal = tarjeta.querySelector("img[data-reemplazo]");
    if (!imgOriginal) return;

    const imgGhibli = document.createElement("img");
    imgGhibli.src = imgOriginal.dataset.reemplazo;
    imgGhibli.alt = imgOriginal.alt || "";
    imgGhibli.classList.add("img-ghibli");
    tarjeta.appendChild(imgGhibli);

    let temporizador = null;
    let yaConvertida = false;

    const iniciarCarga = (e) => {
      if (juegoTerminado || yaConvertida || (e.button !== undefined && e.button !== 0)) return;

      tarjeta.classList.add("manteniendo");

      temporizador = setTimeout(() => {
        if (juegoTerminado) {
          tarjeta.classList.remove("manteniendo");
          return;
        }

        yaConvertida = true;
        tarjeta.classList.remove("manteniendo");
        tarjeta.classList.add("convertida");

        convertidas++;
        sessionStorage.setItem("imagenesConvertidas", convertidas);

        if (textoContador) {
          textoContador.innerHTML = `${convertidas}<span class="total-chico">/${totalImagenes}</span>`;
        }

        if (convertidas === totalImagenes) {
          juegoTerminado = true;
          if (panelEstado) panelEstado.classList.add("completado");
          if (btnSiguiente) btnSiguiente.classList.remove("deshabilitado");
        }
      }, 1000);
    };

    const cancelarCarga = () => {
      if (yaConvertida) return;
      clearTimeout(temporizador);
      tarjeta.classList.remove("manteniendo");
    };

    tarjeta.addEventListener("pointerdown", iniciarCarga);
    tarjeta.addEventListener("pointerup", cancelarCarga);
    tarjeta.addEventListener("pointerleave", cancelarCarga);
    tarjeta.addEventListener("pointercancel", cancelarCarga);
  });
});