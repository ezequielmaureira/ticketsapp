async function crearCard(evento) {
  const div = document.createElement("div");

  div.style.border = "1px solid #ccc";
  div.style.padding = "10px";
  div.style.margin = "10px";
  div.style.borderRadius = "8px";
  div.style.background = "#f9f9f9";

  div.innerHTML = `
    <h3>🎫 ${evento.name}</h3>
    <p>📅 ${evento.date}</p>
    <p>💰 $${evento.price}</p>
  `;

  return div;
}
