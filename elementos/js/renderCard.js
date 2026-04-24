async function crearCard(evento) {
  const res = await fetch("elementos/card_evento.html");
  const html = await res.text();

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  wrapper.querySelector(".title").textContent = evento.name;
  wrapper.querySelector(".date").textContent = "📅 " + evento.date;
  wrapper.querySelector(".price").textContent = "💰 $" + evento.price;

  return wrapper.firstElementChild;
}
