document.addEventListener("DOMContentLoaded", () => {
  const TIEMPO_TOTAL_SEGUNDOS = 30;
  const cronometroEl = document.getElementById("cronometro");
  const barraTiempoEl = document.getElementById("barra-tiempo");
  const btnSiguiente = document.getElementById("btnConfirmar");
  const panelEstado = document.getElementById("panel-estado"); // Seleccionamos la tarjeta derecha

  let tiempoRestanteMs = TIEMPO_TOTAL_SEGUNDOS * 1000;
  let ultimoFrame = performance.now();
  let tiempoTerminado = false;

  const formatearTiempo = (ms) => {
    const totalSegundos = Math.ceil(ms / 1000);
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;
    return `${minutos}:${String(segundos).padStart(2, "0")}`;
  };

  const actualizarTemporizador = (ahora) => {
    if (tiempoTerminado) return;

    const delta = ahora - ultimoFrame;
    ultimoFrame = ahora;
    tiempoRestanteMs -= delta;

    if (tiempoRestanteMs <= 0) {
      tiempoRestanteMs = 0;
      tiempoTerminado = true;

      if (cronometroEl) cronometroEl.textContent = "0:00";
      if (barraTiempoEl) barraTiempoEl.style.width = "0%";
      if (btnSiguiente) btnSiguiente.classList.remove("deshabilitado");
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
  const tarjetas = document.querySelectorAll(".convertir_imgs .tarjeta2:not(.tarjeta2_cuqui)");
  const textoContador = document.getElementById("contador-convertidas");
  const totalImagenes = tarjetas.length;
  let convertidas = 0;

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
      if (tiempoTerminado || yaConvertida || (e.button !== undefined && e.button !== 0)) return;

      tarjeta.classList.add("manteniendo");

      temporizador = setTimeout(() => {
        yaConvertida = true;
        tarjeta.classList.remove("manteniendo");
        tarjeta.classList.add("convertida");

        convertidas++;
        if (textoContador) {
          textoContador.innerHTML = `${convertidas}<span class="total-chico">/${totalImagenes}</span>`;
        }

        // Si ya convirtió todas (6/6), ponemos la tarjeta derecha en verde y mostramos "¡Lo has logrado!"
        if (convertidas === totalImagenes && panelEstado) {
          panelEstado.classList.add("completado");
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