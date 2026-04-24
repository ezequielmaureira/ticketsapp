async function crearCard(evento) {
  const res = await fetch("elementos/card_evento.html");

  const html = await res.text();

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  const card = wrapper.firstElementChild;

  card.querySelector(".title").textContent = evento.name;
  card.querySelector(".date").textContent = "📅 " + evento.date;
  card.querySelector(".price").textContent = "💰 $" + evento.price;

  return card;
}
