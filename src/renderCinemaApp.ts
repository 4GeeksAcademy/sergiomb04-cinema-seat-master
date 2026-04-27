type SeatPair = [number, number][] | null;
type RoomSummary = {
  id: string;
  nombre: string;
};

type RenderCinemaAppParams = {
  appRoot: HTMLElement;
  numeroFilas: number;
  numeroColumnas: number;
  asientos: number[][];
  mensaje: string;
  salas: RoomSummary[];
  activeSalaId: string;
  occupied: number;
  free: number;
  total: number;
  suggestion: SeatPair;
  onSelectSala: (salaId: string) => void;
  onCreateSala: (nombre: string) => void;
  onDeleteSala: (salaId: string) => void;
  onReset: () => void;
  onLoadExample: () => void;
  onSeatClick: (fila: number, columna: number) => void;
};

// Indica si un asiento forma parte de la sugerencia de dos contiguos.
function isSuggestedSeat(suggestion: SeatPair, fila: number, columna: number): boolean {
  if (!suggestion) return false;

  return suggestion.some(([row, col]) => row === fila && col === columna);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Renderiza el layout principal y dibuja el mapa SVG a partir del estado recibido.
export function renderCinemaApp(params: RenderCinemaAppParams) {
  const {
    appRoot,
    numeroFilas,
    numeroColumnas,
    asientos,
    mensaje,
    salas,
    activeSalaId,
    occupied,
    free,
    total,
    suggestion,
    onSelectSala,
    onCreateSala,
    onDeleteSala,
    onReset,
    onLoadExample,
    onSeatClick,
  } = params;

  const svgNs = "http://www.w3.org/2000/svg";
  const occupancy = ((occupied / total) * 100).toFixed(1);
  const roomsHtml = salas
    .map((sala) => {
      const activeClass = sala.id === activeSalaId
        ? "border-slate-900 bg-slate-900 text-white"
        : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100";

      return `
        <li class="flex gap-2">
          <button
            type="button"
            class="room-select-btn flex-1 rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${activeClass}"
            data-room-id="${sala.id}"
          >
            ${escapeHtml(sala.nombre)}
          </button>
          <button
            type="button"
            class="room-delete-btn rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            data-room-id="${sala.id}"
            ${salas.length === 1 ? "disabled" : ""}
          >
            Eliminar
          </button>
        </li>
      `;
    })
    .join("");

  appRoot.innerHTML = `
      <section class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
        <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 text-white">
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Mapa de Asientos del Cine</h1>
          <p class="mt-1 text-sm text-slate-300">Visualiza disponibilidad, reserva y restablece la sala.</p>
        </div>

        <div class="grid gap-6 p-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside class="space-y-4">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-700">Salas</h2>
              <div class="mt-3 flex gap-2">
                <input
                  id="new-room-input"
                  type="text"
                  maxlength="40"
                  class="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-500"
                  placeholder="Nombre de sala"
                />
                <button id="create-room-btn" class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
                  Crear
                </button>
              </div>

              <ul class="mt-3 space-y-2">${roomsHtml}</ul>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-700">Estado general</h2>
              <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div class="rounded-xl bg-emerald-100 p-3">
                  <p class="text-emerald-700">Libres</p>
                  <p class="text-xl font-bold text-emerald-900">${free}</p>
                </div>
                <div class="rounded-xl bg-rose-100 p-3">
                  <p class="text-rose-700">Ocupados</p>
                  <p class="text-xl font-bold text-rose-900">${occupied}</p>
                </div>
                <div class="col-span-2 rounded-xl bg-slate-200 p-3">
                  <p class="text-slate-700">Ocupacion</p>
                  <p class="text-xl font-bold text-slate-900">${occupancy}% (${occupied}/${total})</p>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-slate-200 p-4">
              <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-700">Leyenda</h2>
              <ul class="mt-3 space-y-2 text-sm text-slate-700">
                <li class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-emerald-500"></span>Libre</li>
                <li class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-rose-500"></span>Ocupado</li>
                <li class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-amber-400"></span>Pareja sugerida</li>
              </ul>
            </div>

            <div class="flex flex-wrap gap-2">
              <button id="reset-btn" class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
                Restablecer sala
              </button>
              <button id="example-btn" class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                Cargar ejemplo
              </button>
            </div>

            <p id="message" class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">${mensaje}</p>
          </aside>

          <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <svg id="seat-map" class="mx-auto h-auto min-w-[560px] max-w-full" role="img" aria-label="Mapa de asientos"></svg>
          </div>
        </div>
      </section>
    `;

  const resetBtn = appRoot.querySelector<HTMLButtonElement>("#reset-btn");
  const exampleBtn = appRoot.querySelector<HTMLButtonElement>("#example-btn");
  const createRoomBtn = appRoot.querySelector<HTMLButtonElement>("#create-room-btn");
  const newRoomInput = appRoot.querySelector<HTMLInputElement>("#new-room-input");
  const roomSelectButtons = appRoot.querySelectorAll<HTMLButtonElement>(".room-select-btn");
  const roomDeleteButtons = appRoot.querySelectorAll<HTMLButtonElement>(".room-delete-btn");
  const seatMap = appRoot.querySelector<SVGSVGElement>("#seat-map");

  if (createRoomBtn) {
    createRoomBtn.addEventListener("click", () => {
      onCreateSala(newRoomInput?.value ?? "");
      if (newRoomInput) newRoomInput.value = "";
    });
  }

  if (newRoomInput) {
    newRoomInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      onCreateSala(newRoomInput.value);
      newRoomInput.value = "";
    });
  }

  roomSelectButtons.forEach((button) => {
    const salaId = button.dataset.roomId;
    if (!salaId) return;

    button.addEventListener("click", () => onSelectSala(salaId));
  });

  roomDeleteButtons.forEach((button) => {
    const salaId = button.dataset.roomId;
    if (!salaId) return;

    button.addEventListener("click", () => onDeleteSala(salaId));
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", onReset);
  }

  if (exampleBtn) {
    exampleBtn.addEventListener("click", onLoadExample);
  }

  if (!seatMap) return;

  const seatWidth = 34;
  const seatHeight = 42;
  const seatGap = 10;
  const marginX = 40;
  const marginY = 76;

  const svgWidth = marginX * 2 + numeroColumnas * (seatWidth + seatGap) - seatGap;
  const svgHeight = marginY + numeroFilas * (seatHeight + seatGap) + 42;

  seatMap.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
  seatMap.setAttribute("width", `${svgWidth}`);
  seatMap.setAttribute("height", `${svgHeight}`);
  seatMap.innerHTML = "";

  const screen = document.createElementNS(svgNs, "rect");
  screen.setAttribute("x", "80");
  screen.setAttribute("y", "18");
  screen.setAttribute("rx", "10");
  screen.setAttribute("width", `${svgWidth - 160}`);
  screen.setAttribute("height", "14");
  screen.setAttribute("fill", "#1e293b");
  screen.setAttribute("opacity", "0.9");
  seatMap.appendChild(screen);

  const screenLabel = document.createElementNS(svgNs, "text");
  screenLabel.setAttribute("x", `${svgWidth / 2}`);
  screenLabel.setAttribute("y", "52");
  screenLabel.setAttribute("text-anchor", "middle");
  screenLabel.setAttribute("font-size", "12");
  screenLabel.setAttribute("font-weight", "700");
  screenLabel.setAttribute("fill", "#334155");
  screenLabel.textContent = "PANTALLA";
  seatMap.appendChild(screenLabel);

  for (let i = 0; i < numeroFilas; i++) {
    const rowLabel = document.createElementNS(svgNs, "text");
    rowLabel.setAttribute("x", "14");
    rowLabel.setAttribute("y", `${marginY + i * (seatHeight + seatGap) + seatHeight * 0.72}`);
    rowLabel.setAttribute("font-size", "12");
    rowLabel.setAttribute("font-weight", "700");
    rowLabel.setAttribute("fill", "#475569");
    rowLabel.textContent = String.fromCharCode(65 + i);
    seatMap.appendChild(rowLabel);

    for (let j = 0; j < numeroColumnas; j++) {
      const x = marginX + j * (seatWidth + seatGap);
      const y = marginY + i * (seatHeight + seatGap);
      const seatCode = `${String.fromCharCode(65 + i)}${j + 1}`;

      const group = document.createElementNS(svgNs, "g");

      const ocupado = asientos[i][j] === 1;
      const suggested = !ocupado && isSuggestedSeat(suggestion, i, j);

      const fill = ocupado ? "#f43f5e" : suggested ? "#facc15" : "#10b981";
      const stroke = ocupado ? "#be123c" : suggested ? "#ca8a04" : "#047857";

      const seat = document.createElementNS(svgNs, "rect");
      seat.setAttribute("x", `${x}`);
      seat.setAttribute("y", `${y}`);
      seat.setAttribute("rx", "7");
      seat.setAttribute("width", `${seatWidth}`);
      seat.setAttribute("height", `${seatHeight}`);
      seat.setAttribute("fill", fill);
      seat.setAttribute("stroke", stroke);
      seat.setAttribute("stroke-width", "1.5");

      group.style.cursor = "pointer";
      group.addEventListener("click", () => onSeatClick(i, j));

      const iconHead = document.createElementNS(svgNs, "circle");
      iconHead.setAttribute("cx", `${x + seatWidth / 2}`);
      iconHead.setAttribute("cy", `${y + 11}`);
      iconHead.setAttribute("r", "4.2");
      iconHead.setAttribute("fill", ocupado ? "#fff1f2" : "#ecfdf5");

      const iconBody = document.createElementNS(svgNs, "rect");
      iconBody.setAttribute("x", `${x + seatWidth / 2 - 6}`);
      iconBody.setAttribute("y", `${y + 16.5}`);
      iconBody.setAttribute("width", "12");
      iconBody.setAttribute("height", "9");
      iconBody.setAttribute("rx", "3");
      iconBody.setAttribute("fill", ocupado ? "#fff1f2" : "#ecfdf5");

      const seatLabel = document.createElementNS(svgNs, "text");
      seatLabel.setAttribute("x", `${x + seatWidth / 2}`);
      seatLabel.setAttribute("y", `${y + seatHeight - 7}`);
      seatLabel.setAttribute("text-anchor", "middle");
      seatLabel.setAttribute("font-size", "10.5");
      seatLabel.setAttribute("font-weight", "800");
      seatLabel.setAttribute("fill", ocupado ? "#fff1f2" : "#062e27");
      seatLabel.textContent = seatCode;

      const tooltip = document.createElementNS(svgNs, "title");
      const estado = ocupado ? "Ocupado" : suggested ? "Libre (sugerido)" : "Libre";
      tooltip.textContent = `Asiento ${seatCode}: ${estado}`;

      group.appendChild(tooltip);
      group.appendChild(seat);
      group.appendChild(iconHead);
      group.appendChild(iconBody);
      group.appendChild(seatLabel);
      seatMap.appendChild(group);
    }
  }
}
