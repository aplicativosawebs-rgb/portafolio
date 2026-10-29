/**
 * GI Desarrollo - Cálculo automático de precios
 * ------------------------------------------------------------
 * Fórmula:
 *   valor hora = SMMLV / HORAS_MES
 *   precio     = horas del servicio × valor hora × (1 + MARGEN)
 *   (redondeado al múltiplo de REDONDEO más cercano)
 *
 * Cada año solo hay que agregar UNA línea en SMMLV con el nuevo
 * salario mínimo. El script usa el del año actual y, si aún no
 * existe, el más reciente disponible.
 *
 * Uso en el HTML:
 *   <div data-horas="40"></div>                 -> $366.000
 *   <div data-horas="40" data-desde></div>      -> $366.000+
 *   <span data-horas="24" data-horas-max="48">  -> $220.000 - $440.000
 *   <span data-smmlv></span>                    -> salario mínimo usado
 *   <span data-smmlv-anio></span>               -> año del salario usado
 *   <span data-valor-hora></span>               -> valor hora base (sin margen)
 */
(function () {
  "use strict";

  const CONFIG = {
    // Salario mínimo mensual legal vigente (COP) por año.
    // Agregar aquí el del nuevo año cuando se decrete.
    SMMLV: {
      2025: 1423500,
      2026: 1750905,
    },
    HORAS_MES: 210, // 42 h semanales (jornada vigente desde 15-jul-2026)
    MARGEN: 0.1, // 10 %
    REDONDEO: 5000, // redondeo del precio final
  };

  function obtenerSmmlv() {
    const anioActual = new Date().getFullYear();
    const anios = Object.keys(CONFIG.SMMLV)
      .map(Number)
      .sort((a, b) => a - b);

    let anio = anios.filter((a) => a <= anioActual).pop();
    if (anio === undefined) anio = anios[0];

    return { anio: anio, valor: CONFIG.SMMLV[anio] };
  }

  const { anio, valor: smmlv } = obtenerSmmlv();
  const valorHora = smmlv / CONFIG.HORAS_MES;

  function precioPorHoras(horas) {
    const bruto = horas * valorHora * (1 + CONFIG.MARGEN);
    return Math.round(bruto / CONFIG.REDONDEO) * CONFIG.REDONDEO;
  }

  function formatoCOP(valor) {
    return "$" + Math.round(valor).toLocaleString("es-CO");
  }

  function pintarPrecios() {
    document.querySelectorAll("[data-horas]").forEach(function (el) {
      const horas = parseFloat(el.getAttribute("data-horas"));
      if (isNaN(horas)) return;

      let texto = formatoCOP(precioPorHoras(horas));

      const max = parseFloat(el.getAttribute("data-horas-max"));
      if (!isNaN(max)) {
        texto += " - " + formatoCOP(precioPorHoras(max));
      } else if (el.hasAttribute("data-desde")) {
        texto += "+";
      }

      el.textContent = texto;
    });

    document.querySelectorAll("[data-smmlv]").forEach(function (el) {
      el.textContent = formatoCOP(smmlv);
    });
    document.querySelectorAll("[data-smmlv-anio]").forEach(function (el) {
      el.textContent = anio;
    });
    document.querySelectorAll("[data-valor-hora]").forEach(function (el) {
      el.textContent = formatoCOP(valorHora);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", pintarPrecios);
  } else {
    pintarPrecios();
  }
})();