import React from "react";

function ProductCard(props) {
  return (
    <div style={cardStyle}>
      
      <img 
        src={props.product.image || "https://via.placeholder.com/100"} 
        alt="product" 
        style={imageStyle} 
      />

      <h3>{props.product.name}</h3>
      <p>{props.product.description}</p>
      <p>₦{props.product.price}</p>

      <button onClick={() => props.addToCart(props.product)}>
        Add To Cart
      </button>

      <button style={wishlistBtn}>
        Add To Wishlist
      </button>

    </div>
  );
}

const cardStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  margin: "10px",
  borderRadius: "8px",
  backgroundColor: "#ffffff"
};

const imageStyle = {
  width: "100px",
  height: "100px",
  backgroundColor: "#ddd"
};

const wishlistBtn = {
  marginLeft: "10px",
  backgroundColor: "#0f172a",
  color: "#fff",
  border: "none",
  padding: "5px"
};

export default ProductCard;