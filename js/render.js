async function crearCard(evento) {
  const div = document.createElement("div");

  div.style.border = "1px solid #ccc";
  div.style.padding = "10px";
  div.style.margin = "10px";
  div.style.borderRadius = "8px";

  div.innerHTML = `
    <h3>${evento.name}</h3>
    <p>📅 ${evento.date}</p>
    <p>💰 $${evento.price}</p>
  `;

  return div;
}
