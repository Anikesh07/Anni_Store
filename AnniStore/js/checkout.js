if (localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "login.html";
}



const btn = document.getElementById("placeOrderBtn");

btn.onclick = () => {

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  if(!name || !phone || !address){
    alert("Please fill address details");
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  if(cart.length === 0){
    alert("Your cart is empty");
    return;
  }

  const orders = JSON.parse(localStorage.getItem("orders") || "[]");

  orders.push({
    date: new Date().toLocaleString(),
    address:{
      name, phone, address
    },
    items: cart
  });

  localStorage.setItem("orders", JSON.stringify(orders));
  localStorage.removeItem("cart");

  alert("Order placed successfully!");

  window.location.href = "index.html";
};
